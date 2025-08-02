const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
const axios = require('axios');
const winston = require('winston');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Heartbeat status management
let heartbeatStatus = {
  status: 'ok',
  lastHeartbeat: new Date(),
  callbacks: [],
  isLockdown: false
};

// Heartbeat callback system
class HeartbeatCallbackSystem {
  constructor() {
    this.callbacks = [];
    this.status = 'ok';
    this.lastHeartbeat = new Date();
    this.lockdownThreshold = 30000; // 30 seconds
    this.heartbeatInterval = null;
  }

  // Register a callback URL
  registerCallback(url, events = ['status_change', 'lockdown']) {
    const callback = {
      id: Date.now().toString(),
      url,
      events,
      active: true,
      createdAt: new Date()
    };
    
    this.callbacks.push(callback);
    logger.info(`Callback registered: ${url}`, { callbackId: callback.id });
    return callback.id;
  }

  // Unregister a callback
  unregisterCallback(callbackId) {
    const index = this.callbacks.findIndex(cb => cb.id === callbackId);
    if (index !== -1) {
      const callback = this.callbacks.splice(index, 1)[0];
      logger.info(`Callback unregistered: ${callback.url}`, { callbackId });
      return true;
    }
    return false;
  }

  // Update heartbeat status
  updateHeartbeat(status = 'ok') {
    const previousStatus = this.status;
    this.status = status;
    this.lastHeartbeat = new Date();

    logger.info(`Heartbeat updated: ${status}`, { 
      previousStatus, 
      newStatus: status,
      timestamp: this.lastHeartbeat 
    });

    // Check if status changed
    if (previousStatus !== status) {
      this.notifyCallbacks('status_change', {
        previousStatus,
        newStatus: status,
        timestamp: this.lastHeartbeat
      });
    }

    // Check for lockdown conditions
    this.checkLockdown();
  }

  // Check if system should go into lockdown
  checkLockdown() {
    const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat.getTime();
    
    if (timeSinceLastHeartbeat > this.lockdownThreshold && !this.isLockdown) {
      this.triggerLockdown();
    } else if (timeSinceLastHeartbeat <= this.lockdownThreshold && this.isLockdown) {
      this.releaseLockdown();
    }
  }

  // Trigger lockdown mode
  triggerLockdown() {
    this.isLockdown = true;
    logger.warn('LOCKDOWN TRIGGERED - No heartbeat received', {
      timeSinceLastHeartbeat: Date.now() - this.lastHeartbeat.getTime(),
      threshold: this.lockdownThreshold
    });

    this.notifyCallbacks('lockdown', {
      reason: 'no_heartbeat',
      lastHeartbeat: this.lastHeartbeat,
      threshold: this.lockdownThreshold,
      timestamp: new Date()
    });
  }

  // Release lockdown mode
  releaseLockdown() {
    this.isLockdown = false;
    logger.info('Lockdown released - Heartbeat restored', {
      lastHeartbeat: this.lastHeartbeat
    });

    this.notifyCallbacks('lockdown_released', {
      reason: 'heartbeat_restored',
      lastHeartbeat: this.lastHeartbeat,
      timestamp: new Date()
    });
  }

  // Notify all registered callbacks
  async notifyCallbacks(event, data) {
    const relevantCallbacks = this.callbacks.filter(cb => 
      cb.active && cb.events.includes(event)
    );

    logger.info(`Notifying ${relevantCallbacks.length} callbacks for event: ${event}`, { data });

    const notifications = relevantCallbacks.map(async (callback) => {
      try {
        const response = await axios.post(callback.url, {
          event,
          data,
          timestamp: new Date(),
          callbackId: callback.id
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Heartbeat-Callback-System/1.0'
          }
        });

        logger.info(`Callback notification successful: ${callback.url}`, {
          callbackId: callback.id,
          statusCode: response.status
        });

        return { success: true, callbackId: callback.id, statusCode: response.status };
      } catch (error) {
        logger.error(`Callback notification failed: ${callback.url}`, {
          callbackId: callback.id,
          error: error.message
        });

        return { success: false, callbackId: callback.id, error: error.message };
      }
    });

    const results = await Promise.allSettled(notifications);
    return results.map(result => result.value || result.reason);
  }

  // Get current status
  getStatus() {
    return {
      status: this.status,
      isLockdown: this.isLockdown,
      lastHeartbeat: this.lastHeartbeat,
      timeSinceLastHeartbeat: Date.now() - this.lastHeartbeat.getTime(),
      callbacks: this.callbacks.length,
      threshold: this.lockdownThreshold
    };
  }

  // Start heartbeat monitoring
  startMonitoring() {
    this.heartbeatInterval = setInterval(() => {
      this.checkLockdown();
    }, 5000); // Check every 5 seconds

    logger.info('Heartbeat monitoring started');
  }

  // Stop heartbeat monitoring
  stopMonitoring() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      logger.info('Heartbeat monitoring stopped');
    }
  }
}

// Initialize the callback system
const heartbeatSystem = new HeartbeatCallbackSystem();

// API Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Get current heartbeat status
app.get('/api/heartbeat/status', (req, res) => {
  res.json(heartbeatSystem.getStatus());
});

// Register a callback
app.post('/api/heartbeat/callbacks', (req, res) => {
  const { url, events } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const callbackId = heartbeatSystem.registerCallback(url, events);
    res.json({ 
      success: true, 
      callbackId,
      message: 'Callback registered successfully' 
    });
  } catch (error) {
    logger.error('Failed to register callback', { error: error.message });
    res.status(500).json({ error: 'Failed to register callback' });
  }
});

// Unregister a callback
app.delete('/api/heartbeat/callbacks/:callbackId', (req, res) => {
  const { callbackId } = req.params;
  
  const success = heartbeatSystem.unregisterCallback(callbackId);
  
  if (success) {
    res.json({ success: true, message: 'Callback unregistered successfully' });
  } else {
    res.status(404).json({ error: 'Callback not found' });
  }
});

// List all callbacks
app.get('/api/heartbeat/callbacks', (req, res) => {
  res.json({
    callbacks: heartbeatSystem.callbacks,
    total: heartbeatSystem.callbacks.length
  });
});

// Update heartbeat (simulate heartbeat from external system)
app.post('/api/heartbeat/update', (req, res) => {
  const { status = 'ok' } = req.body;
  
  heartbeatSystem.updateHeartbeat(status);
  
  res.json({
    success: true,
    message: 'Heartbeat updated',
    status: heartbeatSystem.getStatus()
  });
});

// Manual lockdown trigger
app.post('/api/heartbeat/lockdown', (req, res) => {
  const { reason = 'manual' } = req.body;
  
  heartbeatSystem.triggerLockdown();
  
  res.json({
    success: true,
    message: 'Lockdown triggered manually',
    reason,
    status: heartbeatSystem.getStatus()
  });
});

// Release lockdown
app.post('/api/heartbeat/release', (req, res) => {
  heartbeatSystem.releaseLockdown();
  
  res.json({
    success: true,
    message: 'Lockdown released',
    status: heartbeatSystem.getStatus()
  });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Heartbeat callback system running on port ${PORT}`);
  heartbeatSystem.startMonitoring();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  heartbeatSystem.stopMonitoring();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  heartbeatSystem.stopMonitoring();
  process.exit(0);
});

module.exports = { app, heartbeatSystem }; 