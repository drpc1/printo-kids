import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { DICTATION_LEVELS } from "./levels.ts";

void describe("DICTATION_LEVELS", () => {
  void test("keep their ids", () => {
    assert.deepEqual(
      DICTATION_LEVELS.map((level) => level.id),
      ["lat5", "lat6", "lat7"],
    );
  });

  void test("names, bar labels, descriptions and typical ages are the approved wording", () => {
    assert.deepEqual(
      DICTATION_LEVELS.map(({ label, barLabel, description, typicalAge }) => [
        label,
        barLabel,
        description,
        typicalAge,
      ]),
      [
        ["łatwy", "łatwy", "duża kratka, prosty obiekt", "zwykle ok. 5 lat"],
        ["średni", "średni", "mniejsza kratka, więcej poleceń", "zwykle ok. 6 lat"],
        ["trudny", "trudny", "mała kratka, bogaty obiekt, najwięcej poleceń", "zwykle ok. 7 lat"],
      ],
    );
    for (const level of DICTATION_LEVELS) {
      assert.doesNotMatch(level.label + level.barLabel, /lat|nastolat/, level.id);
    }
  });
});
