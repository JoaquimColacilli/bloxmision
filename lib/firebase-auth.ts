import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile,
    type User as FirebaseUser,
    type Unsubscribe,
} from "firebase/auth"
import { auth } from "./firebase"

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
    email: string,
    password: string
): Promise<FirebaseUser> {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
}

/**
 * Sign up with email, password, and display name
 */
export async function signUpWithEmail(
    email: string,
    password: string,
    displayName: string
): Promise<FirebaseUser> {
    const credential = await createUserWithEmailAndPassword(auth, email, password)

    // Update the user's profile with display name
    await updateProfile(credential.user, { displayName })

    return credential.user
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
    const provider = new GoogleAuthProvider()
    provider.addScope("email")
    provider.addScope("profile")

    const credential = await signInWithPopup(auth, provider)
    return credential.user
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<void> {
    await signOut(auth)
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
    callback: (user: FirebaseUser | null) => void
): Unsubscribe {
    return onAuthStateChanged(auth, callback)
}

/**
 * Get the current user (may be null if not authenticated)
 */
export function getCurrentUser(): FirebaseUser | null {
    return auth.currentUser
}
