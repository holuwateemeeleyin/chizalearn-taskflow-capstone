
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("TaskFlow API", () => {
  it("returns healthy status from GET /health", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "healthy",
      service: "taskflow-backend"
    });
  });
});
