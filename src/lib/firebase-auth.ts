import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    updateProfile,
    onAuthStateChanged,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * Registrar usuario con email/password
 */
export async function registerWithEmail(
    email: string,
    password: string,
    displayName: string
) {
    try {
        // 1. Crear en Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // 2. Actualizar displayName
        await updateProfile(userCredential.user, { displayName });

        // 3. Crear documento en Firestore MANUALMENTE
        await createUserDocument(userCredential.user, displayName);

        return { success: true, user: userCredential.user };
    } catch (error: any) {
        console.error('Error registering:', error);
        return {
            success: false,
            error: getAuthErrorMessage(error.code)
        };
    }
}

/**
 * Login con email/password
 */
export async function loginWithEmail(email: string, password: string) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error: any) {
        console.error('Error logging in:', error);
        return {
            success: false,
            error: getAuthErrorMessage(error.code)
        };
    }
}

/**
 * Login con Google
 */
export async function loginWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);

        // Verificar si ya existe el doc de usuario
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

        // Si no existe, crear
        if (!userDoc.exists()) {
            await createUserDocument(
                userCredential.user,
                userCredential.user.displayName || 'Grumete'
            );
        }

        return { success: true, user: userCredential.user };
    } catch (error: any) {
        console.error('Error with Google login:', error);
        return {
            success: false,
            error: 'Error al iniciar sesión con Google'
        };
    }
}

/**
 * Logout
 */
export async function logout() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error: any) {
        console.error('Error logging out:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Observer de auth state
 */
export function observeAuthState(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
}

/**
 * HELPER: Crear documento de usuario en Firestore
 */
async function createUserDocument(firebaseUser: FirebaseUser, displayName: string) {
    const userDocRef = doc(db, 'users', firebaseUser.uid);

    // Verificar si ya existe (idempotencia)
    const existingDoc = await getDoc(userDocRef);
    if (existingDoc.exists()) {
        console.log('User doc already exists, skipping creation');
        return;
    }

    // Crear documento inicial
    await setDoc(userDocRef, {
        uid: firebaseUser.uid,
        displayName: displayName || 'Grumete',
        email: firebaseUser.email || '',
        createdAt: serverTimestamp(),
        currentWorld: 1,
        currentLevel: 1,
        totalXP: 0,
        playerLevel: 'Grumete',
        streak: {
            current: 0,
            longest: 0,
            lastPlayedDate: '',
            frozenDays: 1
        },
        badges: [],
        settings: {
            soundEnabled: true,
            musicEnabled: true,
            hintsEnabled: true
        }
    });

    console.log('User document created successfully');
}

/**
 * Mapear errores de Auth a mensajes amigables
 */
function getAuthErrorMessage(code: string): string {
    const messages: Record<string, string> = {
        'auth/email-already-in-use': 'Este email ya está registrado',
        'auth/invalid-email': 'Email inválido',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/too-many-requests': 'Demasiados intentos, intenta más tarde'
    };

    return messages[code] || 'Error de autenticación';
}
