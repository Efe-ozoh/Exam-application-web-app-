import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URL;

    if (!uri) {
      throw new Error("Please define MONGODB_URL in .env.local");
    }

    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // A rejected promise must not stay cached, otherwise one transient
    // failure (DNS hiccup, paused cluster) breaks every later request until
    // the server restarts.
    cached.promise = null;
    cached.conn = null;
    throw error;
  }

  return cached.conn;
}
