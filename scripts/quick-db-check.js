#!/usr/bin/env node

/**
 * Quick MongoDB Connection Check
 * 
 * Fast connectivity test - just checks if MongoDB is reachable
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function quickCheck() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('❌ MONGODB_URI not found in .env file');
    process.exit(1);
  }

  console.log('🔍 Testing MongoDB connection...');
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await client.connect();
    const db = client.db();
    await db.admin().ping();
    
    console.log('✅ MongoDB connection: OK');
    console.log(`📦 Database: ${db.databaseName}`);
    
    process.exit(0);
  } catch (error) {
    console.log('❌ MongoDB connection: FAILED');
    console.log(`   Error: ${error.message}`);
    process.exit(1);
  } finally {
    await client.close();
  }
}

quickCheck();
