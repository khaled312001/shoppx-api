import mongoose from "mongoose";
import { makeMongoURI } from "./utils";
import { config } from "dotenv";
config();

export type Connection = typeof import("mongoose");
const connectionPool: any = {};

let isConnecting = false;

const connectMainDatabase = async () => {
  // Already connected — reuse across warm serverless invocations
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Avoid duplicate connection attempts during cold start
  if (isConnecting) {
    return;
  }

  isConnecting = true;
  const mainDatabaseURI = makeMongoURI("super");

  try {
    const conn = await mongoose.connect(mainDatabaseURI, {});
    connectionPool["super"] = conn;
    console.log(`Super Database Connected At: ${mainDatabaseURI}`);
  } catch (e: any) {
    console.error("Failed to connect to MongoDB:", e.message);
    throw e; // Let serverless function return 500 instead of retrying forever
  } finally {
    isConnecting = false;
  }
};

export { connectMainDatabase, connectionPool };
export * from "./utils";
