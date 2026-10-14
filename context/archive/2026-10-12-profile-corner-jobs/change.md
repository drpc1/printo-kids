---
change_id: profile-corner-jobs
title: Okno profili pokazuje naraz wybór, edycję, usuwanie i dodawanie
status: archived
created: 2026-10-12
updated: 2026-10-14
archived_at: 2026-10-14T20:06:06Z
---

## Notes

Nie podoba mi się jak wygląda okno z profilami. Mamy tam różne funkcje, różne tematy. Wygląd okna jest nieintuicyjny. Trzeba oddzielić listę profili od edycji.

Faza 1 commitnęła `src/components/ui/tooltip.tsx` (shadcn): plan zakładał już tooltips kosza, ale plik nie był w HEAD — bez niego ołówek i kosz nie miały TooltipProvider.
