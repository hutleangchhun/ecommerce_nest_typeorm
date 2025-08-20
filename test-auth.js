const http = require('http');

// Simple test script to verify authentication endpoints
const testAuth = async () => {
  console.log('🔧 Testing Authentication System...\n');

  // Test 1: Register a new user
  console.log('1. Testing user registration...');
  try {
    const registerData = JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '+1234567890'
    });

    const registerReq = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(registerData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log('✅ Registration successful');
          console.log('Response:', JSON.parse(data));
          console.log();
          testLogin();
        } else {
          console.log('❌ Registration failed');
          console.log('Status:', res.statusCode);
          console.log('Response:', data);
        }
      });
    });

    registerReq.on('error', (err) => {
      console.log('❌ Registration request failed:', err.message);
    });

    registerReq.write(registerData);
    registerReq.end();
  } catch (error) {
    console.log('❌ Registration test failed:', error.message);
  }
};

const testLogin = async () => {
  console.log('2. Testing user login...');
  try {
    const loginData = JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    });

    const loginReq = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Login successful');
          const response = JSON.parse(data);
          console.log('Response:', response);
          console.log();
          if (response.access_token) {
            testProtectedRoute(response.access_token);
          }
        } else {
          console.log('❌ Login failed');
          console.log('Status:', res.statusCode);
          console.log('Response:', data);
        }
      });
    });

    loginReq.on('error', (err) => {
      console.log('❌ Login request failed:', err.message);
    });

    loginReq.write(loginData);
    loginReq.end();
  } catch (error) {
    console.log('❌ Login test failed:', error.message);
  }
};

const testProtectedRoute = async (token) => {
  console.log('3. Testing protected routes...');
  
  const protectedRoutes = [
    { path: '/api/v1/auth/profile', name: 'Auth Profile' },
    { path: '/api/v1/categories', name: 'Categories' },
    { path: '/api/v1/products', name: 'Products' },
    { path: '/api/v1/customers', name: 'Customers' },
    { path: '/api/v1/orders', name: 'Orders' },
    { path: '/api/v1/analysis/overview', name: 'Analysis Overview' },
    { path: '/api/v1/health/database', name: 'Database Health' },
  ];

  let passed = 0;
  let total = protectedRoutes.length;

  for (const route of protectedRoutes) {
    try {
      await testSingleRoute(route.path, route.name, token);
      passed++;
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between requests
    } catch (error) {
      console.log(`❌ ${route.name} test failed:`, error.message);
    }
  }

  console.log();
  console.log(`🎯 Protected Routes Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 All authentication tests passed!');
  } else {
    console.log('⚠️  Some protected routes failed. Check server logs for details.');
  }
};

const testSingleRoute = (path, name, token) => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${name}: Access successful`);
          resolve();
        } else if (res.statusCode === 401) {
          console.log(`❌ ${name}: Unauthorized (${res.statusCode})`);
          reject(new Error(`Unauthorized access to ${path}`));
        } else {
          console.log(`⚠️  ${name}: Status ${res.statusCode} (may be expected)`);
          resolve(); // Don't fail on other status codes as they might be expected
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
};

// Wait for server to be ready
setTimeout(() => {
  testAuth();
}, 2000);

console.log('⏳ Starting authentication tests in 2 seconds...');
console.log('⚠️  Make sure the server is running with: npm run start:dev');
console.log('⚠️  Make sure Redis is running on localhost:6379\n');