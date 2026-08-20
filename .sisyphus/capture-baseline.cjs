const path = require("path");

const BASE = "http://localhost:3000";
const OUT = "C:\\Users\\Ahmed Attafi\\Desktop\\Projects\\Distiller\\.sisyphus\\evidence";

const pages = [
  { name: "landing", url: "/" },
  { name: "feed", url: "/RefinedFeed" },
  { name: "pricing", url: "/pricing" },
  { name: "dashboard", url: "/dashboard" },
  { name: "about", url: "/about" },
  { name: "mena", url: "/mena" }
];

const viewports = [
  { name: "360", width: 360, height: 800 },
  { name: "768", width: 768, height: 1024 },
  { name: "1280", width: 1280, height: 800 },
  { name: "1536", width: 1536, height: 960 }
];

const modes = ["light", "dark"];

module.exports = async (page) => {
  const results = [];

  // Set session cookie for dashboard
  await page.context().addCookies([
    {
      name: "better-auth.session_token",
      value: "cPX-9ZOb5oikNhcpG0wtPrBZP-ivtXoSaoLsUBL_WUw",
      domain: "localhost",
      path: "/"
    }
  ]);

  for (const p of pages) {
    for (const v of viewports) {
      await page.setViewportSize({ width: v.width, height: v.height });
      await page.goto(BASE + p.url, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
      // Wait for client hydration + theme provider
      await page.waitForTimeout(1500);

      for (const mode of modes) {
        await page.evaluate((m) => {
          try {
            localStorage.setItem("distiller-theme", m);
          } catch (e) {}
          const root = document.documentElement;
          root.classList.remove("light", "dark");
          root.classList.add(m);
        }, mode);
        await page.waitForTimeout(400);

        const filename = `baseline-${p.name}-${v.name}-${mode}.png`;
        const filepath = path.join(OUT, filename);
        await page.screenshot({ path: filepath, fullPage: true });
        results.push(filename);
      }
    }
  }

  return results.join("\n");
};