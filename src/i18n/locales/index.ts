import type { Language } from "../config";
import { en, type Translation } from "./en";
import { fr } from "./fr";
import { es } from "./es";

export const translations: Record<Language, Translation> = { en, fr, es };

export type { GameId, Translation } from "./en";
