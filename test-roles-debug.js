const http = require('http');

// Debug version of the role test script
const testRoleBasedAuth = async () => {
  console.log('🔐 Testing Role-Based Authentication System (Debug Mode)...\n');

  // Test simple registration first
  console.log('🧪 Testing registration with a simple user...');
  
  const simpleUser = {
    name: 'Debug User',
    email: 'debug@example.com',
    password: 'debug123',
    role: 'customer'
  };

  try {
    const result = await registerUser(simpleUser);
    console.log('✅ Registration successful:', result);
    
    // Try to login
    console.log('\n🔑 Testing login...');
    const loginResult = await loginUser(simpleUser.email, simpleUser.password);
    console.log('✅ Login successful:', loginResult);
    
    if (loginResult.access_token) {
      // Test a protected endpoint
      console.log('\n🛡️ Testing protected endpoint...');
      const endpointResult = await testEndpoint('/api/v1/auth/profile', 'GET', loginResult.access_token);
      console.log('Protected endpoint status:', endpointResult);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Full error:', error);
  }
};

const registerUser = (userData) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(userData);
    console.log('📤 Sending registration data:', data);
    
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log('📥 Registration response status:', res.statusCode);
        console.log('📥 Registration response data:', responseData);
        
        if (res.statusCode === 201) {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${responseData}`));
          }
        } else {
          reject(new Error(`Registration failed with status ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (err) => {
      console.log('🚨 Request error:', err);
      reject(err);
    });
    
    req.write(data);
    req.end();
  });
};

const loginUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    console.log('📤 Sending login data:', data);
    
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log('📥 Login response status:', res.statusCode);
        console.log('📥 Login response data:', responseData);
        
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${responseData}`));
          }
        } else {
          reject(new Error(`Login failed with status ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (err) => {
      console.log('🚨 Request error:', err);
      reject(err);
    });
    
    req.write(data);
    req.end();
  });
};

const testEndpoint = (path, method, token) => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('📥 Endpoint response status:', res.statusCode);
        console.log('📥 Endpoint response data:', data.substring(0, 200) + '...');
        resolve(res.statusCode);
      });
    });

    req.on('error', (err) => {
      console.log('🚨 Request error:', err);
      reject(err);
    });
    
    req.end();
  });
};

// Start testing immediately
console.log('🚀 Starting debug test...');
testRoleBasedAuth();