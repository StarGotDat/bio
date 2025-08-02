const express = require('express');
const app = express();
const PORT = process.env.WEBHOOK_PORT || 3001;

app.use(express.json());

// Store the current system status
let systemStatus = {
  status: 'ok',
  isLockdown: false,
  lastUpdate: new Date()
};

// Webhook handler for heartbeat callbacks
app.post('/webhook', (req, res) => {
  const { event, data, timestamp, callbackId } = req.body;
  
  console.log(`📡 Webhook received: ${event}`, { data, timestamp, callbackId });
  
  switch (event) {
    case 'status_change':
      handleStatusChange(data);
      break;
      
    case 'lockdown':
      handleLockdown(data);
      break;
      
    case 'lockdown_released':
      handleLockdownReleased(data);
      break;
      
    default:
      console.log(`⚠️ Unknown event type: ${event}`);
  }
  
  // Always respond with success
  res.status(200).json({ 
    received: true, 
    event,
    timestamp: new Date()
  });
});

function handleStatusChange(data) {
  const { previousStatus, newStatus, timestamp } = data;
  
  systemStatus.status = newStatus;
  systemStatus.lastUpdate = new Date(timestamp);
  
  console.log(`🔄 Status changed from "${previousStatus}" to "${newStatus}"`);
  
  // Update your website UI here
  updateWebsiteUI();
}

function handleLockdown(data) {
  const { reason, lastHeartbeat, threshold, timestamp } = data;
  
  systemStatus.isLockdown = true;
  systemStatus.status = 'lockdown';
  systemStatus.lastUpdate = new Date(timestamp);
  
  console.log(`🚨 LOCKDOWN TRIGGERED!`);
  console.log(`   Reason: ${reason}`);
  console.log(`   Last heartbeat: ${new Date(lastHeartbeat)}`);
  console.log(`   Threshold: ${threshold}ms`);
  
  // Implement lockdown measures on your website
  implementLockdown();
}

function handleLockdownReleased(data) {
  const { reason, lastHeartbeat, timestamp } = data;
  
  systemStatus.isLockdown = false;
  systemStatus.status = 'ok';
  systemStatus.lastUpdate = new Date(timestamp);
  
  console.log(`✅ Lockdown released!`);
  console.log(`   Reason: ${reason}`);
  console.log(`   Last heartbeat: ${new Date(lastHeartbeat)}`);
  
  // Restore normal website functionality
  releaseLockdown();
}

function updateWebsiteUI() {
  // This is where you would update your website's UI
  // Examples:
  // - Update status indicators
  // - Show warning messages
  // - Change color schemes
  // - Update dashboard widgets
  
  console.log(`🎨 Updating website UI - Status: ${systemStatus.status}`);
  
  // Example: Send to frontend via WebSocket or Server-Sent Events
  if (global.io) {
    global.io.emit('status-update', systemStatus);
  }
}

function implementLockdown() {
  // Implement lockdown measures on your website
  // Examples:
  // - Show emergency message
  // - Disable user interactions
  // - Redirect to maintenance page
  // - Disable certain features
  
  console.log(`🔒 Implementing lockdown measures`);
  
  // Example: Send lockdown event to frontend
  if (global.io) {
    global.io.emit('lockdown', {
      reason: 'system_emergency',
      timestamp: new Date()
    });
  }
}

function releaseLockdown() {
  // Restore normal website functionality
  // Examples:
  // - Remove emergency messages
  // - Re-enable user interactions
  // - Restore normal page functionality
  // - Re-enable disabled features
  
  console.log(`🔓 Releasing lockdown measures`);
  
  // Example: Send lockdown release event to frontend
  if (global.io) {
    global.io.emit('lockdown-released', {
      timestamp: new Date()
    });
  }
}

// Status endpoint to check current system status
app.get('/status', (req, res) => {
  res.json({
    ...systemStatus,
    uptime: process.uptime(),
    serverTime: new Date()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    systemStatus
  });
});

// Start the webhook handler server
app.listen(PORT, () => {
  console.log(`🌐 Webhook handler running on port ${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`📊 Status endpoint: http://localhost:${PORT}/status`);
});

// Example with Socket.IO for real-time updates
// Uncomment if you want real-time updates to your frontend

/*
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send current status to new client
  socket.emit('status-update', systemStatus);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io available globally
global.io = io;

server.listen(PORT, () => {
  console.log(`🌐 Webhook handler with Socket.IO running on port ${PORT}`);
});
*/

module.exports = { app, systemStatus }; 