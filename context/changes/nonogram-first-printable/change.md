---
change_id: nonogram-first-printable
title: Nonogram — strona, generowanie, podgląd i druk A4 (S-22)
status: implementing
created: 2026-10-25
updated: 2026-10-25
archived_at: null
---

## Notes

S-22 z `context/foundation/roadmap.md`, issue drpc1/printo-kids#93, PRD US-15 i FR-024. Nonogram średni 12×15, rozwiązanie to cała sylwetka obiektu z szablonów symetrii (połowa 6×15 + odbicie, kolory pomijane, dziury zostają puste). Solver sprawdza dokładnie jedno rozwiązanie; testowany też na 8×12 i 18×24 (limit 5 s) pod S-24. Zanotować w PR, ile dzisiejszych wariantów 12×15 ma jedno rozwiązanie (PRD Open Questions 11).
