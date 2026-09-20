import { createClient } from '@libsql/client/web';

export async function dbConnectionStatus() {
  const url = process.env.TURSO_DATABASE_URL;

  if (!url) {
    return "No TURSO_DATABASE_URL environment variable";
  }

  try {
    const client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    
    const result = await client.execute("SELECT 1");
    await client.close();
    
    if (result.rows.length > 0) {
      return "Database connected";
    }
    return "Database not connected";
  } catch (error) {
    console.error("Error connecting to the database:", error);
    return "Database not connected";
  }
}

