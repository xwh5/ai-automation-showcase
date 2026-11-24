import test from "node:test";
import assert from "node:assert/strict";
import { PriceConsole as C } from "../src/core.mjs";

test("English and Chinese dictionaries have the same non-empty keys", () => {
  for (const language of ["en", "zh"]) {
    for (const key of C.translationKeys()) {
      const value = C.t(language, key, { count: 1 });
      assert.equal(typeof value, "string");
      assert.ok(value.length > 0, `${language}.${key} is empty`);
      assert.ok(!value.includes("{count}"), `${language}.${key} has an unreplaced count placeholder`);
    }
  }
  assert.notEqual(C.t("en", "disclaimerTitle"), C.t("zh", "disclaimerTitle"));
});

test("translation interpolation and domain labels work in both languages", () => {
  assert.equal(C.t("en", "evidenceCount", { count: 3 }), "3 offers");
  assert.equal(C.t("zh", "evidenceCount", { count: 3 }), "3 条报价");
  assert.equal(C.categoryLabel("en", "computing"), "Computing");
  assert.equal(C.categoryLabel("zh", "computing"), "电脑");
  assert.equal(C.basisLabel("zh", "refurbished"), "翻新");
  assert.equal(C.outcomeLabel("en", "false_positive_and_false_negative"), "Wrong match (FP + FN)");
});

test("bilingual objects prefer the active language", () => {
  assert.equal(C.textFor("en", { en: "English", zh: "中文" }), "English");
  assert.equal(C.textFor("zh", { en: "English", zh: "中文" }), "中文");
  assert.equal(C.textFor("zh", { en: "English" }), "English");
});
