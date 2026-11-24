async page => {
  const out = 'demos/legacy-bridge/verification/demo.webm';
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screencast.start({ path: out, size: { width: 1440, height: 1000 } });
  await page.goto('http://127.0.0.1:5087/index.html?api=http%3A%2F%2F127.0.0.1%3A5087');
  await page.screencast.showChapter('01 · The problem', { description: 'Legacy order and payment files still move through spreadsheets and manual checks.', duration: 3500 });
  await page.waitForTimeout(3000);
  await page.locator('#loadSample').click();
  await page.screencast.showChapter('02 · Two structured inputs', { description: '100 synthetic orders · 70 synthetic payments · dry-run by default', duration: 3500 });
  await page.waitForTimeout(3500);
  await page.locator('#reconcile').click();
  await page.screencast.showChapter('03 · Reconciliation with evidence', { description: 'SQLite staging · deterministic run id · input hash · append-only audit', duration: 3500 });
  await page.waitForTimeout(5000);
  await page.screencast.showOverlay('<div style="position:absolute;top:18px;right:18px;padding:10px 16px;background:rgba(5,12,20,.9);border:1px solid #63b8ff;border-radius:10px;color:#edf3f8;font:600 16px system-ui">96 unique orders · 63 matched · 41 exceptions · 0 production writes</div>');
  await page.waitForTimeout(4500);
  await page.locator('#tabMatches').click();
  await page.waitForTimeout(3000);
  await page.locator('#tabReport').click();
  await page.screencast.showChapter('04 · Humans review exceptions', { description: 'Daily report, matches, exceptions, and audit trail stay inspectable.', duration: 3500 });
  await page.waitForTimeout(4500);
  await page.locator('#tabAudit').click();
  await page.waitForTimeout(3500);
  await page.locator('#langEn').click();
  await page.waitForTimeout(2500);
  await page.screencast.showChapter('05 · Honest boundary', { description: 'No ERP, bank, or production adapter. No automatic accounting or payment.', duration: 4000 });
  await page.waitForTimeout(3500);
  await page.screencast.stop();
}
