#!/usr/bin/env node

/**
 * MongoDB Connection Test Script
 * 
 * This script tests the MongoDB connection using the URI from .env file
 * It performs multiple checks to ensure your database is properly configured
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
};

async function testMongoDBConnection() {
  log.title('🔍 MongoDB Connection Test');
  console.log('='.repeat(60));

  // Step 1: Check if MONGODB_URI exists
  log.info('Checking environment variables...');
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    log.error('MONGODB_URI not found in environment variables');
    log.warning('Make sure you have a .env file with MONGODB_URI set');
    process.exit(1);
  }

  // Mask the password in the URI for display
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  log.success(`MONGODB_URI found: ${maskedUri}`);

  // Step 2: Create MongoDB client
  log.info('Creating MongoDB client...');
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });

  let connectionSuccess = false;
  let dbInfo = {};

  try {
    // Step 3: Connect to MongoDB
    log.info('Attempting to connect to MongoDB...');
    await client.connect();
    log.success('Successfully connected to MongoDB Atlas!');
    connectionSuccess = true;

    // Step 4: Get database information
    log.info('Retrieving database information...');
    const db = client.db();
    dbInfo.name = db.databaseName;
    log.success(`Database name: ${dbInfo.name}`);

    // Step 5: List collections
    log.info('Fetching collections...');
    const collections = await db.listCollections().toArray();
    dbInfo.collections = collections.map(c => c.name);
    
    if (dbInfo.collections.length > 0) {
      log.success(`Collections found (${dbInfo.collections.length}):`);
      dbInfo.collections.forEach(name => {
        console.log(`   - ${name}`);
      });
    } else {
      log.warning('No collections found in database');
    }

    // Step 6: Check specific collections needed by the app
    log.info('Checking required collections...');
    const requiredCollections = ['profile', 'users'];
    const missingCollections = [];

    for (const collectionName of requiredCollections) {
      if (dbInfo.collections.includes(collectionName)) {
        log.success(`Collection '${collectionName}' exists`);
        
        // Get count of documents
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`   📊 Documents: ${count}`);
      } else {
        missingCollections.push(collectionName);
        log.warning(`Collection '${collectionName}' does NOT exist`);
      }
    }

    // Step 7: Test read/write permissions
    log.info('Testing database permissions...');
    try {
      const testCollection = db.collection('_connection_test');
      
      // Test write
      await testCollection.insertOne({ 
        test: true, 
        timestamp: new Date(),
        message: 'Connection test document'
      });
      log.success('Write permission: OK');

      // Test read
      const testDoc = await testCollection.findOne({ test: true });
      if (testDoc) {
        log.success('Read permission: OK');
      }

      // Clean up test document
      await testCollection.deleteOne({ test: true });
      log.success('Delete permission: OK');

    } catch (error) {
      log.error(`Permission test failed: ${error.message}`);
    }

    // Step 8: Get server info
    log.info('Retrieving server information...');
    const admin = db.admin();
    const serverInfo = await admin.serverInfo();
    log.success(`MongoDB version: ${serverInfo.version}`);

    // Summary
    console.log('\n' + '='.repeat(60));
    log.title('📊 Connection Test Summary');
    console.log('='.repeat(60));
    log.success('Connection Status: SUCCESSFUL');
    console.log(`   Database: ${dbInfo.name}`);
    console.log(`   Collections: ${dbInfo.collections.length}`);
    console.log(`   MongoDB Version: ${serverInfo.version}`);
    
    if (missingCollections.length > 0) {
      log.warning(`Missing collections: ${missingCollections.join(', ')}`);
      log.info('These collections will be created automatically when needed');
    }

    console.log('='.repeat(60));
    log.success('🎉 Your MongoDB connection is working perfectly!');

  } catch (error) {
    log.error('Failed to connect to MongoDB');
    console.log('\n' + '='.repeat(60));
    log.title('🔍 Error Details');
    console.log('='.repeat(60));
    console.error(`${colors.red}Error Message: ${error.message}${colors.reset}`);
    console.error(`${colors.red}Error Code: ${error.code || 'N/A'}${colors.reset}`);
    
    console.log('\n' + '='.repeat(60));
    log.title('💡 Troubleshooting Tips');
    console.log('='.repeat(60));
    
    if (error.message.includes('authentication failed')) {
      log.warning('Authentication failed - Check your username and password');
      console.log('   1. Verify credentials in MongoDB Atlas');
      console.log('   2. Make sure the user has proper permissions');
      console.log('   3. Check if password contains special characters (encode them)');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      log.warning('Network connection issue');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify the cluster hostname is correct');
      console.log('   3. Check if your IP is whitelisted in MongoDB Atlas');
      console.log('   4. Try accessing MongoDB Atlas from browser');
    } else if (error.message.includes('bad auth')) {
      log.warning('Authentication mechanism error');
      console.log('   1. Update your connection string format');
      console.log('   2. Check MongoDB driver version compatibility');
    } else {
      log.warning('General connection error');
      console.log('   1. Double-check your MONGODB_URI in .env file');
      console.log('   2. Verify MongoDB Atlas cluster is running');
      console.log('   3. Check MongoDB Atlas status page');
    }

    console.log('='.repeat(60));
    process.exit(1);

  } finally {
    // Always close the connection
    if (connectionSuccess) {
      await client.close();
      log.info('Connection closed gracefully');
    }
  }
}

// Run the test
testMongoDBConnection().catch(error => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
