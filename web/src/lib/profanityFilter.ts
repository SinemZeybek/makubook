const BANNED_WORDS = [
  // English
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "cunt",
  "dick",
  "piss",
  "whore",
  "slut",
  // Finnish
  "vittu",
  "perkele",
  "saatana",
  "helvetti",
  "paska",
  "kyrpä",
  "mulkku",
  "huora",
  "läski",
  "ämmä",
];

const BANNED_WORDS_REGEX = new RegExp(
  `\\b(${BANNED_WORDS.join("|")})\\b`,
  "iu"
);

export function containsProfanity(text: string): boolean {
  return BANNED_WORDS_REGEX.test(text);
}
