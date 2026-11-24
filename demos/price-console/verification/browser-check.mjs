import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { PriceConsole as Core } from "../src/core.mjs";

const require = createRequire(import.meta.url);
function loadPlaywright() {
  try {
    return require("playwright");
  } catch {
    const globalRoot = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
    return require(join(globalRoot, "@playwright/cli/node_modules/playwright"));
  }
}

const { chromium } = loadPlaywright();
const root = resolve(import.meta.dirname, "..");
const fileUrl = pathToFileURL(join(root, "index.html")).href;
const serverUrl = "http://127.0.0.1:4187/index.html";
const scenarios = [
  { name: "file-desktop", url: fileUrl, viewport: { width: 1440, height: 1000 }, allowedOrigin: null },
  { name: "server-desktop", url: serverUrl, viewport: { width: 1440, height: 1000 }, allowedOrigin: "http://127.0.0.1:4187" },
  { name: "file-mobile", url: fileUrl, viewport: { width: 390, height: 844 }, allowedOrigin: null, mobile: true },
  { name: "server-mobile", url: serverUrl, viewport: { width: 390, height: 844 }, allowedOrigin: "http://127.0.0.1:4187", mobile: true },
];

let chromePath = process.env.CHROME_PATH;
if (!chromePath) {
  try {
    chromePath = execFileSync("bash", ["-lc", "command -v google-chrome"], { encoding: "utf8" }).trim();
  } catch {
    chromePath = undefined;
  }
}
const browser = await chromium.launch({ headless: true, executablePath: chromePath || undefined });
const results = [];
let failed = false;

for (const scenario of scenarios) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    acceptDownloads: true,
    isMobile: scenario.mobile ?? false,
    hasTouch: scenario.mobile ?? false,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];
  const requests = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => requestFailures.push(`${request.url()} :: ${request.failure()?.errorText}`));
  page.on("request", (request) => requests.push(request.url()));

  const record = {
    name: scenario.name,
    url: scenario.url,
    viewport: scenario.viewport,
    checks: {},
  };
  try {
    await page.goto(scenario.url, { waitUntil: "load" });
    await page.waitForSelector("#sku-rows tr");
    const initial = await page.evaluate(() => {
      const offenders = [...document.querySelectorAll("body *")].filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && (rect.right > innerWidth + 1 || rect.left < -1);
      }).map((element) => ({ tag: element.tagName, className: element.className, left: element.getBoundingClientRect().left, right: element.getBoundingClientRect().right }));
      return {
        innerWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        skuRows: document.querySelectorAll("#sku-rows tr").length,
        blindRows: document.querySelectorAll("#blind-results .blind-row:not(.blind-table-head)").length,
        chartCount: document.querySelectorAll("#price-chart svg").length,
        lang: document.documentElement.lang,
        overflowOffenders: offenders,
      };
    });
    record.initial = initial;
    record.checks.initialCounts = initial.skuRows === 30 && initial.blindRows === 20 && initial.chartCount === 1;
    record.checks.noInitialHorizontalOverflow = initial.documentScrollWidth <= initial.innerWidth + 1 && initial.bodyScrollWidth <= initial.innerWidth + 1 && initial.overflowOffenders.length === 0;

    await page.locator("#lang-zh").click();
    record.checks.chineseToggle = (await page.locator("html").getAttribute("lang")) === "zh-CN" && (await page.locator("#hero-title").innerText()).includes("每个价格");
    await page.locator("#lang-en").click();

    await page.locator("#sku-search").fill("AUR-420");
    record.checks.search = (await page.locator("#sku-rows tr").count()) === 2;
    await page.locator("#sku-search").fill("");
    await page.locator("#state-filter").selectOption("conflict");
    record.checks.conflictFilter = (await page.locator("#sku-rows tr").count()) === 2;
    await page.locator("#state-filter").selectOption("all");

    await page.locator(".row-action").first().click();
    await page.waitForSelector("#evidence-dialog[open]");
    const drawer = await page.evaluate(() => ({
      evidenceItems: document.querySelectorAll("#evidence-content .evidence-item").length,
      documentScrollWidth: document.documentElement.scrollWidth,
      innerWidth,
    }));
    record.drawer = drawer;
    record.checks.evidenceDrawer = drawer.evidenceItems === 3;
    record.checks.noDrawerOverflow = drawer.documentScrollWidth <= drawer.innerWidth + 1;
    await page.locator("#close-evidence").click();

    await page.locator("#matcher-input").fill("Aster AUR420 black headphones");
    await page.locator("#matcher-form button[type=submit]").click();
    await page.waitForSelector("#matcher-result .candidate-row");
    const matcher = await page.locator("#matcher-result .candidate-row").first().innerText();
    record.checks.normalizerAndMatcher = matcher.includes("P001") && matcher.includes("Accepted") && matcher.includes("0.93");

    if (scenario.name.endsWith("desktop")) {
      const jsonDownloadPromise = page.waitForEvent("download");
      await page.locator("#export-json").click();
      const jsonDownload = await jsonDownloadPromise;
      const jsonPath = join(root, "verification", `price-evidence-${scenario.name}.json`);
      await jsonDownload.saveAs(jsonPath);
      const exportedJson = JSON.parse(await readFile(jsonPath, "utf8"));
      const csvDownloadPromise = page.waitForEvent("download");
      await page.locator("#export-csv").click();
      const csvDownload = await csvDownloadPromise;
      const csvPath = join(root, "verification", `price-evidence-${scenario.name}.csv`);
      await csvDownload.saveAs(csvPath);
      const exportedCsv = await readFile(csvPath, "utf8");
      record.checks.jsonExport = exportedJson.summary.skuCount === 30 && exportedJson.blindTest.rows.length === 20;
      record.checks.csvExport = exportedCsv.trim().split(/\r\n/).length === 91;
      record.downloads = { json: jsonDownload.suggestedFilename(), csv: csvDownload.suggestedFilename() };
    }

    const fixtureBuffer = Buffer.from(JSON.stringify(Core.createFixture()), "utf8");
    await page.locator("#fixture-file").setInputFiles({ name: "synthetic-fixture.json", mimeType: "application/json", buffer: fixtureBuffer });
    await page.waitForFunction(() => document.querySelector("#status-message")?.textContent.includes("synthetic-fixture.json"));
    record.checks.fixtureImport = (await page.locator("#sku-rows tr").count()) === 30;

    if (scenario.mobile) await page.locator("#lang-zh").click();
    if (scenario.name === "server-desktop") await page.screenshot({ path: join(root, "verification", "desktop-viewport.png"), fullPage: false });
    if (scenario.name === "server-mobile") await page.screenshot({ path: join(root, "verification", "mobile-viewport.png"), fullPage: false });
    await page.screenshot({ path: join(root, "verification", `${scenario.name}.png`), fullPage: true });

    const externalRequests = requests.filter((value) => {
      if (!/^https?:/.test(value)) return false;
      if (!scenario.allowedOrigin) return true;
      return !value.startsWith(`${scenario.allowedOrigin}/`);
    });
    record.externalRequests = externalRequests;
    record.consoleErrors = consoleErrors;
    record.pageErrors = pageErrors;
    record.requestFailures = requestFailures;
    record.requestCount = requests.length;
    record.checks.zeroConsoleErrors = consoleErrors.length === 0;
    record.checks.zeroPageErrors = pageErrors.length === 0;
    record.checks.zeroFailedRequests = requestFailures.length === 0;
    record.checks.zeroExternalRequests = externalRequests.length === 0;
    record.passed = Object.values(record.checks).every(Boolean);
  } catch (error) {
    record.passed = false;
    record.failure = error.stack ?? String(error);
    record.consoleErrors = consoleErrors;
    record.pageErrors = pageErrors;
    record.requestFailures = requestFailures;
  }
  if (!record.passed) failed = true;
  results.push(record);
  await context.close();
}

await browser.close();
const output = {
  generatedAt: new Date().toISOString(),
  browser: browser.version(),
  node: process.version,
  scenarios: results,
  passed: !failed,
};
await writeFile(join(root, "verification", "browser-results.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
if (failed) process.exitCode = 1;
