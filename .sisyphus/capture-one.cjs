async (page) => {
  const BASE = "http://localhost:3000";
  const OUT = "C:\\Users\\Ahmed Attafi\\Desktop\\Projects\\Distiller\\.sisyphus\\evidence";
  const viewports = [
    { name: "360", width: 360, height: 800 },
    { name: "768", width: 768, height: 1024 },
    { name: "1280", width: 1280, height: 800 },
    { name: "1536", width: 1536, height: 960 }
  ];
  const modes = ["light", "dark"];
  const results = [];
  const pageName = process.env.CAPTURE_PAGE || "landing";
  const url = process.env.CAPTURE_URL || "/";

  for (const v of viewports) {
    await page.setViewportSize({ width: v.width, height: v.height });
    try {
      await page.goto(BASE + url, { waitUntil: "domcontentloaded", timeout: 30000 });
    } catch (e) {
      results.push("GOTO_ERR " + pageName + " " + v.name + ": " + e.message);
      continue;
    }
    await page.waitForTimeout(2500);

    for (const mode of modes) {
      await page.evaluate((m) => {
        try { localStorage.setItem("distiller-theme", m); } catch (e) {}
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(m);
      }, mode);
      await page.waitForTimeout(500);

      const info = await page.evaluate(() => ({
        url: location.pathname,
        title: document.title,
        textLen: document.body ? document.body.innerText.length : -1,
        classes: document.documentElement.className
      }));

      const filename = "baseline-" + pageName + "-" + v.name + "-" + mode + ".png";
      await page.screenshot({ path: OUT + "\\" + filename, fullPage: true });
      results.push(filename + " | " + info.url + " | text=" + info.textLen + " | " + info.classes);
    }
  }
  return results.join("\n");
}