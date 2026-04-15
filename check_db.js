import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

function readDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL || "";
}

const sql = neon(readDatabaseUrl());

async function main() {
  try {
    const classes = await sql`select * from classes limit 5`;
    console.log("Classes:", classes);

    const attempts = await sql`select * from attempts limit 5`;
    console.log("Attempts:", attempts);

    const profiles = await sql`select * from profiles limit 5`;
    console.log("Profiles:", profiles);
  } catch (e) {
    console.error(e);
  }
}

main();
