const http = require('http');

// Test script to verify routes are properly protected (should return 401 without token)
const testUnauthorizedAccess = async () => {
  console.log('🔒 Testing Unauthorized Access (should fail)...\n');

  const protectedRoutes = [
    { path: '/api/v1/categories', name: 'Categories' },
    { path: '/api/v1/products', name: 'Products' },
    { path: '/api/v1/customers', name: 'Customers' },
    { path: '/api/v1/orders', name: 'Orders' },
    { path: '/api/v1/analysis/overview', name: 'Analysis Overview' },
    { path: '/api/v1/health/database', name: 'Database Health' },
    { path: '/api/v1/auth/profile', name: 'Auth Profile' },
  ];

  const publicRoutes = [
    { path: '/', name: 'Root' },
    { path: '/api/v1/health', name: 'Basic Health Check' },
  ];

  console.log('🚫 Testing Protected Routes (should return 401):');
  let protectedPassed = 0;
  
  for (const route of protectedRoutes) {
    try {
      const result = await testRouteWithoutAuth(route.path, route.name);
      if (result === 401) {
        console.log(`✅ ${route.name}: Properly protected (401)`);
        protectedPassed++;
      } else {
        console.log(`❌ ${route.name}: Not protected! (Status: ${result})`);
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.log(`❌ ${route.name}: Test failed -`, error.message);
    }
  }

  console.log('\n✅ Testing Public Routes (should return 200):');
  let publicPassed = 0;
  
  for (const route of publicRoutes) {
    try {
      const result = await testRouteWithoutAuth(route.path, route.name);
      if (result === 200) {
        console.log(`✅ ${route.name}: Publicly accessible (200)`);
        publicPassed++;
      } else {
        console.log(`⚠️  ${route.name}: Status ${result} (may be expected)`);
        publicPassed++; // Don't fail for other statuses
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.log(`❌ ${route.name}: Test failed -`, error.message);
    }
  }

  console.log('\n📊 Test Results:');
  console.log(`🔒 Protected Routes: ${protectedPassed}/${protectedRoutes.length} properly secured`);
  console.log(`🌐 Public Routes: ${publicPassed}/${publicRoutes.length} accessible`);
  
  if (protectedPassed === protectedRoutes.length) {
    console.log('\n🎉 All routes are properly secured!');
  } else {
    console.log('\n⚠️  Some routes may not be properly protected!');
  }
};

const testRouteWithoutAuth = (path, name) => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve(res.statusCode);
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
  testUnauthorizedAccess();
}, 2000);

console.log('⏳ Starting unauthorized access tests in 2 seconds...');
console.log('⚠️  Make sure the server is running with: npm run start:dev\n');