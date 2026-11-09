// Ikony wektorowe do reguły „kategoria obiektu” (makieta S-34). Każda ikona to fragment SVG w pudełku 100×100:
// czarna sylwetka (#000) z białymi detalami (#fff). Rysowane tu na makietę; po decyzji trafią do src/lib/odd-one-out/.

export type IconCategory = "zwierzeta" | "jedzenie" | "przyroda" | "kosmos" | "budowle";

export interface Icon {
  id: string;
  name: string;
  category: IconCategory;
  svg: string;
}

const K = 'fill="#000"';
const W = 'fill="#fff"';

export const ICONS: readonly Icon[] = [
  // Zwierzęta
  {
    id: "kot",
    name: "kot",
    category: "zwierzeta",
    svg: `<polygon ${K} points="20,44 28,6 48,30"/><polygon ${K} points="80,44 72,6 52,30"/><circle ${K} cx="50" cy="56" r="34"/><ellipse ${W} cx="37" cy="50" rx="5" ry="7"/><ellipse ${W} cx="63" cy="50" rx="5" ry="7"/><polygon ${W} points="45,63 55,63 50,69"/>`,
  },
  {
    id: "ryba",
    name: "ryba",
    category: "zwierzeta",
    svg: `<ellipse ${K} cx="42" cy="50" rx="34" ry="22"/><polygon ${K} points="66,50 96,26 96,74"/><circle ${W} cx="27" cy="44" r="5"/>`,
  },
  {
    id: "ptak",
    name: "ptak",
    category: "zwierzeta",
    svg: `<ellipse ${K} cx="54" cy="58" rx="30" ry="22"/><circle ${K} cx="30" cy="36" r="16"/><polygon ${K} points="16,32 2,40 16,44"/><polygon ${K} points="78,50 98,36 94,64"/><rect ${K} x="44" y="76" width="5" height="18"/><rect ${K} x="58" y="76" width="5" height="18"/><circle ${W} cx="27" cy="33" r="4"/>`,
  },
  {
    id: "zolw",
    name: "żółw",
    category: "zwierzeta",
    svg: `<path ${K} d="M10,66 A38,36 0 0 1 86,66 Z"/><circle ${K} cx="88" cy="62" r="10"/><rect ${K} x="20" y="62" width="14" height="18" rx="3"/><rect ${K} x="62" y="62" width="14" height="18" rx="3"/><polygon ${K} points="12,60 2,68 12,68"/><circle ${W} cx="91" cy="59" r="2.5"/><path d="M30,64 L38,44 L58,44 L66,64 M48,30 L48,44" stroke="#fff" stroke-width="3" fill="none"/>`,
  },
  {
    id: "krolik",
    name: "królik",
    category: "zwierzeta",
    svg: `<ellipse ${K} cx="38" cy="26" rx="9" ry="24"/><ellipse ${K} cx="62" cy="26" rx="9" ry="24"/><circle ${K} cx="50" cy="66" r="28"/><ellipse ${W} cx="38" cy="22" rx="3.5" ry="15"/><ellipse ${W} cx="62" cy="22" rx="3.5" ry="15"/><circle ${W} cx="40" cy="60" r="4.5"/><circle ${W} cx="60" cy="60" r="4.5"/><ellipse ${W} cx="50" cy="73" rx="5" ry="3.5"/>`,
  },
  // Jedzenie
  {
    id: "jablko",
    name: "jabłko",
    category: "jedzenie",
    svg: `<circle ${K} cx="37" cy="58" r="28"/><circle ${K} cx="63" cy="58" r="28"/><circle ${K} cx="50" cy="68" r="27"/><rect ${K} x="47" y="12" width="6" height="22" rx="2"/><ellipse ${K} cx="67" cy="22" rx="13" ry="6" transform="rotate(-25 67 22)"/><ellipse ${W} cx="34" cy="52" rx="5" ry="9" transform="rotate(20 34 52)"/>`,
  },
  {
    id: "gruszka",
    name: "gruszka",
    category: "jedzenie",
    svg: `<circle ${K} cx="50" cy="68" r="27"/><circle ${K} cx="50" cy="36" r="16"/><polygon ${K} points="34,38 66,38 76,66 24,66"/><rect ${K} x="47" y="6" width="6" height="18" rx="2"/><ellipse ${K} cx="63" cy="14" rx="10" ry="5" transform="rotate(-25 63 14)"/>`,
  },
  {
    id: "marchewka",
    name: "marchewka",
    category: "jedzenie",
    svg: `<polygon ${K} points="34,30 66,30 50,98"/><polygon ${K} points="44,32 30,4 50,26"/><polygon ${K} points="50,32 50,2 56,26"/><polygon ${K} points="56,32 70,4 50,26"/><path d="M38,46 L48,46 M52,60 L60,60 M42,72 L50,72" stroke="#fff" stroke-width="3"/>`,
  },
  {
    id: "lody",
    name: "lody",
    category: "jedzenie",
    svg: `<polygon ${K} points="30,50 70,50 50,98"/><circle ${K} cx="50" cy="38" r="24"/><circle ${K} cx="50" cy="12" r="6"/><path d="M36,56 L58,78 M64,56 L42,78 M48,56 L62,70 M52,56 L38,70" stroke="#fff" stroke-width="2.5"/>`,
  },
  {
    id: "banan",
    name: "banan",
    category: "jedzenie",
    svg: `<path ${K} d="M6,30 Q48,112 94,30 L84,20 Q50,80 18,20 Z"/><rect ${K} x="84" y="16" width="8" height="12" rx="2" transform="rotate(30 88 22)"/>`,
  },
  // Przyroda
  {
    id: "drzewo",
    name: "drzewo",
    category: "przyroda",
    svg: `<circle ${K} cx="50" cy="34" r="27"/><circle ${K} cx="30" cy="50" r="19"/><circle ${K} cx="70" cy="50" r="19"/><rect ${K} x="42" y="56" width="16" height="40"/>`,
  },
  {
    id: "choinka",
    name: "choinka",
    category: "przyroda",
    svg: `<polygon ${K} points="50,4 26,38 74,38"/><polygon ${K} points="50,22 16,62 84,62"/><polygon ${K} points="50,42 8,86 92,86"/><rect ${K} x="42" y="84" width="16" height="13"/>`,
  },
  {
    id: "kwiat",
    name: "kwiat",
    category: "przyroda",
    svg: `<rect ${K} x="47" y="50" width="6" height="46"/><ellipse ${K} cx="66" cy="76" rx="14" ry="6" transform="rotate(-30 66 76)"/><circle ${K} cx="50" cy="16" r="13"/><circle ${K} cx="68" cy="30" r="13"/><circle ${K} cx="61" cy="51" r="13"/><circle ${K} cx="39" cy="51" r="13"/><circle ${K} cx="32" cy="30" r="13"/><circle ${W} cx="50" cy="34" r="9"/>`,
  },
  {
    id: "grzyb",
    name: "grzyb",
    category: "przyroda",
    svg: `<path ${K} d="M8,54 A42,40 0 0 1 92,54 Z"/><rect ${K} x="36" y="52" width="28" height="42" rx="6"/><circle ${W} cx="32" cy="38" r="6"/><circle ${W} cx="56" cy="26" r="6"/><circle ${W} cx="72" cy="44" r="5"/>`,
  },
  {
    id: "lisc",
    name: "liść",
    category: "przyroda",
    svg: `<path ${K} d="M50,4 C92,28 88,76 50,90 C12,76 8,28 50,4 Z"/><rect ${K} x="47" y="86" width="6" height="12"/><path d="M50,14 L50,86 M50,40 L66,30 M50,40 L34,30 M50,60 L68,50 M50,60 L32,50" stroke="#fff" stroke-width="3" fill="none"/>`,
  },
  // Kosmos i maszyny
  {
    id: "rakieta",
    name: "rakieta",
    category: "kosmos",
    svg: `<path ${K} d="M50,2 C72,24 70,60 65,80 L35,80 C30,60 28,24 50,2 Z"/><polygon ${K} points="36,54 16,88 36,80"/><polygon ${K} points="64,54 84,88 64,80"/><polygon ${K} points="40,80 60,80 50,98"/><circle ${W} cx="50" cy="38" r="9"/>`,
  },
  {
    id: "auto",
    name: "auto",
    category: "kosmos",
    svg: `<rect ${K} x="4" y="46" width="92" height="26" rx="7"/><polygon ${K} points="22,48 34,22 66,22 80,48"/><polygon ${W} points="29,45 38,27 48,27 48,45"/><polygon ${W} points="52,45 52,27 62,27 73,45"/><circle ${K} cx="27" cy="74" r="13"/><circle ${K} cx="73" cy="74" r="13"/><circle ${W} cx="27" cy="74" r="5"/><circle ${W} cx="73" cy="74" r="5"/>`,
  },
  {
    id: "samolot",
    name: "samolot",
    category: "kosmos",
    svg: `<ellipse ${K} cx="50" cy="50" rx="46" ry="9"/><polygon ${K} points="38,50 60,50 44,8 34,8"/><polygon ${K} points="38,50 60,50 44,92 34,92"/><polygon ${K} points="82,48 98,26 98,50"/>`,
  },
  {
    id: "lodka",
    name: "łódka",
    category: "kosmos",
    svg: `<polygon ${K} points="6,64 94,64 78,88 22,88"/><rect ${K} x="47" y="6" width="6" height="58"/><polygon ${K} points="56,10 56,58 88,58"/><polygon ${K} points="44,22 44,58 18,58"/>`,
  },
  {
    id: "ufo",
    name: "UFO",
    category: "kosmos",
    svg: `<path ${K} d="M26,54 A24,26 0 0 1 74,54 Z"/><ellipse ${K} cx="50" cy="58" rx="46" ry="14"/><path d="M30,70 L22,88 M70,70 L78,88" stroke="#000" stroke-width="5"/><circle ${W} cx="28" cy="58" r="4"/><circle ${W} cx="50" cy="62" r="4"/><circle ${W} cx="72" cy="58" r="4"/>`,
  },
  // Domy i budowle
  {
    id: "domek",
    name: "domek",
    category: "budowle",
    svg: `<polygon ${K} points="50,6 4,46 96,46"/><rect ${K} x="16" y="44" width="68" height="50"/><rect ${W} x="42" y="64" width="16" height="30"/><rect ${W} x="24" y="54" width="12" height="12"/><rect ${W} x="64" y="54" width="12" height="12"/>`,
  },
  {
    id: "wieza",
    name: "wieża zamku",
    category: "budowle",
    svg: `<rect ${K} x="22" y="28" width="56" height="68"/><rect ${K} x="22" y="12" width="13" height="18"/><rect ${K} x="43.5" y="12" width="13" height="18"/><rect ${K} x="65" y="12" width="13" height="18"/><path ${W} d="M40,96 L40,78 A10,10 0 0 1 60,78 L60,96 Z"/><rect ${W} x="45" y="42" width="10" height="16" rx="5"/>`,
  },
  {
    id: "namiot",
    name: "namiot",
    category: "budowle",
    svg: `<polygon ${K} points="50,8 4,92 96,92"/><polygon ${W} points="50,44 36,92 64,92"/><path d="M50,8 L50,0" stroke="#000" stroke-width="4"/><polygon ${K} points="50,0 66,5 50,10"/>`,
  },
  {
    id: "latarnia",
    name: "latarnia morska",
    category: "budowle",
    svg: `<polygon ${K} points="50,2 32,18 68,18"/><rect ${K} x="34" y="18" width="32" height="14"/><polygon ${K} points="36,32 64,32 74,96 26,96"/><rect ${W} x="40" y="21" width="20" height="8"/><polygon ${W} points="34,50 66,50 67.5,60 32.5,60"/><polygon ${W} points="31,74 69,74 70.5,84 29.5,84"/>`,
  },
  {
    id: "wiezowiec",
    name: "wieżowiec",
    category: "budowle",
    svg: `<rect ${K} x="28" y="4" width="44" height="92"/>${[0, 1, 2, 3, 4, 5]
      .flatMap((r) => [0, 1, 2].map((c) => `<rect ${W} x="${34 + c * 12}" y="${10 + r * 13}" width="8" height="8"/>`))
      .join("")}<rect ${W} x="44" y="84" width="12" height="12"/>`,
  },
];

export const ICON_CATEGORY_NAMES: Record<IconCategory, string> = {
  zwierzeta: "Zwierzęta",
  jedzenie: "Jedzenie",
  przyroda: "Przyroda",
  kosmos: "Kosmos i maszyny",
  budowle: "Domy i budowle",
};

/** Ikona wyśrodkowana w (cx, cy) w kwadracie o boku `size` mm. */
export function iconAt(icon: Icon, cx: number, cy: number, size: number): string {
  const s = size / 100;
  return `<g transform="translate(${(cx - size / 2).toFixed(2)} ${(cy - size / 2).toFixed(2)}) scale(${s.toFixed(4)})">${icon.svg}</g>`;
}
