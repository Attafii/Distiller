import { readFileSync } from "fs";
import { globSync } from "glob";
const WRONG = "distiller.attafii.app";
const files = globSync("**/*.{ts,tsx,mjs,js,json}", { ignore: ["node_modules/**",".next/**","drizzle/**","dist/**"] });
let bad = false;
for (const f of files) {
  const c = readFileSync(f, "utf-8");
  if (c.includes(WRONG)) { console.error("FOUND WRONG DOMAIN:", f); bad = true; }
}
if (bad) process.exit(1);
console.log("Domain audit passed.");