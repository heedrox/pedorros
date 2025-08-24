#!/usr/bin/env node

/**
 * Script rápido para preparar un juego de prueba con 5 jugadores
 * Uso: node scripts/quick-test.cjs
 * 
 * Este script prepara automáticamente un juego con código "galerna" y 5 jugadores
 * donde el jugador 1 es el pedorro
 */

const { readFileSync } = require('fs');
const { dirname, join } = require('path');

// Obtener la ruta del directorio actual (__dirname ya está disponible en CommonJS)
const scriptDir = __dirname;

// Configuración fija para pruebas rápidas
const GAME_CODE = 'galerna';
const TOTAL_PLAYERS = 5;

// Función para leer la configuración de Firebase del archivo existente
const getFirebaseConfig = () => {
    try {
        const configPath = join(scriptDir, '../web/firebase-config.js');
        const configContent = readFileSync(configPath, 'utf8');
        
        // Extraer la configuración usando regex
        const apiKeyMatch = configContent.match(/apiKey:\s*["']([^"']+)["']/);
        const authDomainMatch = configContent.match(/authDomain:\s*["']([^"']+)["']/);
        const databaseURLMatch = configContent.match(/databaseURL:\s*["']([^"']+)["']/);
        const projectIdMatch = configContent.match(/projectId:\s*["']([^"']+)["']/);
        const storageBucketMatch = configContent.match(/storageBucket:\s*["']([^"']+)["']/);
        const messagingSenderIdMatch = configContent.match(/messagingSenderId:\s*["']([^"']+)["']/);
        const appIdMatch = configContent.match(/appId:\s*["']([^"']+)["']/);
        
        if (!apiKeyMatch || !authDomainMatch || !databaseURLMatch || !projectIdMatch) {
            throw new Error('No se pudo extraer la configuración completa de Firebase');
        }
        
        return {
            apiKey: apiKeyMatch[1],
            authDomain: authDomainMatch[1],
            databaseURL: databaseURLMatch[1],
            projectId: projectIdMatch[1],
            storageBucket: storageBucketMatch ? storageBucketMatch[1] : `${projectIdMatch[1]}.appspot.com`,
            messagingSenderId: messagingSenderIdMatch ? messagingSenderIdMatch[1] : '123456789',
            appId: appIdMatch ? appIdMatch[1] : '1:123456789:web:abcdef'
        };
    } catch (error) {
        console.error('❌ Error al leer la configuración de Firebase:', error.message);
        console.error('💡 Asegúrate de que el archivo web/firebase-config.js existe y es válido');
        process.exit(1);
    }
};

// Función principal del script
const main = async () => {
    try {
        console.log('🎮 Preparando juego de prueba rápido...');
        console.log(`📋 Código: ${GAME_CODE}, Jugadores: ${TOTAL_PLAYERS}`);
        
        // Obtener configuración de Firebase
        console.log('📖 Leyendo configuración de Firebase...');
        const firebaseConfig = getFirebaseConfig();
        console.log('✅ Configuración leída correctamente');
        
        // Importar Firebase dinámicamente
        console.log('🔥 Inicializando Firebase...');
        const { initializeApp } = await import('firebase/app');
        const { getDatabase, ref, set } = await import('firebase/database');
        const { getAuth, signInAnonymously } = await import('firebase/auth');
        
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        
        // Autenticación anónima
        console.log('🔐 Autenticando usuario anónimo...');
        await signInAnonymously(auth);
        console.log('✅ Usuario autenticado exitosamente');
        
        // Configuración fija para 5 jugadores
        const roles = {
            peditos: [2, 3],      // Jugadores 2 y 3 son peditos
            pedorro: 1,            // Jugador 1 es el pedorro
            neutrales: [4, 5]      // Jugadores 4 y 5 son neutrales
        };
        
        console.log('📋 Configurando roles...');
        console.log(`   - Pedorro: Jugador ${roles.pedorro}`);
        console.log(`   - Peditos: Jugadores ${roles.peditos.join(', ')}`);
        console.log(`   - Neutrales: Jugadores ${roles.neutrales.join(', ')}`);
        
        // Sonidos fijos para pruebas
        const nextSounds = {
            1: 1,    // Jugador 1 (pedorro) → pedorro-1.mp3
            2: 3,    // Jugador 2 (pedito) → pedito-3.mp3
            3: 3,    // Jugador 3 (pedito) → pedito-3.mp3
            4: null, // Jugador 4 (neutral) → neutral.mp3
            5: null  // Jugador 5 (neutral) → neutral.mp3
        };
        
        console.log('🎵 Configurando sonidos...');
        console.log('   - Pedorro: pedorro-1.mp3');
        console.log('   - Peditos: pedito-3.mp3');
        console.log('   - Neutrales: neutral.mp3');
        
        // Crear estado del juego
        const gameState = {
            ranking: {},
            lastResult: null,
            numRound: 1,
            state: "START",
            nextSounds: nextSounds,
            peditos: roles.peditos,
            pedorro: roles.pedorro
        };
        
        console.log('🔥 Guardando en Firebase...');
        
        // Obtener referencia a la base de datos
        const database = getDatabase();
        const gameRef = ref(database, `pedorros-game/${GAME_CODE}`);
        
        // Guardar estado del juego
        await set(gameRef, gameState);
        
        console.log('✅ ¡Juego de prueba preparado exitosamente!');
        console.log('');
        console.log('🔗 URLs para probar:');
        console.log(`   - Jugador 1 (Pedorro): http://localhost:3000/index.html?/g/${GAME_CODE}/p/1/${TOTAL_PLAYERS}`);
        console.log(`   - Jugador 2 (Pedito): http://localhost:3000/index.html?/g/${GAME_CODE}/p/2/${TOTAL_PLAYERS}`);
        console.log(`   - Jugador 3 (Pedito): http://localhost:3000/index.html?/g/${GAME_CODE}/p/3/${TOTAL_PLAYERS}`);
        console.log(`   - Jugador 4 (Neutral): http://localhost:3000/index.html?/g/${GAME_CODE}/p/4/${TOTAL_PLAYERS}`);
        console.log(`   - Jugador 5 (Neutral): http://localhost:3000/index.html?/g/${GAME_CODE}/p/5/${TOTAL_PLAYERS}`);
        console.log('');
        console.log('🎯 Para probar:');
        console.log('   1. Abre las URLs en pestañas separadas');
        console.log('   2. Pulsa DISIMULAR en cada una');
        console.log('   3. Verifica que cada jugador escuche el sonido correcto');
        
    } catch (error) {
        console.error('❌ Error al preparar el juego:', error.message);
        process.exit(1);
    }
};

// Ejecutar script
main();
