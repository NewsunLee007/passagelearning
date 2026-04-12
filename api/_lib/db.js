import { neon } from "@neondatabase/serverless";

function readDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL || "";
}

export function getSql() {
  const databaseUrl = readDatabaseUrl();
  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL. Configure Neon connection string in Vercel env.");
  }
  return neon(databaseUrl);
}

export async function ensureBody(req) {
  if (typeof req.body === "string") {
    return req.body ? JSON.parse(req.body) : {};
  }
  return req.body ?? {};
}

export function sendJson(res, status, data) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.send(JSON.stringify(data));
}

export function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

export function methodNotAllowed(res, allow) {
  res.setHeader("Allow", allow);
  return sendError(res, 405, "Method not allowed");
}

