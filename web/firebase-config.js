/**
 * FIREBASE-CONFIG.JS - Configuración de Firebase y autenticación
 * Maneja la autenticación anónima para la aplicación PEDORROS
 */

// Obtener Firebase desde la variable global
const { initializeApp, getAuth, signInAnonymously, onAuthStateChanged } = window.Firebase;

// Configuración de Firebase para el proyecto "the-anomaly-897ce"
const firebaseConfig = {
    apiKey: "AIzaSyBS9NW_JTE5SyajdqsGF8qeCH7ROSAWFYo",
    authDomain: "the-anomaly-897ce.firebaseapp.com",
    databaseURL: "https://the-anomaly-897ce.firebaseio.com",
    projectId: "the-anomaly-897ce",
    storageBucket: "the-anomaly-897ce.firebasestorage.app",
    messagingSenderId: "136548028625",
    appId: "1:136548028625:web:437d1081024d3907edf5f0",
    measurementId: "G-8SJHHK4Y6G"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Función para hacer login anónimo
export const signInAnonymouslyUser = async () => {
    try {
        const userCredential = await signInAnonymously(auth);
        return {
            success: true,
            user: userCredential.user
        };
    } catch (error) {
        console.error('Error en login anónimo:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Función para obtener el usuario actual
export const getCurrentUser = () => {
    return auth.currentUser;
};

// Función para verificar si hay un usuario autenticado
export const isUserAuthenticated = () => {
    return !!auth.currentUser;
};

// Función para hacer logout
export const signOutUser = async () => {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        console.error('Error en logout:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Función para suscribirse a cambios de autenticación
export const onAuthStateChangedListener = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// Exportar instancia de auth para uso directo si es necesario
export { auth };
