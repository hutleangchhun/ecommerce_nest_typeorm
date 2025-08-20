# 📚 Swagger API Documentation Guide

## 🚀 Quick Start with Swagger UI

### 1. **Access Swagger Documentation**
Visit: http://localhost:3000/api/docs

### 2. **Authentication Setup**

#### Step 1: Register a User
1. Find the **Authentication** section
2. Click on `POST /auth/register`
3. Click "Try it out"
4. Use this sample data:

**For Admin User:**
```json
{
  "name": "Admin User",
  "email": "admin@test.com", 
  "password": "admin123",
  "role": "admin"
}
```

**For Sales User:**
```json
{
  "name": "Sales User",
  "email": "sales@test.com",
  "password": "sales123", 
  "role": "sales"
}
```

**For Customer:**
```json
{
  "name": "Customer User",
  "email": "customer@test.com",
  "password": "customer123",
  "role": "customer",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001"
}
```

#### Step 2: Login to Get Token
1. Click on `POST /auth/login`
2. Use the email and password from registration:
```json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```
3. Copy the `access_token` from the response

#### Step 3: Authorize All Requests
1. Click the **🔒 Authorize** button at the top of the page
2. In the "JWT-auth" field, paste your token (without "Bearer ")
3. Click "Authorize"
4. All subsequent API calls will now include your JWT token

### 3. **Test Role-Based Access**

#### Admin Access (Full Access):
- ✅ All categories endpoints
- ✅ All products endpoints  
- ✅ All customers endpoints
- ✅ All orders endpoints
- ✅ All analysis endpoints

#### Sales Access (Business Operations):
- ✅ Categories: View, Create, Update (no delete)
- ✅ Products: Full access
- ✅ Orders: Full access  
- ✅ Analysis: All reports
- ❌ User management

#### Customer Access (Limited):
- ✅ Categories: View only
- ✅ Products: View only
- ✅ Own profile and orders
- ❌ Analytics or admin functions

### 4. **API Features**

#### 🔐 **Authentication Endpoints**
- `POST /auth/register` - Create new user with role
- `POST /auth/login` - Get JWT token
- `GET /auth/profile` - Get current user info
- `POST /auth/logout` - Logout current session
- `POST /auth/logout-all` - Logout from all devices

#### 📦 **Business Endpoints**
- **Categories**: Product category management
- **Products**: Product catalog with inventory
- **Customers**: Customer profile management
- **Orders**: Order processing and tracking
- **Analysis**: Business analytics and reports

#### 🏥 **System Endpoints**  
- **Health**: System health monitoring
- **App**: Basic application status

### 5. **Swagger UI Features**

#### 🔄 **Persistent Authorization**
- Your JWT token persists across page refreshes
- No need to re-enter token until it expires (8 hours)

#### 🔍 **Interactive Testing**
- Try all endpoints directly from the documentation
- See request/response examples
- Validate API responses in real-time

#### 📋 **Role-Based Documentation**
- Each endpoint shows required roles
- Permission matrix clearly displayed
- Error responses documented (401, 403, etc.)

### 6. **Common Status Codes**

| Code | Meaning | When You See It |
|------|---------|----------------|
| 200  | Success | Request completed successfully |
| 201  | Created | Resource created (register, login) |
| 401  | Unauthorized | Missing or invalid JWT token |
| 403  | Forbidden | Valid token but insufficient role permissions |
| 404  | Not Found | Resource doesn't exist |
| 500  | Server Error | Internal server issue |

### 7. **Tips for Testing**

1. **Test Different Roles**: Create users with different roles to see permission differences
2. **Use the Filter**: Type in the search box to find specific endpoints
3. **Check Response Schemas**: Expand response examples to see data structure
4. **Test Error Cases**: Try accessing endpoints without tokens or with wrong roles
5. **Monitor Token Expiry**: Tokens expire after 8 hours - you'll need to re-login

### 8. **Troubleshooting**

#### "401 Unauthorized" Error:
- Check if you clicked "Authorize" and entered your token
- Verify token hasn't expired (8 hours)
- Re-login if needed

#### "403 Forbidden" Error:  
- Your role doesn't have permission for this endpoint
- Check the role requirements in the endpoint description
- Use an admin account for full access

#### "500 Internal Server Error":
- Server-side issue (some analytics endpoints may have data requirements)
- Check server logs
- Try with different test data

Enjoy exploring your E-commerce API! 🎉