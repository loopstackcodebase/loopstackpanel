import mongoose from "mongoose";

const dbCache = {
  conn: null as mongoose.Connection | null,
  promise: null as Promise<mongoose.Connection> | null,
};

async function connectToDatabase() {
  try {
    if (dbCache.conn) {
      return dbCache.conn;
    }

    if (!dbCache.promise) {
      dbCache.promise = mongoose
        .connect(process.env.MONGODB_URI!, {
          bufferCommands: false,
        })
        .then((mongoose) => mongoose.connection);
    }

    dbCache.conn = await dbCache.promise;
    console.log("Connected to MongoDB");
    return dbCache.conn;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw new Error("MongoDB connection failed");
  }
}

export default connectToDatabase;
