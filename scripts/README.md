# Database Connection Test Scripts

This directory contains utility scripts to test and verify your MongoDB connection.

## Available Scripts

### 1. Quick Database Check (`quick-db-check.js`)

A fast connectivity test that checks if MongoDB is reachable.

**Usage:**
```bash
npm run check:db
```

**What it does:**
- ✅ Verifies MONGODB_URI exists in .env
- ✅ Tests connection to MongoDB
- ✅ Shows database name
- ⚡ Fast execution (< 5 seconds)

**Example output:**
```
🔍 Testing MongoDB connection...
✅ MongoDB connection: OK
📦 Database: voice_ai_app_db
```

---

### 2. Comprehensive Connection Test (`test-mongodb-connection.js`)

A detailed test that checks all aspects of your MongoDB setup.

**Usage:**
```bash
npm run test:db
```

**What it does:**
- ✅ Verifies environment variables
- ✅ Tests connection to MongoDB Atlas
- ✅ Lists all collections
- ✅ Checks required collections (`profile`, `users`)
- ✅ Counts documents in each collection
- ✅ Tests read/write/delete permissions
- ✅ Shows MongoDB server version
- ✅ Provides detailed error diagnostics

**Example output:**
```
🔍 MongoDB Connection Test
============================================================
✅ MONGODB_URI found: mongodb+srv://user:****@cluster.mongodb.net/db
✅ Successfully connected to MongoDB Atlas!
✅ Database name: voice_ai_app_db
✅ Collections found (2):
   - profile
   - users
✅ Collection 'profile' exists
   📊 Documents: 1
✅ Write permission: OK
✅ Read permission: OK
✅ Delete permission: OK
✅ MongoDB version: 8.0.16

============================================================
📊 Connection Test Summary
============================================================
✅ Connection Status: SUCCESSFUL
   Database: voice_ai_app_db
   Collections: 2
   MongoDB Version: 8.0.16
============================================================
✅ 🎉 Your MongoDB connection is working perfectly!
```

---

## When to Use These Scripts

### Use `npm run check:db` when:
- You want a quick health check
- Before starting development
- In CI/CD pipelines
- For automated monitoring

### Use `npm run test:db` when:
- Setting up the project for the first time
- Troubleshooting connection issues
- Verifying database structure
- After changing MongoDB credentials
- Before deploying to production

---

## Troubleshooting

If connection fails, the scripts provide detailed error messages and suggestions:

### Common Issues:

**1. Authentication Failed**
- Check username and password in MONGODB_URI
- Verify user has proper permissions in MongoDB Atlas
- Check for special characters in password (URL encode them)

**2. Network Connection Error**
- Check your internet connection
- Verify IP is whitelisted in MongoDB Atlas (0.0.0.0/0 for development)
- Check if MongoDB Atlas cluster is running

**3. Missing Collections**
- Collections will be created automatically when needed
- This is normal for a fresh database

**4. Permission Errors**
- Verify database user has readWrite permissions
- Check MongoDB Atlas user roles

---

## Requirements

- Node.js 16+
- npm packages: `mongodb`, `dotenv`
- `.env` file with `MONGODB_URI` configured

---

## Exit Codes

Both scripts use standard exit codes:
- `0` - Success
- `1` - Failure

This makes them suitable for use in scripts and CI/CD pipelines.
