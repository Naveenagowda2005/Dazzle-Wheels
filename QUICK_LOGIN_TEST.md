# 🔍 Quick Login Test

## 📋 **Exact Credentials to Use**

**Email**: `admin@dazzlewheels.com`  
**Password**: `DazzleAdmin@2024!`

## 🧪 **Debug Steps**

1. **Open Browser Console** (F12 → Console tab)
2. **Go to Admin Login**: http://localhost:3000/admin/login
3. **Enter Credentials** exactly as shown above
4. **Click Login** and watch console for debug messages

## 🔍 **Expected Debug Output**

You should see messages like:
```
🔍 Auth Debug: Starting login process
🔍 Auth Debug: API URL: http://localhost:3001/api
🔍 Auth Debug: Credentials: {email: "admin@dazzlewheels.com", password: "[HIDDEN]"}
🔍 Auth Debug: Response status: 201
🔍 Auth Debug: Response ok: true
🔍 Auth Debug: Login successful, user: Dazzle Wheels Admin
🔍 Auth Debug: Session stored in localStorage
```

## ❌ **If You See Errors**

### Network Error
- Check if backend is running: http://localhost:3001/api/auth/login
- Verify CORS settings

### 401 Unauthorized
- Double-check password: `DazzleAdmin@2024!`
- Verify email: `admin@dazzlewheels.com`

### 500 Server Error
- Check backend logs
- Verify database connection

## 🔧 **Manual API Test**

If frontend fails, test API directly:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dazzlewheels.com","password":"DazzleAdmin@2024!"}'
```

Should return:
```json
{
  "access_token": "eyJ...",
  "user": {
    "id": "...",
    "name": "Dazzle Wheels Admin",
    "email": "admin@dazzlewheels.com",
    "role": "ADMIN"
  }
}
```

---

**Note**: Debug logs will be removed after fixing the issue.