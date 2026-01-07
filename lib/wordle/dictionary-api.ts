/**
 * Spanish Dictionary API Service
 *
 * Validates Spanish words for gameplay (Wordle-like).
 *
 * IMPORTANT:
 * - dictionaryapi.dev is unreliable/incomplete for Spanish (often returns "No Definitions Found"
 *   even for common words). So we DO NOT use it as the sole authority.
 * - We use Datamuse (v=es Spanish vocabulary) as the primary online validator.
 * - We keep dictionaryapi.dev as an additional fallback (only to confirm validity, not to deny).
 *
 * Notes:
 * - If all online APIs fail (network/CORS/timeout), we stay lenient and allow the word
 *   to avoid blocking gameplay (same behavior you had).
 */

const DATAMUSE_API_BASE = 'https://api.datamuse.com/words'
const DICTIONARYAPI_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/es'

// Cache for validated words (avoid repeated API calls)
const validatedWordsCache = new Map<string, boolean>()

/**
 * Normalize Spanish words for lookup:
 * - trims
 * - lowercases
 * - removes accents/diacritics (áéíóúü -> aeiouu)
 * - preserves ñ (does NOT turn it into n)
 */
function normalizeSpanishForLookup(input: string): string {
    const trimmed = input.trim().toLowerCase()

    // Preserve ñ while stripping diacritics
    const eniePlaceholder = '__enie__'
    const protectedEnie = trimmed.replace(/ñ/g, eniePlaceholder)

    // Strip combining marks (accents)
    const withoutDiacritics = protectedEnie
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

    return withoutDiacritics.replace(new RegExp(eniePlaceholder, 'g'), 'ñ')
}

/**
 * Small helper to create a timeout AbortSignal across runtimes.
 * AbortSignal.timeout exists in modern runtimes, but not all.
 */
function timeoutSignal(ms: number): AbortSignal {
    // @ts-expect-error - TS lib may not include AbortSignal.timeout depending on target
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
        // @ts-expect-error
        return AbortSignal.timeout(ms)
    }

    const controller = new AbortController()
    setTimeout(() => controller.abort(), ms)
    return controller.signal
}

/**
 * Primary online check (Datamuse).
 * Returns true if the word is found in Spanish vocabulary (v=es).
 */
async function isSpanishWordDatamuse(normalizedWord: string): Promise<boolean> {
    const url =
        `${DATAMUSE_API_BASE}?sp=${encodeURIComponent(normalizedWord)}` +
        `&max=1&v=es`

    const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: timeoutSignal(2000),
    })

    if (!response.ok) return false

    const data = (await response.json()) as Array<{ word?: string }>
    const found = Array.isArray(data) && data.length > 0 && typeof data[0]?.word === 'string'
        ? data[0].word!.toLowerCase() === normalizedWord
        : false

    return found
}

/**
 * Secondary online check (dictionaryapi.dev).
 * ONLY used to CONFIRM validity (200 => valid).
 * If it returns 404 ("No Definitions Found"), we treat it as "unknown/false" but we don't
 * assume the word is invalid in Spanish globally.
 */
async function isSpanishWordDictionaryApi(normalizedWord: string): Promise<boolean> {
    const response = await fetch(`${DICTIONARYAPI_BASE}/${encodeURIComponent(normalizedWord)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: timeoutSignal(2000),
    })

    return response.ok
}

/**
 * Check if a word exists in Spanish via online sources.
 *
 * @param word - The word to validate (usually 5 letters)
 * @returns true if word is valid, false otherwise
 */
export async function isSpanishWord(word: string): Promise<boolean> {
    const normalizedWord = normalizeSpanishForLookup(word)

    // Check cache first
    if (validatedWordsCache.has(normalizedWord)) {
        return validatedWordsCache.get(normalizedWord)!
    }

    try {
        // 1) Primary: Datamuse (Spanish vocabulary v=es)
        let isValid = false
        try {
            isValid = await isSpanishWordDatamuse(normalizedWord)
        } catch (e) {
            // If Datamuse fails (network/CORS/timeout), we continue to next source
            console.warn('[Datamuse] Error checking word:', word, e)
        }

        // 2) Secondary: dictionaryapi.dev (confirm-only)
        if (!isValid) {
            try {
                const dictionaryApiValid = await isSpanishWordDictionaryApi(normalizedWord)
                if (dictionaryApiValid) isValid = true
            } catch (e) {
                console.warn('[DictionaryAPI.dev] Error checking word:', word, e)
            }
        }

        // Cache the result (even false to avoid hammering)
        validatedWordsCache.set(normalizedWord, isValid)
        return isValid
    } catch (error) {
        // Any unexpected error - be lenient and allow the word
        console.warn('[Word validation] Unexpected error checking word:', word, error)
        return true
    }
}

/**
 * Validate a guess word.
 * First checks local list, then falls back to online validation.
 *
 * @param word - The word to validate
 * @param localValidWords - Local set of known valid words (recommended: canonical allowed guesses)
 * @returns { isValid, source }
 */
export async function validateGuessWord(
    word: string,
    localValidWords: Set<string>
): Promise<{ isValid: boolean; source: 'local' | 'api' | 'fallback' }> {
    // Normalize similarly to lookup, but keep it in "Wordle format" for local sets
    const normalizedUpper = normalizeSpanishForLookup(word).toUpperCase()

    // First check local list (fast)
    if (localValidWords.has(normalizedUpper)) {
        return { isValid: true, source: 'local' }
    }

    // Then check online (slower)
    try {
        const isValidInApi = await isSpanishWord(normalizedUpper)
        if (isValidInApi) {
            return { isValid: true, source: 'api' }
        }
    } catch {
        // Online failed, fall back to allowing it (lenient behavior to avoid blocking gameplay)
        return { isValid: true, source: 'fallback' }
    }

    return { isValid: false, source: 'local' }
}