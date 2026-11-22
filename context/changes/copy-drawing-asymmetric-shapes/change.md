---
change_id: copy-drawing-asymmetric-shapes
title: „Skopiuj obrazek” z kształtami niesymetrycznymi z katalogu dyktanda (S-55)
status: implemented
created: 2026-11-21
updated: 2026-11-22
archived_at: null
---

## Notes

„Skopiuj obrazek” z kształtami niesymetrycznymi (S-55, GitHub 379). Decyzje użytkowniczki 2026-11-21: wchodzą wszystkie 16 kształtów dyktanda, każdy na poziomach, na których ma rysunek; po włączeniu kolorów kolorowa bitmapa (kredka na kratkę, jak szablony symetrii), nie jedna kredka na kształt.

Makieta zaakceptowana 2026-11-21 (`mockup.mts` generuje `mockup-colors.json` i `preview.html`; `preview.html` to podgląd, nie do commitu, jeśli plan tak zdecyduje):

- Klucz poziomy wypada z karty (zostaje w dyktandzie): na karcie 15 kształtów.
- Nowe rysunki, wspólne z dyktandem, w `REDRAWN` w `mockup.mts`: renifer (13×19, krótszy tułów), ciężarówka średni 12×8 i trudny 18×11 (proporcje łatwej), helikopter średni 12×8 (jak trudny), dinozaur na trzech poziomach (ogon do ziemi), skarpeta na trzech poziomach (prosty tył, pięta bez wystawania, dłuższa stopa). Wszystkie przechodzą reguły dyktanda, także odbite (sprawdza to makieta).
- Kolory: pojazdy z niebieskimi szybami (lokomotywa z zieloną kabiną, ciężarówka z pomarańczową skrzynią, statek z czerwonym kadłubem i czarnym kominem), skarpeta wariant A (szary mankiet, paski czerwone i zielone), laska w ukośne pasy czerwone i szare, klucz pionowy cały żółty.
- Domyślne bez pytania: odbicie w poziomie jako wariant kształtu na karcie, jak w dyktandzie.
