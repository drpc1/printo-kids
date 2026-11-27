---
change_id: profile-card-summary
title: Podsumowanie ustawień kart w oknie profilu przy 16 kartach
status: archived
created: 2026-11-27
updated: 2026-11-27
archived_at: 2026-11-27T10:23:22Z
---

## Notes

S-52 (MS-04, FR-017, US-08). Podsumowanie ustawień kart w oknie profilu ma być czytelne i przyjazne rodzicowi przy 16 kartach; zmieniamy tylko widok, nie to, co profil zapamiętuje (decyzja 2026-11-27: bez zmian w danych profilu, stare profile czytają się jak dotąd). Dziś `ProfileSummary` w `src/components/ProfileCorner.tsx` wypisuje wszystkie 16 kart po min. 44 px (ok. 700 px), także te, których profil nie używał (szare „domyślne”); dane układa `cardSummaries` w `src/lib/card-summary.ts`. Wariantów kształtu widoku jeszcze nie wybrano (użyte plus zwinięte domyślne, cała lista zwinięta, grupy według umiejętności); decyzja w `/10x-plan`. Każda pozycja ma dalej prowadzić do strony karty, okno ma zostać małe i używalne na telefonie. Zalecany model: Sonnet 5.5, wysiłek medium (plan i implementacja), high przy `/10x-impl-review`.
