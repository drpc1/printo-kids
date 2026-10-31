# Follow-ups z impl-review (gh234-profile-on-homepage)

- F1 (WARNING): `CatalogProfileCorner` odświeżać na `pageshow` (persisted) i `storage` przez zmianę `key`, żeby róg zgadzał się z plakietkami po powrocie ze strony karty (bfcache) i po zmianie w innej karcie. Dodać test E2E. Naprawa w osobnym PR.
