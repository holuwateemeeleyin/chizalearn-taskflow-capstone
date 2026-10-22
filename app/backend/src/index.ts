
import app from "./app.js";
import { initialiseDatabase, pool } from "./db.js";

const port = Number(process.env.PORT) || 3000;

async function startServer(): Promise<void> {
  try {
    await initialiseDatabase();

    app.listen(port, "0.0.0.0", () => {
      console.log(`TaskFlow API listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start TaskFlow API:", error);
    await pool.end();
    process.exit(1);
  }
}

startServer();