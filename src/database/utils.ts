import { Model, Mongoose, Schema } from "mongoose";
import { connectionPool } from ".";
import {
  ITenant,
  tenantSchema,
} from "../modules/super/submodules/tenants/Tenant/tenant.schema";

import { config } from "dotenv";

config();

export const makeMongoURI = (database: string) => {
  const databaseHost = process.env.DATABASE_SERVER_HOST;
  const databaseUser = process.env.DB_USER;
  const databasePassword = process.env.DB_PASSWORD;
  const encodedPassword = encodeURIComponent(databasePassword || "");
  return process.env.NODE_ENV === "production"
    ? `mongodb+srv://xappeesoftware:LMph7vvVk1gvgSMU@shopx.3qvsp5z.mongodb.net/${database}`
    : `mongodb://localhost:27017/${database}`;
};

const checkThatTenantIsRegistered = async (connectionKey: string) => {
  try {
    if (!connectionPool["super"]) {
      throw new Error("MongoDB connection is not initialized.");
    }

    const tenant = await connectionPool["super"]
      .model("Tenant", tenantSchema)
      .findOne({ name: connectionKey });

    if (!tenant || tenant.status !== "active") {
      return false;
    }
    return makeMongoURI(connectionKey);
  } catch (error) {
    console.error("Error checking tenant registration:", error);
    return false;
  }
};

export const newDatabaseConnection = async (connectionKey: string) => {
  const uri = await checkThatTenantIsRegistered(connectionKey);

  if (!uri) throw new Error("Tenant not found");
  var mongooseConnection = new Mongoose();
  await mongooseConnection
    .connect(uri)
    .then((_) => {
      connectionPool[connectionKey] = mongooseConnection;
    })
    .catch((error: any) => {
      console.log(`Error: ${error}. For: ${connectionKey}`);
      newDatabaseConnection(connectionKey);
    });
};

export const getTenantConnection = async (connectionKey: string) => {
  if (!connectionPool[connectionKey]) {
    await newDatabaseConnection(connectionKey); // makes a connection and stores it in the pool
  }
  return connectionPool[connectionKey];
};

export async function getModel<T extends Document>(
  connectionKey: string,
  modelName: string,
  schema: Schema<T>
): Promise<Model<T>> {
  const connection = await getTenantConnection(connectionKey);

  let model: Model<T>;
  try {
    model = connection.model(modelName);
  } catch (error) {
    model = connection.model(modelName, schema);
  }

  return model;
}

export const registerModel = async (
  connectionKey: string,
  modelName: string,
  schema: Schema
) => {
  const connection = await getTenantConnection(connectionKey);
  connection.model(modelName, schema);
};
