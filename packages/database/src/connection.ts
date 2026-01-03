import mongoose from 'mongoose';

let isConnected = false;

export interface DatabaseConfig {
  uri: string;
  options?: mongoose.ConnectOptions;
}

export async function connectDatabase(config: DatabaseConfig): Promise<void> {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(config.uri, config.options);
    isConnected = true;

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      isConnected = false;
    });

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }

  await mongoose.disconnect();
  isConnected = false;
  console.log('Disconnected from MongoDB');
}

export function isDatabaseConnected(): boolean {
  return isConnected;
}
