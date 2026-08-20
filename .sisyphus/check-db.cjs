const fs = require("fs");
const postgres = require("postgres");

const env = fs.readFileSync(".env.local", "utf8");
const line = env.split("\n").find((l) => l.startsWith("DATABASE_URL="));
const url = line.slice("DATABASE_URL=".length).trim();

const sql = postgres(url, { max: 1 });

(async () => {
  try {
    const users = await sql`select id, name, email from users limit 5`;
    console.log("USERS:", JSON.stringify(users));
    const sessions = await sql`select id, user_id, token, expires_at from sessions limit 5`;
    console.log("SESSIONS:", JSON.stringify(sessions));
  } catch (e) {
    console.error("ERR:", e.message);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
})();