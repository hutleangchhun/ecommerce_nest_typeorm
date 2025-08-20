const http = require('http');

// Fixed test script for role-based authentication
const testRoleBasedAuth = async () => {
  console.log('🔐 Testing Role-Based Authentication System...\n');

  // Test users with different roles
  const testUsers = [
    {
      role: 'admin',
      data: {
        name: 'Admin User',
        email: 'admin2@example.com',
        password: 'admin123',
        role: 'admin'
      }
    },
    {
      role: 'sales',
      data: {
        name: 'Sales User',
        email: 'sales2@example.com',
        password: 'sales123',
        role: 'sales'
      }
    },
    {
      role: 'customer',
      data: {
        name: 'Customer User',
        email: 'customer2@example.com',
        password: 'customer123',
        role: 'customer',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      }
    }
  ];

  const tokens = {};

  // Register and login all test users
  console.log('📝 Registering and logging in test users...');
  for (const testUser of testUsers) {
    try {
      // Register user
      console.log(`Registering ${testUser.role} user...`);
      await registerUser(testUser.data);
      console.log(`✅ ${testUser.role.toUpperCase()}: Registration successful`);
      
      // Login user
      console.log(`Logging in ${testUser.role} user...`);
      const loginResult = await loginUser(testUser.data.email, testUser.data.password);
      if (loginResult.access_token) {
        tokens[testUser.role] = loginResult.access_token;
        console.log(`✅ ${testUser.role.toUpperCase()}: Login successful`);
      }
    } catch (error) {
      console.log(`❌ ${testUser.role.toUpperCase()}: ${error.message}`);
    }
  }

  console.log('\n🧪 Testing Role-Based Access Control...\n');

  // Test permission matrix
  const permissionTests = [
    { endpoint: '/api/v1/categories', method: 'GET', admin: true, sales: true, customer: true },
    { endpoint: '/api/v1/products', method: 'GET', admin: true, sales: true, customer: true },
    { endpoint: '/api/v1/analysis/overview', method: 'GET', admin: true, sales: true, customer: false },
  ];

  for (const test of permissionTests) {
    console.log(`Testing ${test.method} ${test.endpoint}:`);
    
    for (const role of ['admin', 'sales', 'customer']) {
      if (!tokens[role]) {
        console.log(`  ${role.toUpperCase()}: No token available`);
        continue;
      }

      try {
        const result = await testEndpoint(test.endpoint, test.method, tokens[role]);
        const expected = test[role];
        
        if (expected && result === 200) {
          console.log(`  ✅ ${role.toUpperCase()}: Access granted (${result})`);
        } else if (!expected && (result === 403 || result === 401)) {
          console.log(`  ✅ ${role.toUpperCase()}: Access denied (${result})`);
        } else {
          console.log(`  ⚠️  ${role.toUpperCase()}: Status ${result} (expected: ${expected ? 'allow' : 'deny'})`);
        }
      } catch (error) {
        console.log(`  ❌ ${role.toUpperCase()}: ${error.message}`);
      }
    }
    console.log();
  }

  console.log('🎉 Role-based authentication testing completed!');
};

const registerUser = (userData) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(userData);
    
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
        if (res.statusCode === 201) {
          resolve(JSON.parse(responseData));
        } else {
          reject(new Error(`Registration failed with status ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

const loginUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    
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
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(JSON.parse(responseData));
        } else {
          reject(new Error(`Login failed with status ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
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
      res.on('end', () => resolve(res.statusCode));
    });

    req.on('error', reject);
    req.end();
  });
};

// Start testing after a delay
setTimeout(() => {
  testRoleBasedAuth();
}, 1000);

console.log('⏳ Starting role-based authentication tests...');
console.log('⚠️  Make sure the server is running with: npm run start:dev\n');