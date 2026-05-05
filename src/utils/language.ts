export enum Language {
  THAI = 'th',
  ENG = 'en',
}

export function isThai(language: Language) {
  return language === Language.THAI;
}
