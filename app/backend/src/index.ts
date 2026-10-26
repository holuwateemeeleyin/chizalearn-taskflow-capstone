import app from "./app.js";
import { initialiseDatabase, pool } from "./db.js";

const port = Number(process.env.PORT) || 3000;
const maxAttempts = 5;
const retryDelayMs = 5000;

async function startServer(): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await initialiseDatabase();

      app.listen(port, "0.0.0.0", () => {
        console.log(`TaskFlow API listening on port ${port}`);
      });

      return;
    } catch (error) {
      console.error(
        `Database initialisation failed (attempt ${attempt}/${maxAttempts}):`,
        error,
      );

      if (attempt < maxAttempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelayMs),
        );
      }
    }
  }

  console.error("Unable to initialise the TaskFlow database after retries.");
  await pool.end();
  process.exit(1);
}

startServer();
