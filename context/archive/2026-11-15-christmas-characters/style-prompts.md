# Styl i prompty: Mikołaj, renifer, bałwanek (S-39)

> Faza rysunków przed kodem. Rysunki generuje użytkowniczka (AI), tak jak jedenaście istniejących postaci.
> Wzorce stylu obejrzane 2026-11-15: `public/characters/kot.webp`, `strazak.webp`, `wrozka.webp`, `dinozaur.webp`, `robot.webp`.

## Styl istniejących postaci

- **Technika:** płaska ilustracja wektorowa w stylu naklejki dla dzieci. Bez cieni, gradientów, faktury, połysku i 3D.
- **Kontur:** jednolity, ciemnobrązowy (ok. `#3B2A20`, nie czarny), średniej grubości (ok. 3 px na 512 px), zaokrąglone końce. Ta sama grubość wokół sylwetki i na detalach.
- **Kolory:** płaskie, lekko przygaszone i ciepłe. Każda plama ma jeden kolor, a jaśniejszy odcień pojawia się co najwyżej jako druga plama (np. jasny brzuch kota albo dinozaura). Przykłady z katalogu: rudy `#E8A65A`, czerwony `#E0453A`, żółty `#F5C542`, błękit `#7DB8E8`, zieleń szałwiowa `#8FAF7A`, skóra `#F6CFA0`.
- **Twarz:** małe czarne oczy-kropki (zwierzęta mają czasem mały biały błysk), mały prosty uśmiech, bez rumieńców i bez rzęs. Ludzie mają nos ledwo zaznaczony albo bez nosa.
- **Proporcje:** „chibi”. U ludzi głowa zajmuje ok. 1/3 wysokości, tułów i nogi są krótkie, ręce proste, wzdłuż ciała albo lekko odchylone.
- **Ujęcie:** cała postać, stoi. Ludzie z przodu (strażak, wróżka), zwierzęta z boku w 3/4, zwrócone w prawo (kot, dinozaur).
- **Kadr:** kwadrat 512×512, tło przezroczyste. Postać na środku w poziomie zajmuje ok. 60–65% wysokości: góra ok. 95 px, stopy ok. 415 px od góry. Szerokość wynika z postaci, nie z kadru, a po bokach zostaje wolne pole.
- **Bez:** tła, podłoża, cienia pod stopami, napisów, ramki, śniegu i gwiazdek wokół postaci.

## Wspólny początek promptu (EN)

Generatory lepiej trzymają styl po angielsku. Do każdego promptu dołącz jako obraz-wzór `kot.webp` i `strazak.webp`, jeśli narzędzie przyjmuje wzorce stylu (lub kontynuuj w tej samej rozmowie, w której powstały istniejące postacie).

```
Flat vector children's sticker illustration, same style as the reference images: uniform dark brown outline (#3B2A20, about 3 px at 512 px, rounded), flat muted warm colors with no gradients, no shading, no texture, no 3D. Simple cute chibi proportions, small black dot eyes, small simple smile, no blush. Full body, standing, centered, character fills about 62% of the image height with empty space around it. Square 512x512, fully transparent background, no ground, no shadow, no snow, no text, no frame.
```

## Mikołaj

Ujęcie z przodu, jak strażak i wróżka.

```
[wspólny początek]
Subject: Santa Claus, front view like the reference firefighter. Red coat and red trousers with white fluffy trim, black belt with a small yellow square buckle, short dark brown boots, red pointed hat with white trim and white pompom flopping to one side, round white beard and moustache covering the lower face, skin-tone face with dot eyes, arms slightly away from the body, white mittens or bare hands. Generic Santa, not a brand mascot, no sack, no bottle, no logo.
```

Kolory: czerwony jak strażak (`#E0453A`), biały futerka `#FFFFFF` (w druku: białe pole z brązowym konturem), skóra `#F6CFA0`, pas `#3B2A20`, klamra `#F5C542`.

## Renifer

Ujęcie z boku w 3/4, zwrócony w prawo, jak kot i dinozaur.

```
[wspólny początek]
Subject: a young reindeer, side three-quarter view facing right like the reference cat, standing on four legs. Warm brown body (#B07A4A) with a lighter cream belly and muzzle, small dark brown nose (not red, not glowing), simple branching antlers in light tan with only two or three short tines each, small ears, short white tail, dark brown hooves. No harness, no bells, no scarf, no sleigh.
```

Nos nie jest czerwony, żeby nie był to Rudolf (znak towarowy, PRD OQ 3).

## Bałwanek

Ujęcie z przodu.

```
[wspólny początek]
Subject: a cute snowman, front view, two stacked round snowballs (small head on a bigger body) in white with a very light blue-grey inner tone, black top hat with a red band, orange carrot nose pointing slightly to the side, black dot eyes and a small dotted smile, red knitted scarf with one end hanging down, three dark brown coal buttons, two thin brown twig arms. No broom, no snow on the ground.
```

Biel na białej kartce gubi sylwetkę, więc liczy się wyraźny kontur. Jasnoniebieskoszary odcień (np. `#E8EEF3`) w środku kul jest dozwolony jako druga plama.

## Odbiór plików

Pliki: `mikolaj.webp`, `renifer.webp`, `balwanek.webp` (id bez polskich znaków, jak `strazak`, `wrozka`). PNG też jest w porządku, konwersję na webp robi kod (jak w GH 343).

Sprawdzam każdy plik przed makietą:

1. 512×512 (albo większy kwadrat do zmniejszenia), tło przezroczyste, bez białej ramki ani poświaty na brzegu.
2. Kontur brązowy, a nie czarny, i tej samej grubości co u kota.
3. Wysokość postaci 60–65% kadru, stopy na wysokości stóp strażaka (ok. 415 px).
4. Obok kota i strażaka w wierszu listy 40 px wygląda jak z jednego zestawu.
5. Pomiar `contentLeft` i `contentRight` (pierwszy i ostatni nieprzezroczysty piksel), do `CHARACTER_CHOICES`.

Potem makieta PNG do akceptacji: trzy postacie w liście 15 wierszy na telefonie, Mikołaj przy poleceniu z dymkiem i renifer przy starcie Poziomu 6 labiryntu.

## Odbiór plików (2026-11-15)

Pliki od użytkowniczki: `public/characters/mikolaj.webp`, `renifer.webp`, `balwanek.webp` (512×512, alfa, nic nie dotyka brzegu). Styl zgodny: brązowy kontur, płaskie ciepłe kolory, oczy-kropki. Bałwanek bez kapelusza, renifer z ciemnym nosem (nie Rudolf).

Kadr się różnił. Jedenaście istniejących postaci ma obrys dokładnie y 96–415 (320 px) i jest wyśrodkowanych w poziomie:

| Postać   | Plik od użytkowniczki | Po dopasowaniu | contentLeft / contentRight |
| -------- | --------------------- | -------------- | -------------------------- |
| Mikołaj  | y 29–443 (81%)        | y 96–415       | 376 / 376                  |
| Renifer  | y 81–418, w lewo      | y 96–415       | 258 / 258                  |
| Bałwanek | y 97–423              | y 96–415       | 298 / 296                  |

`mockup-lineup.mts` skaluje obrys do 320 px, stawia go od y 96 i środkuje (`normalized/<id>.png`). Pliki w `public/` zostają nietknięte. `mockup-lineup.png` pokazuje wzór, pliki przed i po dopasowaniu oraz rząd 40 px jak w liście. W kodzie (plan) dopasowane PNG idą do `context/ideas/postacie/`, a webp robi `scripts/characters-webp.mjs`, jak przy jedenastu postaciach.
