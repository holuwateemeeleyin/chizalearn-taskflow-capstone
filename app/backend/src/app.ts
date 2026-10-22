
import express from "express";
import { pool } from "./db.js";

const app = express();

app.use(express.json());

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "taskflow-backend",
    version: "0.1.6",
  });
});

app.get("/api/tasks", async (_req, res) => {
  const result = await pool.query<Task>(
    "SELECT id, title, completed FROM tasks ORDER BY id"
  );

  res.json({ data: result.rows });
});

app.post("/api/tasks", async (req, res) => {
  const { title } = req.body;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      error: "A non-empty task title is required",
    });
  }

  const result = await pool.query<Task>(
    "INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, completed",
    [title.trim()]
  );

  return res.status(201).json({ data: result.rows[0] });
});

app.patch("/api/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { completed } = req.body;

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  if (typeof completed !== "boolean") {
    return res.status(400).json({
      error: "The completed field must be a boolean",
    });
  }

  const result = await pool.query<Task>(
    `UPDATE tasks
     SET completed = $1
     WHERE id = $2
     RETURNING id, title, completed`,
    [completed, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Task not found" });
  }

  return res.json({ data: result.rows[0] });
});

export default app;