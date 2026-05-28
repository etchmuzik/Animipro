// ─── Animipro — Supported locales ────────────────────────────────────────────
//
// Four languages, chosen to match the resort-staff reality: Arabic (the local
// language, right-to-left), English (lingua franca), Russian and Italian (the
// two biggest source markets for Red Sea animation crews). Adding a locale = add
// an entry here + a matching message catalog in ./messages.

export type Locale = 'en' | 'ar' | 'ru' | 'it'

export type Direction = 'ltr' | 'rtl'

export interface LocaleMeta {
  code: Locale
  /** English label for menus */
  label: string
  /** Native endonym shown in the switcher */
  nativeName: string
  dir: Direction
  /** Short code chip shown in the compact switcher */
  short: string
}

export const LOCALES: Record<Locale, LocaleMeta> = {
  en: { code: 'en', label: 'English', nativeName: 'English',  dir: 'ltr', short: 'EN' },
  ar: { code: 'ar', label: 'Arabic',  nativeName: 'العربية',  dir: 'rtl', short: 'ع'  },
  ru: { code: 'ru', label: 'Russian', nativeName: 'Русский',  dir: 'ltr', short: 'RU' },
  it: { code: 'it', label: 'Italian', nativeName: 'Italiano', dir: 'ltr', short: 'IT' },
}

export const LOCALE_LIST: LocaleMeta[] = Object.values(LOCALES)

export const DEFAULT_LOCALE: Locale = 'en'

export function isLocale(value: string): value is Locale {
  return value === 'en' || value === 'ar' || value === 'ru' || value === 'it'
}

export function localeDir(locale: Locale): Direction {
  return LOCALES[locale].dir
}
