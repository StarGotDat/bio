const express = require('express');
const router = express.Router();
const winston = require('winston');

// Configure logger for this module
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'heartbeat-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// In-memory storage for callbacks and heartbeat state
let callbacks = [];
let heartbeatState = {
  status: 'ok',
  lastHeartbeat: new Date().toISOString(),
  isLockedDown: false,
  lockdownReason: null,
  lockdownTimestamp: null
};

const HEARTBEAT_THRESHOLD = parseInt(process.env.HEARTBEAT_THRESHOLD) || 30000;
const HEARTBEAT_CHECK_INTERVAL = parseInt(process.env.HEARTBEAT_CHECK_INTERVAL) || 5000;

// Heartbeat monitoring function
function checkHeartbeat() {
  const now = new Date();
  const lastHeartbeat = new Date(heartbeatState.lastHeartbeat);
  const timeSinceLastHeartbeat = now - lastHeartbeat;

  if (timeSinceLastHeartbeat > HEARTBEAT_THRESHOLD && !heartbeatState.isLockedDown) {
    // Trigger lockdown
    heartbeatState.isLockedDown = true;
    heartbeatState.lockdownReason = 'no_heartbeat';
    heartbeatState.lockdownTimestamp = now.toISOString();
    
    logger.warn('Lockdown triggered due to no heartbeat', {
      timeSinceLastHeartbeat,
      threshold: HEARTBEAT_THRESHOLD,
      lastHeartbeat: heartbeatState.lastHeartbeat
    });

    // Notify callbacks
    notifyCallbacks('lockdown', {
      reason: 'no_heartbeat',
      lastHeartbeat: heartbeatState.lastHeartbeat,
      threshold: HEARTBEAT_THRESHOLD,
      timestamp: now.toISOString()
    });
  } else if (timeSinceLastHeartbeat <= HEARTBEAT_THRESHOLD && heartbeatState.isLockedDown) {
    // Release lockdown
    heartbeatState.isLockedDown = false;
    heartbeatState.lockdownReason = null;
    heartbeatState.lockdownTimestamp = null;
    
    logger.info('Lockdown released - heartbeat restored', {
      lastHeartbeat: heartbeatState.lastHeartbeat
    });

    // Notify callbacks
    notifyCallbacks('lockdown_released', {
      reason: 'heartbeat_restored',
      lastHeartbeat: heartbeatState.lastHeartbeat,
      timestamp: now.toISOString()
    });
  }
}

// Notify callbacks function
async function notifyCallbacks(event, data) {
  const eventCallbacks = callbacks.filter(callback => 
    callback.events.includes(event)
  );

  for (const callback of eventCallbacks) {
    try {
      const payload = {
        event,
        data,
        timestamp: new Date().toISOString(),
        callbackId: callback.id
      };

      const response = await fetch(callback.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        logger.error('Callback notification failed', {
          callbackId: callback.id,
          url: callback.url,
          status: response.status,
          event
        });
      } else {
        logger.info('Callback notification sent successfully', {
          callbackId: callback.id,
          url: callback.url,
          event
        });
      }
    } catch (error) {
      logger.error('Error sending callback notification', {
        callbackId: callback.id,
        url: callback.url,
        error: error.message,
        event
      });
    }
  }
}

// Start heartbeat monitoring
setInterval(checkHeartbeat, HEARTBEAT_CHECK_INTERVAL);

// Get heartbeat status
router.get('/status', (req, res) => {
  try {
    const now = new Date();
    const lastHeartbeat = new Date(heartbeatState.lastHeartbeat);
    const timeSinceLastHeartbeat = now - lastHeartbeat;

    res.json({
      status: heartbeatState.status,
      isLockedDown: heartbeatState.isLockedDown,
      lastHeartbeat: heartbeatState.lastHeartbeat,
      timeSinceLastHeartbeat: timeSinceLastHeartbeat,
      threshold: HEARTBEAT_THRESHOLD,
      lockdownReason: heartbeatState.lockdownReason,
      lockdownTimestamp: heartbeatState.lockdownTimestamp,
      uptime: process.uptime(),
      timestamp: now.toISOString()
    });
  } catch (error) {
    logger.error('Error getting heartbeat status', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Update heartbeat
router.post('/update', (req, res) => {
  try {
    const { status = 'ok' } = req.body;
    const previousStatus = heartbeatState.status;
    
    heartbeatState.status = status;
    heartbeatState.lastHeartbeat = new Date().toISOString();

    logger.info('Heartbeat updated', {
      previousStatus,
      newStatus: status,
      timestamp: heartbeatState.lastHeartbeat
    });

    // Notify callbacks if status changed
    if (previousStatus !== status) {
      notifyCallbacks('status_change', {
        previousStatus,
        newStatus: status,
        timestamp: heartbeatState.lastHeartbeat
      });
    }

    res.json({
      status: 'success',
      message: 'Heartbeat updated successfully',
      heartbeat: {
        status: heartbeatState.status,
        lastHeartbeat: heartbeatState.lastHeartbeat
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating heartbeat', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Register callback
router.post('/callbacks', (req, res) => {
  try {
    const { url, events = ['status_change', 'lockdown', 'lockdown_released'] } = req.body;

    if (!url) {
      return res.status(400).json({
        status: 'error',
        message: 'URL is required',
        timestamp: new Date().toISOString()
      });
    }

    const callback = {
      id: Date.now().toString(),
      url,
      events,
      createdAt: new Date().toISOString()
    };

    callbacks.push(callback);

    logger.info('Callback registered', {
      callbackId: callback.id,
      url: callback.url,
      events: callback.events
    });

    res.status(201).json({
      status: 'success',
      message: 'Callback registered successfully',
      callback: {
        id: callback.id,
        url: callback.url,
        events: callback.events,
        createdAt: callback.createdAt
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error registering callback', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// List callbacks
router.get('/callbacks', (req, res) => {
  try {
    res.json({
      status: 'success',
      callbacks: callbacks.map(callback => ({
        id: callback.id,
        url: callback.url,
        events: callback.events,
        createdAt: callback.createdAt
      })),
      count: callbacks.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error listing callbacks', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Unregister callback
router.delete('/callbacks/:callbackId', (req, res) => {
  try {
    const { callbackId } = req.params;
    const callbackIndex = callbacks.findIndex(callback => callback.id === callbackId);

    if (callbackIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Callback not found',
        timestamp: new Date().toISOString()
      });
    }

    const removedCallback = callbacks.splice(callbackIndex, 1)[0];

    logger.info('Callback unregistered', {
      callbackId: removedCallback.id,
      url: removedCallback.url
    });

    res.json({
      status: 'success',
      message: 'Callback unregistered successfully',
      callback: {
        id: removedCallback.id,
        url: removedCallback.url,
        events: removedCallback.events
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error unregistering callback', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Manual lockdown
router.post('/lockdown', (req, res) => {
  try {
    const { reason = 'manual_trigger' } = req.body;
    
    heartbeatState.isLockedDown = true;
    heartbeatState.lockdownReason = reason;
    heartbeatState.lockdownTimestamp = new Date().toISOString();

    logger.warn('Manual lockdown triggered', { reason });

    // Notify callbacks
    notifyCallbacks('lockdown', {
      reason,
      lastHeartbeat: heartbeatState.lastHeartbeat,
      threshold: HEARTBEAT_THRESHOLD,
      timestamp: heartbeatState.lockdownTimestamp
    });

    res.json({
      status: 'success',
      message: 'Lockdown triggered successfully',
      lockdown: {
        reason,
        timestamp: heartbeatState.lockdownTimestamp
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error triggering manual lockdown', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Release lockdown
router.post('/release', (req, res) => {
  try {
    heartbeatState.isLockedDown = false;
    heartbeatState.lockdownReason = null;
    heartbeatState.lockdownTimestamp = null;

    logger.info('Lockdown released manually');

    // Notify callbacks
    notifyCallbacks('lockdown_released', {
      reason: 'manual_release',
      lastHeartbeat: heartbeatState.lastHeartbeat,
      timestamp: new Date().toISOString()
    });

    res.json({
      status: 'success',
      message: 'Lockdown released successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error releasing lockdown', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 