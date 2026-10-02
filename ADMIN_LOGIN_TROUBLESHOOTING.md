# 🔧 Admin Login Troubleshooting Guide

## 🎯 **Current Status**

### ✅ **Backend Verification - ALL WORKING**
- **Admin User**: ✅ Exists in database
- **Email**: `admin@dazzlewheels.com`
- **Password**: `DazzleAdmin@2024!` ✅ Correct
- **Role**: `ADMIN` ✅ Correct
- **API Endpoint**: ✅ Working (tested with curl)
- **Server**: ✅ Running on port 3001

### ⚠️ **Frontend Issue**
- **Login Form**: Shows "Login failed" error
- **Credentials**: Updated to show correct password
- **Environment**: Set to development to show demo credentials

---

## 🔍 **Troubleshooting Steps Added**

### 1. **Updated Demo Credentials**
Fixed the admin login page to show the correct password:
```
Email: admin@dazzlewheels.com
Password: DazzleAdmin@2024!
```

### 2. **Added Debug Logging**
Enhanced both frontend and auth service with detailed console logging:
- Form submission details
- API URL verification
- Response status and data
- Error details

### 3. **Environment Configuration**
- Set `NEXT_PUBLIC_ENVIRONMENT=development` to show demo credentials
- Verified `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

---

## 🧪 **How to Test & Debug**

### **Step 1: Open Browser Console**
1. Go to http://localhost:3002/admin/login
2. Open browser Developer Tools (F12)
3. Go to Console tab

### **Step 2: Attempt Login**
1. Use the credentials:
   - **Email**: `admin@dazzlewheels.com`
   - **Password**: `DazzleAdmin@2024!`
2. Click "Sign In to Admin Panel"
3. Watch the console for debug messages

### **Step 3: Check Console Output**
Look for these debug messages:
```
🔍 Starting admin login...
📋 Form data: {email: "admin@dazzlewheels.com", password: "***"}
🌐 API URL: http://localhost:3001/api
🔍 Auth service login started...
📋 Response status: 201
✅ API response received
✅ Session stored in localStorage
✅ Login successful!
```

### **Step 4: Check Network Tab**
1. Go to Network tab in Developer Tools
2. Attempt login again
3. Look for POST request to `/auth/login`
4. Check if request is made and what the response is

---

## 🔧 **Possible Issues & Solutions**

### **Issue 1: Network/CORS Error**
**Symptoms**: No network request visible, or CORS error in console
**Solution**: 
- Verify backend is running on port 3001
- Check if frontend can reach backend
- Verify CORS configuration

### **Issue 2: Wrong API URL**
**Symptoms**: 404 error or wrong endpoint
**Solution**: 
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Should be `http://localhost:3001/api`

### **Issue 3: Authentication Logic Error**
**Symptoms**: API call succeeds but login still fails
**Solution**: 
- Check role validation logic
- Verify session storage
- Check auth context state

### **Issue 4: Frontend Cache Issues**
**Symptoms**: Old code still running
**Solution**: 
- Hard refresh browser (Ctrl+F5)
- Clear browser cache
- Restart frontend server

---

## 🚀 **Quick Fixes to Try**

### **Fix 1: Hard Refresh**
```bash
# In browser: Ctrl+F5 or Cmd+Shift+R
# Clear all browser data for localhost
```

### **Fix 2: Restart Frontend**
```bash
# Stop frontend (Ctrl+C)
cd frontend
npm run dev
```

### **Fix 3: Clear Browser Storage**
```javascript
// In browser console:
localStorage.clear()
sessionStorage.clear()
```

### **Fix 4: Test Direct API Call**
```javascript
// In browser console:
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@dazzlewheels.com',
    password: 'DazzleAdmin@2024!'
  })
}).then(r => r.json()).then(console.log)
```

---

## 📋 **Current System Status**

### **Servers Running**:
- ✅ **Backend**: http://localhost:3001 (API working)
- ✅ **Frontend**: http://localhost:3002 (UI accessible)
- ✅ **Supabase Storage**: Configured and active

### **Admin Access**:
- **URL**: http://localhost:3002/admin/login
- **Email**: `admin@dazzlewheels.com`
- **Password**: `DazzleAdmin@2024!`

### **Expected Behavior**:
After successful login, should redirect to: http://localhost:3002/admin

---

## 🎯 **Next Steps**

1. **Try the login** with debug logging enabled
2. **Check browser console** for detailed error messages
3. **Verify network requests** are being made
4. **Test direct API call** if needed
5. **Report findings** for further troubleshooting

The backend is confirmed working, so the issue is likely in the frontend authentication flow or network connectivity.