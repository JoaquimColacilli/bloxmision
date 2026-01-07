/**
 * WORDLE KIDS WORD LIST - SERVER ONLY
 * 
 * ⚠️ DO NOT IMPORT THIS FILE FROM CLIENT COMPONENTS
 * This file should only be imported from API Route Handlers
 * 
 * Palabras de 5 letras para niños (8-12 años)
 * Temática EXCLUSIVA: Lo que ven en las lecciones (Piratas, Bloques, Acciones)
 * Sin tildes, A-Z uppercase
 */

// Words that can be the daily answer
// STRICTLY LIMITED to concepts they know
export const ANSWER_WORDS: string[] = [
    // Mundo del juego
    "BARCO",
    "ISLAS",
    "MAPAS",
    "COFRE",
    "PLAYA",
    "LOROS",
    "ARENA",
    "AGUAS",
    "JORAM", // Jorc's friend/entity? Or just JORC? (4 letters). Let's stick to 5.
    "PIRAT", // Pirate? No, PIRATA is 6. 
    "NAVES",
    "TIMON",

    // Bloques / Código (Conceptos Visuales)
    "PASOS", // Avanzar pasos
    "GIRAR",
    "BUCLE", // Loop block
    "REPET", // Repetir? No, 6.
    "SALTA",
    "MIRAR",
    "DECIR",
    "CREAR",
    "USAR",
    "ABRIR",
    "MOVER",
    "PARA", // Stop / For loop
    "LADOS",
    "LINEA",

    // Interface / General
    "BOTON",
    "AYUDA",
    "JUGAR",
    "GANAR",
    "NIVEL",
    "MUNDO",
    "TEXTO",
    "COLOR",
    "ERROR", // Common enough
    "CLAVE", // Password
    "LISTA",
    "DATOS"
]

// Extended list of valid guesses (includes answer words + common simple words)
export const VALID_GUESSES: Set<string> = new Set([
    ...ANSWER_WORDS,
    // Very common words kids might try
    "PERRO", "GATOS", "CASAS", "ARBOL", "LIBRO", "LAPIZ", "PAPEL",
    "MAMES", "BEBES", "NIÑOS", "NIÑAS", "PADRE", "MADRE", "FELIZ",
    "COMER", "TOMAR", "VIVIR", "AMAR", "HACER", "DECIR", "TENER",
    "BUENO", "MALO", "NUEVO", "VIEJO", "GRAN", "CHICO",
    "VERDE", "AZUL", "ROJO", "NEGRO", "BLANCO",
    "CIELO", "NUBES", "FUEGO", "AGUA", "TIERRA",
    "MANOS", "OJOS", "BOCAS", "PIES",
    "AUTO", "BICI", "TREN", "AVION",
    "SALTO", "CORRO", "VUELO", "NADO",
    // Common tech misc
    "CLICK", "MOUSE", "TECLA", "WIFI", "ENTER"
])

// Clean and validate answer words
export const VALIDATED_WORDS = ANSWER_WORDS
    .map(w => w.toUpperCase().trim())
    .filter(w => w.length === 5 && /^[A-Z]+$/.test(w))

// Argentina timezone offset (UTC-3) in milliseconds
const ARGENTINA_OFFSET_MS = -3 * 60 * 60 * 1000 // -3 hours

// Get day number based on Argentina timezone
export function getDayNumber(): number {
    const now = Date.now()
    const argentinaTime = now + ARGENTINA_OFFSET_MS
    return Math.floor(argentinaTime / 86400000)
}

// Get today's word based on day number
export function getTodayWord(): string {
    const dayNumber = getDayNumber()
    return VALIDATED_WORDS[dayNumber % VALIDATED_WORDS.length]
}

// Get next reset timestamp (midnight Argentina time = 03:00 UTC)
export function getNextResetUtc(): number {
    const now = Date.now()
    const msPerDay = 86400000

    // Calculate current day start in Argentina time
    const argentinaTime = now + ARGENTINA_OFFSET_MS
    const argentinaDayStart = Math.floor(argentinaTime / msPerDay) * msPerDay

    // Next Argentina midnight = current Argentina day start + 1 day - offset
    // In UTC: Argentina midnight (00:00 ART) = 03:00 UTC
    const nextArgentinaMidnight = argentinaDayStart + msPerDay - ARGENTINA_OFFSET_MS

    return nextArgentinaMidnight
}

// Check if a word is valid for guessing
export function isValidWord(word: string): boolean {
    return VALID_GUESSES.has(word.toUpperCase())
}

// Get hint for current attempt (Kid Friendly & Immediate)
export function getHint(word: string, attemptNumber: number): string | null {
    const upperWord = word.toUpperCase()

    // Hint 1 (Start 0-1 attempts): General Category
    if (attemptNumber <= 1) {
        if (["BARCO", "ISLAS", "MAPAS", "COFRE", "PLAYA", "LOROS", "ARENA", "AGUAS", "NAVES", "TIMON"].includes(upperWord)) {
            return "💡 Pista: Es algo del mundo pirata 🏴‍☠️"
        }
        if (["PASOS", "GIRAR", "BUCLE", "SALTA", "MIRAR", "DECIR", "CREAR", "USAR", "ABRIR", "MOVER", "PARA", "LADOS", "LINEA"].includes(upperWord)) {
            return "💡 Pista: Es una acción o bloque que usás para programar 🧱"
        }
        if (["BOTON", "AYUDA", "JUGAR", "GANAR", "NIVEL", "MUNDO", "TEXTO", "COLOR", "ERROR", "CLAVE", "LISTA", "DATOS"].includes(upperWord)) {
            return "💡 Pista: Es algo de la compu o del juego 💻"
        }
        return "💡 Pista: Es una palabra de 5 letras divertida"
    }

    // Hint 2: First Letter
    if (attemptNumber === 2) {
        return `💡 Empieza con la letra "${upperWord[0]}"`
    }

    // Hint 3: Last Letter
    if (attemptNumber === 3) {
        return `💡 Termina con la letra "${upperWord[upperWord.length - 1]}"`
    }

    // Hint 4: Contains vowel
    if (attemptNumber === 4) {
        const vowels = upperWord.split('').filter(c => 'AEIOU'.includes(c))
        const randomVowel = vowels[0] || 'A'
        return `💡 Tiene la letra "${randomVowel}"`
    }

    // Hint 5: First two
    if (attemptNumber >= 5) {
        return `💡 Empieza con "${upperWord.slice(0, 2)}..."`
    }

    return null
}
