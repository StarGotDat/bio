# Heartbeat Callback System

A robust callback system for monitoring heartbeat status with automatic lockdown capabilities when heartbeat is lost.

## Features

- **Heartbeat Monitoring**: Tracks system heartbeat status
- **Automatic Lockdown**: Triggers lockdown mode when heartbeat is lost
- **Callback System**: Notifies registered URLs when status changes
- **RESTful API**: Complete API for managing callbacks and status
- **Logging**: Comprehensive logging with Winston
- **Security**: Helmet.js security headers and CORS support

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp env.example .env
```

3. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server health status.

### Heartbeat Status
```
GET /api/heartbeat/status
```
Returns current heartbeat status and system information.

### Register Callback
```
POST /api/heartbeat/callbacks
Content-Type: application/json

{
  "url": "https://your-website.com/webhook",
  "events": ["status_change", "lockdown", "lockdown_released"]
}
```

### List Callbacks
```
GET /api/heartbeat/callbacks
```
Returns all registered callbacks.

### Unregister Callback
```
DELETE /api/heartbeat/callbacks/:callbackId
```

### Update Heartbeat
```
POST /api/heartbeat/update
Content-Type: application/json

{
  "status": "ok"
}
```

### Manual Lockdown
```
POST /api/heartbeat/lockdown
Content-Type: application/json

{
  "reason": "manual_trigger"
}
```

### Release Lockdown
```
POST /api/heartbeat/release
```

## Callback Events

The system sends POST requests to registered callbacks with the following event types:

### Status Change Event
```json
{
  "event": "status_change",
  "data": {
    "previousStatus": "ok",
    "newStatus": "warning",
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "callbackId": "1234567890"
}
```

### Lockdown Event
```json
{
  "event": "lockdown",
  "data": {
    "reason": "no_heartbeat",
    "lastHeartbeat": "2024-01-01T11:55:00.000Z",
    "threshold": 30000,
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "callbackId": "1234567890"
}
```

### Lockdown Released Event
```json
{
  "event": "lockdown_released",
  "data": {
    "reason": "heartbeat_restored",
    "lastHeartbeat": "2024-01-01T12:05:00.000Z",
    "timestamp": "2024-01-01T12:05:00.000Z"
  },
  "timestamp": "2024-01-01T12:05:00.000Z",
  "callbackId": "1234567890"
}
```

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `HEARTBEAT_THRESHOLD`: Milliseconds before lockdown (default: 30000)
- `HEARTBEAT_CHECK_INTERVAL`: Check interval in milliseconds (default: 5000)
- `LOG_LEVEL`: Logging level (default: info)
- `CORS_ORIGIN`: CORS origin (default: *)

## Usage Examples

### 1. Register a Callback
```bash
curl -X POST http://localhost:3000/api/heartbeat/callbacks \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-website.com/webhook",
    "events": ["status_change", "lockdown"]
  }'
```

### 2. Check Status
```bash
curl http://localhost:3000/api/heartbeat/status
```

### 3. Update Heartbeat
```bash
curl -X POST http://localhost:3000/api/heartbeat/update \
  -H "Content-Type: application/json" \
  -d '{"status": "ok"}'
```

### 4. Trigger Manual Lockdown
```bash
curl -X POST http://localhost:3000/api/heartbeat/lockdown \
  -H "Content-Type: application/json" \
  -d '{"reason": "emergency"}'
```

## Webhook Handler Example

Here's an example of how to handle the webhook callbacks on your website:

```javascript
// Express.js webhook handler
app.post('/webhook', (req, res) => {
  const { event, data, timestamp, callbackId } = req.body;
  
  switch (event) {
    case 'status_change':
      console.log(`Status changed from ${data.previousStatus} to ${data.newStatus}`);
      // Update your website UI
      break;
      
    case 'lockdown':
      console.log('LOCKDOWN TRIGGERED:', data.reason);
      // Show lockdown message on your website
      // Disable certain features
      break;
      
    case 'lockdown_released':
      console.log('Lockdown released:', data.reason);
      // Restore normal website functionality
      break;
  }
  
  res.status(200).json({ received: true });
});
```

## Monitoring

The system automatically:
- Monitors heartbeat every 5 seconds
- Triggers lockdown if no heartbeat for 30 seconds
- Releases lockdown when heartbeat is restored
- Logs all events to `logs/combined.log`
- Logs errors to `logs/error.log`

## Security Features

- Helmet.js security headers
- CORS protection
- Input validation
- Error handling
- Graceful shutdown

## License

MIT 