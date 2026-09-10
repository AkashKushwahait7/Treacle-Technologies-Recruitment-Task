import mongoose from 'mongoose';
import { ENV } from './env.js';

let mongodInstance = null;

export const connectDB = async () => {
  try {
    // Attempt standard connection to MONGO_URI
    let uri = ENV.MONGO_URI;

    if (uri === 'memory') {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      uri = mongodInstance.getUri();
      console.log(`[Database] In-memory MongoDB started at: ${uri}`);
    }

    mongoose.set('strictQuery', false);
    
    // Set a short serverSelectionTimeoutMS so if local 27017 isn't running, it doesn't hang forever
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`[Database] Connected successfully to MongoDB: ${mongoose.connection.host || 'cluster'}`);
    } catch (primaryErr) {
      if (ENV.NODE_ENV === 'development' || !process.env.CI) {
        console.warn(`[Database] Could not connect to primary URI (${uri}): ${primaryErr.message}`);
        console.log(`[Database] Falling back to in-memory MongoDB for local development...`);
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create({ binary: { version: '4.4.18' } });
        uri = mongodInstance.getUri();
        await mongoose.connect(uri);
        console.log(`[Database] In-memory MongoDB fallback active at: ${uri}`);
      } else {
        throw primaryErr;
      }
    }

    mongoose.connection.on('error', (err) => {
      console.error(`[Database] Runtime error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] Disconnected from MongoDB');
    });

    return mongoose.connection;
  } catch (error) {
    console.error(`[Database] Fatal Connection Error: ${error.message}`);
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
      console.log('[Database] In-memory MongoDB stopped');
    }
    console.log('[Database] MongoDB connection closed');
  } catch (error) {
    console.error(`[Database] Error disconnecting: ${error.message}`);
  }
};
