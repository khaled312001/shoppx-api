import mongoose from "mongoose";
import { makeMongoURI } from "./utils";
import { config } from "dotenv";
config();

export type Connection = typeof import("mongoose");
const connectionPool: any = {};

const connectMainDatabase = () => {
  const mainDatabaseURI = makeMongoURI("super");

  mongoose
    .connect(mainDatabaseURI, {})
    .then((conn) => {
      connectionPool["super"] = conn;
      console.log(`Super Database Connected At: ${mainDatabaseURI}`);
    })
    .catch((e: any) => {
      console.error(
        "Failed to connect to MongoDB. Retrying in 5 seconds...",
        e
      );
      setTimeout(connectMainDatabase, 5000);
    });
};

export { connectMainDatabase, connectionPool };
export * from "./utils";
