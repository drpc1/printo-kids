# Lessons Learned

> Append-only register of recurring rules and patterns. Re-read at start by /10x-frame, /10x-research, /10x-plan, /10x-plan-review, /10x-implement, /10x-impl-review.

## Mierz wartości druku w każdej przeglądarce iOS osobno

- **Context**: reguły `@media print` zależne od `vh`/mm i wymiary karty w druku na iPhonie (Safari, Chrome iOS, Brave iOS)
- **Problem**: wartość zmierzona w Safari (`116vh`) w Brave iOS dawała 2 strony, bo Brave dokłada nagłówek strony i ma mniej miejsca (GH #38)
- **Rule**: Limit wysokości w druku ustalaj z pomiaru w Safari, Chrome iOS i Brave iOS i bierz wartość, która mieści się w najmniejszym obszarze; wartości z jednej przeglądarki nie przenoś na inne.
- **Applies to**: plan, implement, impl-review
