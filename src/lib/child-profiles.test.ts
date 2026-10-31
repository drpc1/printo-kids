import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  barAfterFavoriteSave,
  favoriteDiffers,
  openingVisit,
  profileNameError,
  profileToCreate,
  readChildProfiles,
  sortProfiles,
  visitAfterDelete,
  withFavorite,
  withProfileCards,
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

  void test("Zosia and Antek both come back", () => {
    assertStoredRead(
      stored([
        { id: "z1", name: "Zosia", character: "rakieta" },
        { id: "a1", name: "Antek", character: "dinozaur" },
      ]),
      [
        { id: "z1", name: "Zosia", character: "rakieta" },
        { id: "a1", name: "Antek", character: "dinozaur" },
      ],
    );
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

  void test("a profile without cards reads without a cards field", () => {
    assertStoredRead(JSON.stringify({ profiles: [{ id: "z1", name: "Zosia", character: "rakieta" }] }), [
      { id: "z1", name: "Zosia", character: "rakieta" },
    ]);
  });

  void test("a bad character still drops a profile that has a valid legacy level", () => {
    assertStoredRead(stored([{ id: "z1", name: "Zosia", character: "smok", level: "lat3" }]), []);
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

void describe("a stored list with malformed entries", () => {
  void test("drops each malformed entry and keeps the valid profiles", () => {
    const valid: ChildProfile = { id: "ok", name: "Zosia", character: "rakieta" };
    const entries: unknown[] = [
      null,
      5,
      "text",
      [],
      { name: "Bez id", character: "rakieta" },
      { id: 5, name: "Numer", character: "rakieta" },
      { id: "n", name: 5, character: "rakieta" },
      { id: "c", name: "Postac", character: 7 },
      valid,
    ];
    assertStoredRead(JSON.stringify({ profiles: entries }), [valid]);
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

  void test("Antek next to Zosia is not a duplicate", () => {
    assert.equal(profileNameError("Antek", ["Zosia"]), null);
  });

  void test("40 emoji code points is valid and 41 is too long", () => {
    const emoji = "😀";

    assert.equal(profileNameError(emoji.repeat(40), []), null);
    assert.equal(profileNameError(emoji.repeat(41), []), "too-long");
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

  void test("writing Zosia with rakieta and her maze level reads the same id, name, character, and cards", () => {
    const storage = memoryStorage(null);
    const profiles: ChildProfile[] = [
      { id: "z1", name: "Zosia", character: "rakieta", cards: { labirynt: { level: "lat3" } } },
    ];

    assert.equal(writeChildProfiles(storage, profiles), true);
    assert.deepEqual(storage.writes, [
      {
        key: KEY,
        value: '{"profiles":[{"id":"z1","name":"Zosia","character":"rakieta","cards":{"labirynt":{"level":"lat3"}}}]}',
      },
    ]);
    assert.deepEqual(readChildProfiles(storage, ALLOWED), profiles);
  });
});

void describe("openingVisit", () => {
  const lastUsed = { character: "samochodzik" } as const;

  void test("zero profiles keep the last-used character and level and do not ask", () => {
    assert.deepEqual(openingVisit([], lastUsed, null), {
      activeId: null,
      character: "samochodzik",
      ask: false,
    });
  });

  void test("one profile Zosia uses her id, character, and level and does not ask", () => {
    assert.deepEqual(openingVisit([{ id: "z1", name: "Zosia", character: "rakieta" }], lastUsed, null), {
      activeId: "z1",
      character: "rakieta",
      ask: false,
    });
  });

  void test("Zosia and Antek keep the last-used character and level and ask", () => {
    assert.deepEqual(
      openingVisit(
        [
          { id: "z1", name: "Zosia", character: "rakieta" },
          { id: "a1", name: "Antek", character: "dinozaur" },
        ],
        lastUsed,
        null,
      ),
      {
        activeId: null,
        character: "samochodzik",
        ask: true,
      },
    );
  });

  void describe("with a remembered active profile", () => {
    const zosia: ChildProfile = { id: "z1", name: "Zosia", character: "rakieta" };
    const antek: ChildProfile = { id: "a1", name: "Antek", character: "dinozaur" };

    void test("a stored id of an existing profile among two activates it with its character and level and does not ask", () => {
      assert.deepEqual(openingVisit([zosia, antek], lastUsed, "a1"), {
        activeId: "a1",
        character: "dinozaur",
        ask: false,
      });
    });

    void test('"none" with two profiles keeps nobody active, takes lastUsed, and does not ask', () => {
      assert.deepEqual(openingVisit([zosia, antek], lastUsed, "none"), {
        activeId: null,
        character: "samochodzik",
        ask: false,
      });
    });

    void test('"none" with one profile does not fall back to that profile', () => {
      assert.deepEqual(openingVisit([zosia], lastUsed, "none"), {
        activeId: null,
        character: "samochodzik",
        ask: false,
      });
    });

    void test("a stored id of a deleted profile falls back to the default rule for two profiles", () => {
      assert.deepEqual(openingVisit([zosia, antek], lastUsed, "gone"), {
        activeId: null,
        character: "samochodzik",
        ask: true,
      });
    });

    void test("a stored id of a deleted profile falls back to the only remaining profile", () => {
      assert.deepEqual(openingVisit([zosia], lastUsed, "gone"), {
        activeId: "z1",
        character: "rakieta",
        ask: false,
      });
    });
  });
});

void describe("withFavorite", () => {
  void test("saving dinozaur and lat6 for Zosia keeps the name Zosia and leaves Antek unchanged", () => {
    const profiles: ChildProfile[] = [
      { id: "z1", name: "Zosia", character: "rakieta" },
      { id: "a1", name: "Antek", character: "samochodzik" },
    ];
    const input: ChildProfile[] = profiles.map((profile) => ({ ...profile }));

    assert.deepEqual(withFavorite(profiles, "z1", "dinozaur", ALLOWED), [
      { id: "z1", name: "Zosia", character: "dinozaur" },
      { id: "a1", name: "Antek", character: "samochodzik" },
    ]);
    assert.deepEqual(profiles, input);
  });

  void test("an unknown id and a character outside the set return null", () => {
    const profiles: ChildProfile[] = [{ id: "z1", name: "Zosia", character: "rakieta" }];

    assert.equal(withFavorite(profiles, "missing", "dinozaur", ALLOWED), null);
    assert.equal(withFavorite(profiles, "z1", "smok", ALLOWED), null);
    assert.deepEqual(profiles, [{ id: "z1", name: "Zosia", character: "rakieta" }]);
  });

  void test("saving the same favorite again changes nothing, the maze level included", () => {
    const profiles: ChildProfile[] = [
      { id: "z1", name: "Zosia", character: "rakieta", cards: { labirynt: { level: "lat7" } } },
    ];

    assert.deepEqual(withFavorite(profiles, "z1", "rakieta", ALLOWED), profiles);
  });
});

const JPEG = "data:image/jpeg;base64,aaaa";
const PNG = "data:image/png;base64,bbbb";
const WITH_OWN = [...ALLOWED, "wlasne"];

void describe("profile image", () => {
  void test("a bad image value drops the field and keeps the profile", () => {
    const storage = memoryStorage(stored([{ id: "z1", name: "Zosia", character: "rakieta", image: "nope" }]));
    assert.deepEqual(readChildProfiles(storage, WITH_OWN), [{ id: "z1", name: "Zosia", character: "rakieta" }]);
    assert.deepEqual(storage.writes, []);
  });

  void test("wlasne without a drawable copy reads as none and does not write", () => {
    const missing = memoryStorage(stored([{ id: "z1", name: "Zosia", character: "wlasne" }]));
    assert.deepEqual(readChildProfiles(missing, WITH_OWN), [{ id: "z1", name: "Zosia", character: "none" }]);
    assert.deepEqual(missing.writes, []);

    const bad = memoryStorage(
      stored([{ id: "z1", name: "Zosia", character: "wlasne", image: "data:image/gif;base64,aaaa" }]),
    );
    assert.deepEqual(readChildProfiles(bad, WITH_OWN), [{ id: "z1", name: "Zosia", character: "none" }]);
    assert.deepEqual(bad.writes, []);
  });

  void test("wlasne keeps a JPEG or PNG data URL in image and never in character", () => {
    const storage = memoryStorage(stored([{ id: "z1", name: "Zosia", character: "wlasne", image: JPEG }]));
    const profiles = readChildProfiles(storage, WITH_OWN);
    assert.deepEqual(profiles, [{ id: "z1", name: "Zosia", character: "wlasne", image: JPEG }]);
    assert.equal(profiles[0].character.includes("data:"), false);
    assert.deepEqual(storage.writes, []);
  });

  void test("a data URL stored as the character drops that profile", () => {
    const storage = memoryStorage(
      stored([{ id: "z1", name: "Zosia", character: "data:image/png;base64,aaaa", image: PNG }]),
    );
    assert.deepEqual(readChildProfiles(storage, WITH_OWN), []);
    assert.deepEqual(storage.writes, []);
  });

  void test("Utwórz stores the device href on image and a catalog create clears it", () => {
    const created = profileToCreate("z1", "Zosia", "wlasne", JPEG);
    assert.ok(created);
    assert.equal(created.character, "wlasne");
    assert.equal(created.image, JPEG);
    assert.equal(created.character.includes("data:"), false);
    assert.equal(profileToCreate("z1", "Zosia", "wlasne", null), null);
    assert.equal(profileToCreate("z1", "Zosia", "data:image/png;base64,aaaa", JPEG), null);

    assert.deepEqual(profileToCreate("z1", "Zosia", "dinozaur", JPEG), {
      id: "z1",
      name: "Zosia",
      character: "dinozaur",
    });
  });

  void test("a favorite save stores image for wlasne and a catalog save clears it", () => {
    const profiles: ChildProfile[] = [{ id: "z1", name: "Zosia", character: "rakieta", image: JPEG }];

    assert.deepEqual(withFavorite(profiles, "z1", "wlasne", WITH_OWN, JPEG), [
      { id: "z1", name: "Zosia", character: "wlasne", image: JPEG },
    ]);
    assert.equal(withFavorite(profiles, "z1", "wlasne", WITH_OWN, null), null);
    assert.equal(withFavorite(profiles, "z1", "wlasne", WITH_OWN, "data:image/gif;base64,aaaa"), null);
    assert.deepEqual(withFavorite(profiles, "z1", "dinozaur", WITH_OWN, JPEG), [
      { id: "z1", name: "Zosia", character: "dinozaur" },
    ]);
    const cleared = withFavorite(profiles, "z1", "dinozaur", WITH_OWN);
    assert.ok(cleared);
    assert.equal("image" in cleared[0], false);
  });
});

void describe("barAfterFavoriteSave", () => {
  void test("a bar still showing the previous favorite becomes the saved favorite", () => {
    assert.equal(barAfterFavoriteSave("rakieta", "rakieta", "dinozaur"), "dinozaur");
  });

  void test("a bar already on samochodzik stays on samochodzik", () => {
    assert.equal(barAfterFavoriteSave("samochodzik", "rakieta", "dinozaur"), "samochodzik");
  });
});

void describe("visitAfterDelete", () => {
  const zosia: ChildProfile = { id: "z1", name: "Zosia", character: "rakieta" };
  const antek: ChildProfile = { id: "a1", name: "Antek", character: "dinozaur" };
  const basia: ChildProfile = { id: "b1", name: "Basia", character: "samochodzik" };
  const bar = { character: "samochodzik" } as const;
  const lastUsed = { character: "rakieta" } as const;

  void test("deleting Basia while Zosia is active keeps Zosia, the bar character and level, and does not ask", () => {
    const profiles = [zosia, antek, basia];

    assert.deepEqual(visitAfterDelete(profiles, "b1", "z1", bar, lastUsed), {
      profiles: [zosia, antek],
      activeId: "z1",
      character: "samochodzik",
      ask: false,
    });
    assert.deepEqual(profiles, [zosia, antek, basia]);
  });

  void test("deleting a profile while nobody is active and none-profile is stored keeps nobody active, even with one profile left", () => {
    assert.deepEqual(visitAfterDelete([zosia, antek], "z1", null, bar, lastUsed, "none"), {
      profiles: [antek],
      activeId: null,
      character: "rakieta",
      ask: false,
    });
  });

  void test("deleting active Zosia when only Antek remains activates Antek, his dinozaur, and his level", () => {
    assert.deepEqual(visitAfterDelete([zosia, antek], "z1", "z1", bar, lastUsed), {
      profiles: [antek],
      activeId: "a1",
      character: "dinozaur",
      ask: false,
    });
  });

  void test("deleting active Zosia when Antek and Basia remain clears the active child, takes lastUsed, and asks", () => {
    assert.deepEqual(visitAfterDelete([zosia, antek, basia], "z1", "z1", bar, lastUsed), {
      profiles: [antek, basia],
      activeId: null,
      character: "rakieta",
      ask: true,
    });
  });

  void test("deleting the only profile returns no active child, lastUsed, and does not ask", () => {
    assert.deepEqual(visitAfterDelete([zosia], "z1", "z1", bar, lastUsed), {
      profiles: [],
      activeId: null,
      character: "rakieta",
      ask: false,
    });
  });

  void test("with nobody active, deleting one of three asks and keeps lastUsed", () => {
    assert.deepEqual(visitAfterDelete([zosia, antek, basia], "b1", null, bar, lastUsed), {
      profiles: [zosia, antek],
      activeId: null,
      character: "rakieta",
      ask: true,
    });
  });

  void test("with nobody active, deleting one of two activates the remaining profile", () => {
    assert.deepEqual(visitAfterDelete([zosia, antek], "z1", null, bar, lastUsed), {
      profiles: [antek],
      activeId: "a1",
      character: "dinozaur",
      ask: false,
    });
  });

  void test("a missing id leaves the list, the active child, and the bar character and level unchanged", () => {
    const profiles = [zosia, antek, basia];

    assert.deepEqual(visitAfterDelete(profiles, "missing", "z1", bar, lastUsed), {
      profiles: [zosia, antek, basia],
      activeId: "z1",
      character: "samochodzik",
      ask: false,
    });
    assert.deepEqual(visitAfterDelete(profiles, "missing", null, bar, lastUsed), {
      profiles: [zosia, antek, basia],
      activeId: null,
      character: "samochodzik",
      ask: true,
    });
    assert.deepEqual(visitAfterDelete([zosia], "missing", null, bar, lastUsed), {
      profiles: [zosia],
      activeId: null,
      character: "samochodzik",
      ask: false,
    });
    assert.deepEqual(visitAfterDelete([zosia, antek], "missing", null, bar, lastUsed), {
      profiles: [zosia, antek],
      activeId: null,
      character: "samochodzik",
      ask: true,
    });
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

void describe("card settings in a profile", () => {
  const CARDS = { nonogram: { level: "trudny", category: "zwierzeta" } } as const;

  void test("an old profile without cards reads without a cards field", () => {
    assertStoredRead(stored([{ id: "z1", name: "Zosia", character: "rakieta" }]), [
      { id: "z1", name: "Zosia", character: "rakieta" },
    ]);
  });

  void test("stored cards read back and a bad field falls back to the default of that field", () => {
    assertStoredRead(
      stored([
        {
          id: "z1",
          name: "Zosia",
          character: "rakieta",
          cards: { nonogram: { level: "trudny", category: "nie-ma" }, sudoku: "śmieci" },
        },
      ]),
      [
        {
          id: "z1",
          name: "Zosia",
          character: "rakieta",
          cards: { nonogram: { level: "trudny", category: "wszystkie" } },
        },
      ],
    );
  });

  void test("garbage in cards reads as empty cards and keeps the profile", () => {
    assertStoredRead(stored([{ id: "z1", name: "Zosia", character: "rakieta", cards: 7 }]), [
      { id: "z1", name: "Zosia", character: "rakieta", cards: {} },
    ]);
  });

  void test("withFavorite keeps the cards of the saved profile and of the others", () => {
    const profiles: ChildProfile[] = [
      { id: "z1", name: "Zosia", character: "rakieta", cards: CARDS },
      { id: "a1", name: "Antek", character: "samochodzik", cards: CARDS },
    ];

    assert.deepEqual(withFavorite(profiles, "z1", "dinozaur", ALLOWED), [
      { id: "z1", name: "Zosia", character: "dinozaur", cards: CARDS },
      { id: "a1", name: "Antek", character: "samochodzik", cards: CARDS },
    ]);
  });

  void test("withFavorite keeps the cards when the favorite is the own image", () => {
    const profiles: ChildProfile[] = [{ id: "z1", name: "Zosia", character: "rakieta", cards: CARDS }];

    assert.deepEqual(withFavorite(profiles, "z1", "wlasne", WITH_OWN, JPEG), [
      { id: "z1", name: "Zosia", character: "wlasne", image: JPEG, cards: CARDS },
    ]);
  });

  void test("profileToCreate carries the cards it is given and adds none otherwise", () => {
    assert.deepEqual(profileToCreate("z1", "Zosia", "rakieta", null, CARDS), {
      id: "z1",
      name: "Zosia",
      character: "rakieta",
      cards: CARDS,
    });
    assert.deepEqual(profileToCreate("z1", "Zosia", "rakieta", null), {
      id: "z1",
      name: "Zosia",
      character: "rakieta",
    });
    assert.deepEqual(profileToCreate("z1", "Zosia", "wlasne", JPEG, CARDS), {
      id: "z1",
      name: "Zosia",
      character: "wlasne",
      image: JPEG,
      cards: CARDS,
    });
  });

  void test("withProfileCards replaces the cards of one profile and nothing else", () => {
    const profiles: ChildProfile[] = [
      { id: "z1", name: "Zosia", character: "rakieta", image: JPEG },
      { id: "a1", name: "Antek", character: "samochodzik" },
    ];

    assert.deepEqual(withProfileCards(profiles, "z1", CARDS), [
      { id: "z1", name: "Zosia", character: "rakieta", image: JPEG, cards: CARDS },
      { id: "a1", name: "Antek", character: "samochodzik" },
    ]);
    assert.equal(withProfileCards(profiles, "missing", CARDS), null);
  });
});

void describe("a legacy profile level moves to cards.labirynt on read", () => {
  void test("a stored level reads as the maze level of the profile", () => {
    assertStoredRead(stored([{ id: "z1", name: "Zosia", character: "rakieta", level: "nastolatek" }]), [
      { id: "z1", name: "Zosia", character: "rakieta", cards: { labirynt: { level: "nastolatek" } } },
    ]);
  });

  void test("the other cards of the profile stay and the maze joins them", () => {
    assertStoredRead(
      stored([
        {
          id: "z1",
          name: "Zosia",
          character: "rakieta",
          level: "lat6",
          cards: { nonogram: { level: "trudny", category: "zwierzeta" } },
        },
      ]),
      [
        {
          id: "z1",
          name: "Zosia",
          character: "rakieta",
          cards: { nonogram: { level: "trudny", category: "zwierzeta" }, labirynt: { level: "lat6" } },
        },
      ],
    );
  });

  void test("a valid cards.labirynt wins over the legacy level", () => {
    assertStoredRead(
      stored([
        { id: "z1", name: "Zosia", character: "rakieta", level: "lat6", cards: { labirynt: { level: "lat3" } } },
      ]),
      [{ id: "z1", name: "Zosia", character: "rakieta", cards: { labirynt: { level: "lat3" } } }],
    );
  });

  void test("a cards.labirynt with a bad level falls back to a valid legacy level, then to the default", () => {
    assertStoredRead(
      stored([
        { id: "z1", name: "Zosia", character: "rakieta", level: "lat6", cards: { labirynt: { level: "lat9" } } },
        { id: "a1", name: "Antek", character: "dinozaur", cards: { labirynt: { level: "lat9" } } },
      ]),
      [
        { id: "z1", name: "Zosia", character: "rakieta", cards: { labirynt: { level: "lat6" } } },
        { id: "a1", name: "Antek", character: "dinozaur", cards: { labirynt: { level: "lat5" } } },
      ],
    );
  });

  void test("a missing or unknown legacy level does not create a maze entry, so the page starts from the default", () => {
    assertStoredRead(
      stored([
        { id: "z1", name: "Zosia", character: "rakieta", level: "lat9" },
        { id: "a1", name: "Antek", character: "dinozaur", level: 6 },
      ]),
      [
        { id: "z1", name: "Zosia", character: "rakieta" },
        { id: "a1", name: "Antek", character: "dinozaur" },
      ],
    );
  });

  void test("a legacy level next to garbage cards still becomes the maze level", () => {
    assertStoredRead(stored([{ id: "z1", name: "Zosia", character: "rakieta", level: "lat4", cards: 7 }]), [
      { id: "z1", name: "Zosia", character: "rakieta", cards: { labirynt: { level: "lat4" } } },
    ]);
  });

  void test("writing a read legacy profile stores the new shape and no top-level level", () => {
    const storage = memoryStorage(stored([{ id: "z1", name: "Zosia", character: "rakieta", level: "lat6" }]));
    const profiles = readChildProfiles(storage, ALLOWED);

    assert.equal(writeChildProfiles(storage, profiles), true);
    assert.deepEqual(storage.writes, [
      {
        key: KEY,
        value: '{"profiles":[{"id":"z1","name":"Zosia","character":"rakieta","cards":{"labirynt":{"level":"lat6"}}}]}',
      },
    ]);
    assert.deepEqual(readChildProfiles(storage, ALLOWED), profiles);
  });

  void test("a favorite save and a catalog create keep the maze level in cards", () => {
    const cards = { labirynt: { level: "lat6" } } as const;
    assert.deepEqual(
      withFavorite([{ id: "z1", name: "Zosia", character: "rakieta", cards }], "z1", "dinozaur", ALLOWED),
      [{ id: "z1", name: "Zosia", character: "dinozaur", cards }],
    );
    assert.deepEqual(profileToCreate("z1", "Zosia", "rakieta", null, cards), {
      id: "z1",
      name: "Zosia",
      character: "rakieta",
      cards,
    });
  });
});

function assertStoredRead(storedValue: string | null, expected: ChildProfile[]): void {
  const storage = memoryStorage(storedValue);

  assert.deepEqual(readChildProfiles(storage, ALLOWED), expected);
  assert.deepEqual(storage.writes, []);
}

function stored(profiles: Record<string, unknown>[]): string {
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

void describe("favoriteDiffers", () => {
  const kot: ChildProfile = { id: "z1", name: "Zosia", character: "kot" };
  const own: ChildProfile = { id: "z1", name: "Zosia", character: "wlasne", image: JPEG };

  void test("the same catalog character is not different, another one is", () => {
    assert.equal(favoriteDiffers(kot, "kot", null), false);
    assert.equal(favoriteDiffers(kot, "smok", null), true);
    assert.equal(favoriteDiffers(kot, "none", null), true);
    assert.equal(favoriteDiffers(kot, "wlasne", PNG), true);
    // A catalog favorite is the same character whatever picture the bar still remembers.
    assert.equal(favoriteDiffers(kot, "kot", PNG), false);
  });

  void test("an own-image favorite differs when the bar shows another character or another picture", () => {
    assert.equal(favoriteDiffers(own, "wlasne", JPEG), false);
    assert.equal(favoriteDiffers(own, "wlasne", PNG), true);
    assert.equal(favoriteDiffers(own, "kot", null), true);
  });

  void test("a stored wlasne without a drawable picture is shown as none and does not offer itself", () => {
    const broken: ChildProfile = { id: "z1", name: "Zosia", character: "wlasne" };
    assert.equal(favoriteDiffers(broken, "none", null), false);
    assert.equal(favoriteDiffers(broken, "kot", null), true);
  });
});
