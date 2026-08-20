const fs = require("fs");
const postgres = require("postgres");
const crypto = require("crypto");

const env = fs.readFileSync(".env.local", "utf8");
const line = env.split("\n").find((l) => l.startsWith("DATABASE_URL="));
const url = line.slice("DATABASE_URL=".length).trim();

const sql = postgres(url, { max: 1 });

(async () => {
  try {
    const userId = "6c50b731-d981-4332-a5ba-3db360e0997c"; // Pro User
    const token = crypto.randomBytes(32).toString("base64url");
    const id = crypto.randomBytes(16).toString("base64url");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await sql`
      insert into sessions (id, user_id, expires_at, token, created_at, updated_at)
      values (${id}, ${userId}, ${expiresAt}, ${token}, now(), now())
      on conflict (token) do nothing
    `;
    console.log("SESSION_TOKEN=" + token);
  } catch (e) {
    console.error("ERR:", e.message);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
})();