import type { ShadowFamily, ShadowPicture } from "./picture-format.ts";
import { OWOCE, PTAKI, UBRANIA, WARZYWA, ZABAWKI, ZWIERZETA } from "./pictures/rozne.ts";
import { AUTA, DOMKI, DRZEWA, KLUCZE, KUBKI, KWIATY, RYBY } from "./pictures/warianty.ts";

/**
 * The catalog of the shadows card: seven families of variants of one thing (the hard level takes six of one) and six
 * families of different things of a similar shape (the medium level takes five of one); the easy level takes four
 * pictures from four different families of either kind.
 */
export const SHADOW_FAMILIES: readonly ShadowFamily[] = [
  { id: "kubki", label: "naczynia", kind: "warianty", pictures: KUBKI },
  { id: "domki", label: "domy", kind: "warianty", pictures: DOMKI },
  { id: "ryby", label: "ryby", kind: "warianty", pictures: RYBY },
  { id: "auta", label: "pojazdy", kind: "warianty", pictures: AUTA },
  { id: "drzewa", label: "drzewa", kind: "warianty", pictures: DRZEWA },
  { id: "klucze", label: "klucze", kind: "warianty", pictures: KLUCZE },
  { id: "kwiaty", label: "kwiaty", kind: "warianty", pictures: KWIATY },
  { id: "owoce", label: "owoce", kind: "rozne", pictures: OWOCE },
  { id: "warzywa", label: "warzywa", kind: "rozne", pictures: WARZYWA },
  { id: "zwierzeta", label: "zwierzęta", kind: "rozne", pictures: ZWIERZETA },
  { id: "ptaki", label: "ptaki", kind: "rozne", pictures: PTAKI },
  { id: "ubrania", label: "ubrania", kind: "rozne", pictures: UBRANIA },
  { id: "zabawki", label: "zabawki", kind: "rozne", pictures: ZABAWKI },
];

/** Every picture of the catalog, in family order. */
export const SHADOW_PICTURES: readonly ShadowPicture[] = SHADOW_FAMILIES.flatMap((family) => family.pictures);

/** The picture with this id, or undefined. */
export function shadowPictureById(id: string): ShadowPicture | undefined {
  return SHADOW_PICTURES.find((picture) => picture.id === id);
}

/** The family of the picture with this id, or undefined. */
export function familyOfPicture(id: string): ShadowFamily | undefined {
  return SHADOW_FAMILIES.find((family) => family.pictures.some((picture) => picture.id === id));
}
