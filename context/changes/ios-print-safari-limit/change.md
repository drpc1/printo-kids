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
