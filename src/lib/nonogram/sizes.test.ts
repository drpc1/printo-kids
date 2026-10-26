import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { NONOGRAM_SIZES } from "./sizes.ts";

void describe("NONOGRAM_SIZES", () => {
  void test("keep their ids", () => {
    assert.deepEqual(
      NONOGRAM_SIZES.map((size) => size.id),
      ["latwy", "sredni", "trudny"],
    );
  });

  void test("names, bar labels and descriptions are the approved wording, without an age", () => {
    assert.deepEqual(
      NONOGRAM_SIZES.map(({ label, barLabel, description }) => [label, barLabel, description]),
      [
        ["łatwy", "łatwy", "znaczki przy wierszach, duża kratka"],
        ["średni", "średni", "liczby przy wierszach i kolumnach"],
        ["trudny", "trudny", "liczby, gęsta kratka, bogatszy obrazek"],
      ],
    );
    for (const size of NONOGRAM_SIZES) {
      assert.doesNotMatch(size.label + size.barLabel, /lat|nastolat/, size.id);
    }
  });
});
