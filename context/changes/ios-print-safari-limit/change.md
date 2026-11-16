---
change_id: ios-print-safari-limit
title: Większa karta w druku z Safari i Chrome na iPhonie
status: new
created: 2026-11-16
updated: 2026-11-16
archived_at: null
---

## Notes

2026-11-16, zgłoszenie użytkowniczki: tablet z Androidem drukuje z dobrymi marginesami, iPhone dalej ma szerokie. Po powiększeniu wydruku do 114% jest dużo lepiej, a karta wciąż mieści się na jednej stronie.

Przyczyna (z pomiarów `context/archive/2026-10-16-print-printer-margins/manual-checks.md`): limit wysokości karty w druku na telefonie `108vh` (`src/components/GeneratorShell.astro`) wybrano pod Brave iOS, który przy 112vh i 116vh drukował drugą, pustą stronę. Ta sama jednostka daje w Brave większą kartę (108vh → ok. 166 mm) niż w Safari (108vh → ok. 151 mm). Safari mieścił 122vh (ok. 171 mm, zapas ok. 1,5 mm). 151 mm × 1,14 ≈ 172 mm, czyli zgłoszone 114%.

Cel: Safari i Chrome iOS dostają wyższy limit (ok. 118–120vh), Brave iOS zostaje przy 108vh, jeśli da się je rozróżnić. Brave iOS ma ten sam UA co Safari, a w październiku `hover: none` i `max-width: 175mm` były spełnione tak samo.

Sonda: `public/print-probe.html` (tymczasowa, statyczna, usunąć po pomiarach, przed wydaniem na `prod`). Na wydrukowanej kartce pokazuje szerokość i wysokość obszaru druku w jednostkach CSS (przedziały co 2 mm), czy działa wariant telefonu, UA, `navigator.brave` i wymiary okna; `?vh=100…130` (parzyste) ustawia limit tak jak w produkcie. Do zebrania: wydruk (podgląd) w Safari, Chrome iOS i Brave iOS, co najmniej `?vh=108` i `?vh=120`, zrzut z liczbą stron.

2026-11-16, sonda w Chrome iOS (iPhone użytkowniczki, A4, skalowanie 100%): odczyt obszaru druku 102–104 × 174–176 mm, czyli dokładnie okno na ekranie (393 × 665 px); zdarzenie druku w JS też podaje 393 × 665 px. Wniosek: na iOS zapytania media i `vh` w druku liczą się od okna przeglądarki na ekranie, nie od kartki, więc wielkość karty przy limicie w `vh` zależy od pasków przeglądarki (stąd różnica Brave / Safari), prawdopodobnie też od zwiniętego paska adresu i modelu telefonu. Limit: 100–122vh → 1 strona (karta rośnie proporcjonalnie), 124vh → 2 strony. `hover: none` i `max-width: 175mm` spełnione (wariant telefonu: TAK), `navigator.brave` brak.

Kolejny krok: tryby sondy niezależne od okna, `?w=70…100` (szerokość karty w % kartki, wysokość z proporcji A4) i `?mm=200…280` (limit wysokości w mm). Jeśli największa wartość mieszcząca się na 1 stronie jest taka sama w Safari, Chrome i Brave, limit na kartach przechodzi z `vh` na ten tryb.

2026-11-16, sonda w Brave iOS i Safari (ten sam iPhone, A4, skalowanie 100%). Wymiary karty odczytane z podglądu druku, w przybliżeniu.

| Przeglądarka | Okno    | Nagłówek / stopka na kartce            | vh                                 | Szerokość karty (`?w=`)           | Limit w mm (`?mm=`)         |
| ------------ | ------- | -------------------------------------- | ---------------------------------- | --------------------------------- | --------------------------- |
| Chrome iOS   | 393×665 | brak                                   | 122vh 1 str. (ok. 188 mm), 124vh 2 | 90% i 96% 1 str. (96% ok. 189 mm) | nie mierzono                |
| Brave iOS    | 393×655 | tytuł i data u góry, adres i nr u dołu | 104vh 1 str., **108vh 2 str.**     | 80–96% 1 str. (96% ok. 178 mm)    | 240 mm 1 str., 245 mm 2     |
| Safari       | 393×695 | adres, data i nr u dołu                | 118vh 1 str. (ok. 173 mm), 120vh 2 | 96% 1 str. (ok. 174 mm)           | 230 mm 1 str., **240 mm 2** |

`navigator.brave` w Brave iOS to `object` (w Chrome i Safari brak), więc Brave da się rozpoznać, ale nie było to potrzebne. Dzisiejsze `108vh` drukowało w Brave 2 strony (okno 655 px). Limit w mm daje różną kartę w Brave i Safari (przelicznik CSS → papier nie jest stały), więc odpada. Szerokość w % kartki daje 1 stronę w Safari, Brave i Chrome (96% sprawdzone w każdej); Safari przy 96% jest ok. 3 mm od drugiej strony. Ten sam procent daje w Chrome większą kartę niż w Safari (Chrome nie drukuje nagłówka ani stopki), ale zależność od okna znika.

Decyzja: wariant druku na telefonie to `width: 94%` kartki, `height: auto` (proporcje A4), bez limitu wysokości (`max-height: none`). Komputer bez zmian (`100vh`). Do sprawdzenia na stagingu na prawdziwych kartach w Safari, Chrome i Brave; potem usunąć `public/print-probe.html`.
