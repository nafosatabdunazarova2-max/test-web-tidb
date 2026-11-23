import { getDatabase } from "@netlify/database";
import { desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/netlify-db";
import { records } from "../../db/schema.ts";

const maxRecordBytes = 16 * 1024;
const recordListLimit = 100;

function json(data, status = 200, headers = {}) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

export default async (request) => {
  if (request.method !== "GET" && request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, { Allow: "GET, POST" });
  }

  let data;
  if (request.method === "POST") {
    const mediaType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
    if (mediaType !== "application/json") {
      return json({ error: "Content-Type must be application/json" }, 415);
    }

    try {
      const body = await request.arrayBuffer();
      if (body.byteLength > maxRecordBytes) {
        return json({ error: "Record must not exceed 16 KiB" }, 413);
      }
      data = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body));
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      return json({ error: "Record must be a JSON object" }, 400);
    }
  }

  try {
    const database = drizzle({ client: getDatabase() });
    if (request.method === "GET") {
      const rows = await database.select().from(records).orderBy(desc(records.id)).limit(recordListLimit);
      return json(rows);
    }

    const [createdRecord] = await database.insert(records).values({ data }).returning();
    return json(createdRecord, 201);
  } catch {
    return json({ error: "Database request failed" }, 500);
  }
};
