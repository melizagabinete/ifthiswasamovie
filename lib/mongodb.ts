import { MongoClient, MongoClientOptions } from "mongodb";

const options: MongoClientOptions = {
  maxIdleTimeMS: 5000,
};

let client: MongoClient | undefined;

export function getClient(): MongoClient {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
    }
    client = new MongoClient(uri, options);
  }
  return client;
}

// Get the database instance for Better Auth
export async function getDatabase(dbName?: string) {
  return getClient().db(dbName || process.env.MONGODB_DB || "better-auth");
}
