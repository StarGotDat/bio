const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test helper functions
async function testEndpoint(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ ${method} ${endpoint}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method} ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Heartbeat Callback System Tests\n');
  
  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  await testEndpoint('GET', '/health');
  
  // Test 2: Get initial status
  console.log('\n2. Getting initial heartbeat status...');
  await testEndpoint('GET', '/api/heartbeat/status');
  
  // Test 3: Register a callback
  console.log('\n3. Registering a callback...');
  const callbackResponse = await testEndpoint('POST', '/api/heartbeat/callbacks', {
    url: 'https://httpbin.org/post',
    events: ['status_change', 'lockdown', 'lockdown_released']
  });
  
  const callbackId = callbackResponse?.callbackId;
  
  // Test 4: List callbacks
  console.log('\n4. Listing registered callbacks...');
  await testEndpoint('GET', '/api/heartbeat/callbacks');
  
  // Test 5: Update heartbeat to 'ok'
  console.log('\n5. Updating heartbeat to "ok"...');
  await testEndpoint('POST', '/api/heartbeat/update', { status: 'ok' });
  
  // Test 6: Update heartbeat to 'warning'
  console.log('\n6. Updating heartbeat to "warning"...');
  await testEndpoint('POST', '/api/heartbeat/update', { status: 'warning' });
  
  // Test 7: Manual lockdown trigger
  console.log('\n7. Triggering manual lockdown...');
  await testEndpoint('POST', '/api/heartbeat/lockdown', { reason: 'test_emergency' });
  
  // Test 8: Release lockdown
  console.log('\n8. Releasing lockdown...');
  await testEndpoint('POST', '/api/heartbeat/release');
  
  // Test 9: Update heartbeat back to 'ok'
  console.log('\n9. Updating heartbeat back to "ok"...');
  await testEndpoint('POST', '/api/heartbeat/update', { status: 'ok' });
  
  // Test 10: Get final status
  console.log('\n10. Getting final heartbeat status...');
  await testEndpoint('GET', '/api/heartbeat/status');
  
  // Test 11: Unregister callback
  if (callbackId) {
    console.log('\n11. Unregistering callback...');
    await testEndpoint('DELETE', `/api/heartbeat/callbacks/${callbackId}`);
  }
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📝 Note: Check the logs directory for detailed system logs.');
  console.log('📝 The callback to httpbin.org will show the webhook payloads.');
}

// Run the tests
runTests().catch(console.error); 