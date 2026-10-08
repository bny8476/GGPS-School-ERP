import mongoose from 'mongoose';
import env from './env';
import { seedDatabase } from '../services/seedService';

// Disable Mongoose command buffering so queries fail immediately when DB is down rather than hanging
mongoose.set('bufferCommands', false);

let memoryServerInstance: any = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let isConnecting = false;

// Connection status listeners
mongoose.connection.on('connected', () => {
  console.log(`✓ [DB] Mongoose connected to ${mongoose.connection.host}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  [DB] Mongoose disconnected from database.');
});

mongoose.connection.on('reconnected', () => {
  console.log('✓ [DB] Mongoose reconnected to database.');
});

mongoose.connection.on('error', (err) => {
  console.error('⚠️  [DB] Mongoose connection error:', err?.message || err);
});

const attemptPrimaryConnect = async (): Promise<boolean> => {
  if (mongoose.connection.readyState === 1) return true;

  const mongoUri = env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('[DB] No MONGODB_URI configured.');
    return false;
  }

  // Mask credentials for safe logging
  const maskedUri = mongoUri.replace(/(:\/\/)(.*?)(@)/, '$1***:***$3');
  console.log(`[DB] Connecting to MongoDB (${maskedUri})...`);

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000, // 15s for cloud Atlas DNS & TLS handshakes
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20, // Maintain optimal connection pool
      minPoolSize: 2,  // Keep at least 2 connections warm to avoid cold TCP handshakes on queries
      family: 4,       // Force IPv4 to avoid 3-5s IPv6 DNS resolution delays on Render/cloud containers
    });
    console.log(`✓ MongoDB Connected successfully: ${conn.connection.host}`);

    // Quick warm-up ping to verify active connection
    try {
      await mongoose.connection.db?.admin().ping();
    } catch (_) {}

    if (reconnectTimer) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }

    // Seed on fresh database if needed
    if (env.NODE_ENV !== 'production') {
      const collections = await mongoose.connection.db?.listCollections().toArray();
      if (!collections || collections.length === 0) {
        console.log('[DB] Fresh database detected. Seeding default roles & accounts...');
        await seedDatabase();
      }
    }
    return true;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[DB] Primary MongoDB connection failed: ${errMsg}`);
    if (errMsg.includes('whitelist') || errMsg.includes('timed out') || errMsg.includes('ServerSelectionError')) {
      console.warn('⚠️  TIP: If using MongoDB Atlas, verify:');
      console.warn('   1. IP Access List allows "0.0.0.0/0" (Allow Access from Anywhere for Render).');
      console.warn('   2. Database username and password in MONGODB_URI are correct.');
      console.warn('   3. Database name is specified in the connection string.');
    }
    return false;
  }
};

const connectInMemoryDB = async (): Promise<boolean> => {
  if (mongoose.connection.readyState === 1) return true;

  try {
    console.log('⚡ Starting embedded in-memory MongoDB (no external MongoDB server required)...');
    // @ts-ignore
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    if (!memoryServerInstance) {
      memoryServerInstance = await MongoMemoryServer.create({
        binary: {
          version: '4.4.29',
        },
        instance: {
          dbName: 'global_international_erp',
          launchTimeout: 60000,
        },
      });
    }

    const memoryUri = memoryServerInstance.getUri();
    await mongoose.connect(memoryUri);
    console.log(`✓ Embedded in-memory MongoDB connected: ${memoryUri}`);

    console.log('[DB] Seeding default development accounts...');
    await seedDatabase();
    console.log('✓ Development database ready! You can log in with:');
    console.log('   • Admin:      admin@school.com / password123');
    console.log('   • Teacher:    teacher@school.com / password123');
    console.log('   • Parent:     parent@school.com / password123');
    return true;
  } catch (memErr) {
    console.error('[DB] CRITICAL: Failed to launch embedded in-memory MongoDB:', memErr);
    console.warn('⚠️  Database is offline. Non-health HTTP endpoints will return 503 Service Unavailable.');
    return false;
  }
};

const connectDB = async () => {
  if (isConnecting) return;
  isConnecting = true;

  // Use external database if explicit, in production, or when a remote MongoDB URI is configured
  const isExplicitExternal =
    process.env.USE_EXTERNAL_DB === 'true' ||
    env.NODE_ENV === 'production' ||
    (Boolean(env.MONGODB_URI) &&
      env.MONGODB_URI !== 'in-memory' &&
      !env.MONGODB_URI.includes('localhost:27017'));

  if (!isExplicitExternal) {
    await connectInMemoryDB();
    isConnecting = false;
    return;
  }

  // 1. Try initial connection with retries for production / external DB
  let connected = false;
  const maxInitialAttempts = env.NODE_ENV === 'production' ? 3 : 1;

  for (let attempt = 1; attempt <= maxInitialAttempts; attempt++) {
    if (attempt > 1) {
      console.log(`[DB] Retrying connection attempt ${attempt}/${maxInitialAttempts} in 3 seconds...`);
      await new Promise((res) => setTimeout(res, 3000));
    }
    connected = await attemptPrimaryConnect();
    if (connected) break;
  }

  // 2. Production handling: Keep service alive & retry periodically in background
  if (!connected && env.NODE_ENV === 'production') {
    console.warn('⚠️  [DB] Database is currently unreachable in production. Starting background auto-reconnector every 10s...');
    console.warn('⚠️  API server will stay ALIVE to serve health checks. Database-dependent endpoints will return 503 until connection is established.');

    if (!reconnectTimer) {
      reconnectTimer = setInterval(async () => {
        console.log('[DB] Background reconnection attempt...');
        const ok = await attemptPrimaryConnect();
        if (ok) {
          console.log('✓ [DB] Background reconnection succeeded!');
        }
      }, 10000);
      reconnectTimer.unref();
    }
    isConnecting = false;
    return;
  }

  // 3. In development / testing fallback
  if (!connected) {
    await connectInMemoryDB();
  }

  isConnecting = false;
};

// Graceful cleanup on shutdown
process.on('SIGINT', async () => {
  if (reconnectTimer) clearInterval(reconnectTimer);
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (reconnectTimer) clearInterval(reconnectTimer);
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
  await mongoose.disconnect();
  process.exit(0);
});

export default connectDB;
