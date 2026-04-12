import { createHmac, timingSafeEqual } from "node:crypto";
import { sendError } from "./db.js";

function toBase64Url(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function readSecret() {
  const secret = process.env.TEACHER_SESSION_SECRET || process.env.TEACHER_CODE || "";
  if (!secret) {
    throw new Error("Missing TEACHER_SESSION_SECRET or TEACHER_CODE.");
  }
  return secret;
}

function signPayload(encodedPayload, secret) {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

export function createTeacherToken() {
  const secret = readSecret();
  const payload = {
    role: "teacher",
    exp: Date.now() + 1000 * 60 * 60 * 12
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export function verifyTeacherToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;
  const secret = readSecret();
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  const expectedSignature = signPayload(encodedPayload, secret);
  const left = Buffer.from(signature);
  const right = Buffer.from(expectedSignature);
  if (left.length !== right.length) return false;
  if (!timingSafeEqual(left, right)) return false;

  const payload = JSON.parse(fromBase64Url(encodedPayload));
  return payload?.role === "teacher" && Number(payload?.exp || 0) > Date.now();
}

export function readTeacherToken(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return "";
  return auth.slice("Bearer ".length).trim();
}

export function requireTeacher(req, res) {
  try {
    const token = readTeacherToken(req);
    if (!verifyTeacherToken(token)) {
      sendError(res, 401, "Teacher authentication required.");
      return false;
    }
    return true;
  } catch (error) {
    sendError(res, 500, error instanceof Error ? error.message : "Teacher auth failed.");
    return false;
  }
}

