const DEEPL_TARGET_LANG: Record<string, string> = {
  en: "EN-US",
  fi: "FI",
};

/**
 * Translates a batch of strings in one DeepL request (preserves order).
 * `ok: false` means the original strings are returned unchanged -- either
 * DEEPL_API_KEY isn't configured or the request failed -- so callers can
 * tell a real translation apart from a same-language fallback.
 */
export async function translateTexts(
  texts: string[],
  targetLocale: string
): Promise<{ texts: string[]; ok: boolean }> {
  const apiKey = process.env.DEEPL_API_KEY;
  const targetLang = DEEPL_TARGET_LANG[targetLocale];
  if (!apiKey || !targetLang || texts.length === 0) {
    return { texts, ok: false };
  }

  const endpoint = apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: texts, target_lang: targetLang }),
    });

    if (!res.ok) return { texts, ok: false };

    const data = await res.json();
    const translations = data.translations as { text: string }[] | undefined;
    if (!translations || translations.length !== texts.length) {
      return { texts, ok: false };
    }

    return { texts: translations.map((t) => t.text), ok: true };
  } catch {
    return { texts, ok: false };
  }
}
