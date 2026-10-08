import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  openingVisit,
  profileNameError,
  readChildProfiles,
  sortProfiles,
  writeChildProfiles,
  type ChildProfile,
  type ChildProfileStorage,
} from "./child-profiles.ts";

const KEY = "printo-kids:child-profiles";
const ALLOWED = ["none", "samochodzik", "rakieta", "dinozaur"];

interface StoredWrite {
  key: string;
  value: string;
}

void describe("readChildProfiles", () => {
  void test("a missing key reads an empty list and does not write", () => {
    assertStoredRead(null, []);
  });

  void test("an empty string reads an empty list and does not write", () => {
    assertStoredRead("", []);
  });

  void test("invalid JSON reads an empty list and does not write", () => {
    assertStoredRead("{", []);
  });

  void test("an object without a profiles array reads an empty list and does not write", () => {
    assertStoredRead("{}", []);
  });

  void test("a character outside the allow-list is dropped and does not write", () => {
    assertStoredRead(stored([{ id: "1", name: "Zosia", character: "smok" }]), []);
  });

  void test("an empty id is dropped and does not write", () => {
    assertStoredRead(stored([{ id: "", name: "Zosia", character: "rakieta" }]), []);
  });

  void test("a repeated id keeps the first profile and does not write", () => {
    assertStoredRead(
      stored([
        { id: "same", name: "Zosia", character: "rakieta" },
        { id: "same", name: "Antek", character: "dinozaur" },
      ]),
      [{ id: "same", name: "Zosia", character: "rakieta" }],
    );
  });

  void test("a name of only spaces is dropped and does not write", () => {
    assertStoredRead(stored([{ id: "1", name: "   ", character: "rakieta" }]), []);
  });

  void test("a padded name is kept trimmed and does not write", () => {
    assertStoredRead(stored([{ id: "1", name: " Zosia ", character: "rakieta" }]), [
      { id: "1", name: "Zosia", character: "rakieta" },
    ]);
  });

  void test("a second name that matches regardless of case is dropped and does not write", () => {
    assertStoredRead(
      stored([
        { id: "1", name: "Zosia", character: "rakieta" },
        { id: "2", name: "zosia", character: "dinozaur" },
      ]),
      [{ id: "1", name: "Zosia", character: "rakieta" }],
    );
  });

  void test("a name longer than 40 code points is dropped and does not write", () => {
    assertStoredRead(stored([{ id: "1", name: "a".repeat(41), character: "rakieta" }]), []);
  });

  void test("a throwing getItem reads an empty list and does not write", () => {
    let writes = 0;
    const storage: ChildProfileStorage = {
      getItem(): string | null {
        throw new Error("getItem blocked");
      },
      setItem(): void {
        writes += 1;
        throw new Error("setItem blocked");
      },
    };

    assert.deepEqual(readChildProfiles(storage, ALLOWED), []);
    assert.equal(writes, 0);
  });
});

void describe("profileNameError", () => {
  void test('" Zosia " against an empty list is valid', () => {
    assert.equal(profileNameError(" Zosia ", []), null);
  });

  void test("a whitespace-only name is empty", () => {
    assert.equal(profileNameError("   ", []), "empty");
  });

  void test("40 code points is valid", () => {
    assert.equal(profileNameError("a".repeat(40), []), null);
  });

  void test("41 code points is too long", () => {
    assert.equal(profileNameError("a".repeat(41), []), "too-long");
  });

  void test('"zosia" duplicates an existing Zosia', () => {
    assert.equal(profileNameError("zosia", ["Zosia"]), "duplicate");
  });
});

void describe("writeChildProfiles", () => {
  void test("a throwing setItem returns false and does not throw", () => {
    const storage: ChildProfileStorage = {
      getItem(): string | null {
        return null;
      },
      setItem(): void {
        throw new Error("setItem blocked");
      },
    };
    const profiles: ChildProfile[] = [{ id: "1", name: "Zosia", character: "rakieta" }];

    assert.equal(writeChildProfiles(storage, profiles), false);
  });

  void test("writing Zosia with rakieta reads the same id, name, and character", () => {
    const storage = memoryStorage(null);
    const profiles: ChildProfile[] = [{ id: "z1", name: "Zosia", character: "rakieta" }];

    assert.equal(writeChildProfiles(storage, profiles), true);
    assert.deepEqual(storage.writes, [
      {
        key: KEY,
        value: '{"profiles":[{"id":"z1","name":"Zosia","character":"rakieta"}]}',
      },
    ]);
    assert.deepEqual(readChildProfiles(storage, ALLOWED), profiles);
  });
});

void describe("openingVisit", () => {
  void test("zero profiles and lastUsed samochodzik keep samochodzik and do not ask", () => {
    assert.deepEqual(openingVisit([], "samochodzik"), {
      activeId: null,
      character: "samochodzik",
      ask: false,
    });
  });

  void test("one profile Zosia with rakieta uses that id and rakieta and does not ask", () => {
    assert.deepEqual(openingVisit([{ id: "z1", name: "Zosia", character: "rakieta" }], "samochodzik"), {
      activeId: "z1",
      character: "rakieta",
      ask: false,
    });
  });

  void test("Zosia and Antek with lastUsed samochodzik keep samochodzik and ask", () => {
    assert.deepEqual(
      openingVisit(
        [
          { id: "z1", name: "Zosia", character: "rakieta" },
          { id: "a1", name: "Antek", character: "dinozaur" },
        ],
        "samochodzik",
      ),
      {
        activeId: null,
        character: "samochodzik",
        ask: true,
      },
    );
  });
});

void describe("sortProfiles", () => {
  void test("orders Antek, Basia, Łucja, Zosia and leaves the input array unchanged", () => {
    const profiles: ChildProfile[] = [
      { id: "z", name: "Zosia", character: "rakieta" },
      { id: "l", name: "Łucja", character: "dinozaur" },
      { id: "b", name: "Basia", character: "samochodzik" },
      { id: "a", name: "Antek", character: "none" },
    ];
    const input: ChildProfile[] = profiles.map((profile) => ({ ...profile }));
    const ordered = sortProfiles(profiles);

    assert.deepEqual(ordered, [
      { id: "a", name: "Antek", character: "none" },
      { id: "b", name: "Basia", character: "samochodzik" },
      { id: "l", name: "Łucja", character: "dinozaur" },
      { id: "z", name: "Zosia", character: "rakieta" },
    ]);
    assert.notEqual(ordered, profiles);
    assert.deepEqual(profiles, input);
  });
});

function assertStoredRead(storedValue: string | null, expected: ChildProfile[]): void {
  const storage = memoryStorage(storedValue);

  assert.deepEqual(readChildProfiles(storage, ALLOWED), expected);
  assert.deepEqual(storage.writes, []);
}

function stored(profiles: ChildProfile[]): string {
  return JSON.stringify({ profiles });
}

function memoryStorage(storedValue: string | null): ChildProfileStorage & { writes: StoredWrite[] } {
  const items = new Map<string, string>();
  const writes: StoredWrite[] = [];
  if (storedValue !== null) {
    items.set(KEY, storedValue);
  }

  return {
    writes,
    getItem(key: string): string | null {
      return items.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      writes.push({ key, value });
      items.set(key, value);
    },
  };
}
