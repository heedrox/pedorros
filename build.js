#!/usr/bin/env node

/**
 * BUILD.JS - Script de build para cache-busting
 * Genera versiones únicas para evitar caché en archivos estáticos
 */

const fs = require('fs');
const path = require('path');

// Configuración
const SOURCE_DIR = './web';
const BUILD_DIR = './web-built';
const FILES_TO_PROCESS = [
    'index.html',
    'choose.html',
    'script.js',
    'firebase-database.js'
];

// Generar versión única basada en timestamp
function generateVersion() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
}

// Crear directorio de build si no existe
function ensureBuildDir() {
    if (!fs.existsSync(BUILD_DIR)) {
        fs.mkdirSync(BUILD_DIR, { recursive: true });
    }
}

// Copiar archivos estáticos (CSS, audio, etc.)
function copyStaticFiles() {
    const staticFiles = [
        'styles.css',
        'audio.js',
        'firebase-config.js',
        'lib.js',
        'assets',
        'sounds'
    ];

    staticFiles.forEach(file => {
        const sourcePath = path.join(SOURCE_DIR, file);
        const destPath = path.join(BUILD_DIR, file);
        
        if (fs.existsSync(sourcePath)) {
            if (fs.statSync(sourcePath).isDirectory()) {
                // Copiar directorio completo
                copyDirectory(sourcePath, destPath);
            } else {
                // Copiar archivo
                fs.copyFileSync(sourcePath, destPath);
            }
            console.log(`✅ Copiado: ${file}`);
        }
    });
}

// Copiar directorio completo
function copyDirectory(source, destination) {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }
    
    const files = fs.readdirSync(source);
    files.forEach(file => {
        const sourcePath = path.join(source, file);
        const destPath = path.join(destination, file);
        
        if (fs.statSync(sourcePath).isDirectory()) {
            copyDirectory(sourcePath, destPath);
        } else {
            fs.copyFileSync(sourcePath, destPath);
        }
    });
}

// Procesar HTML para añadir parámetros de versión
function processHTML(filePath, version) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Añadir versión a CSS
    content = content.replace(
        /href="styles\.css"/g,
        `href="styles.css?v=${version}"`
    );
    
    // Añadir versión a script principal
    content = content.replace(
        /src="script\.js"/g,
        `src="script.js?v=${version}"`
    );
    
    return content;
}

// Procesar JavaScript para añadir parámetros de versión
function processJavaScript(filePath, version) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Añadir versión a todas las importaciones locales
    content = content.replace(
        /from '\.\/([^']+)'/g,
        `from './$1?v=${version}'`
    );
    
    // Añadir versión a importaciones relativas específicas
    content = content.replace(
        /from '\.\/(firebase-config|firebase-database|audio|lib)\.js'/g,
        `from './$1.js?v=${version}'`
    );
    
    return content;
}

// Función principal de build
function build() {
    console.log('🚀 Iniciando build con cache-busting...');
    
    const version = generateVersion();
    console.log(`📦 Versión generada: ${version}`);
    
    // Crear directorio de build
    ensureBuildDir();
    
    // Copiar archivos estáticos
    copyStaticFiles();
    
    // Procesar archivos principales
    FILES_TO_PROCESS.forEach(file => {
        const sourcePath = path.join(SOURCE_DIR, file);
        const destPath = path.join(BUILD_DIR, file);
        
        if (fs.existsSync(sourcePath)) {
            let processedContent;
            
            if (file.endsWith('.html')) {
                processedContent = processHTML(sourcePath, version);
            } else if (file.endsWith('.js')) {
                processedContent = processJavaScript(sourcePath, version);
            } else {
                // Copiar sin procesar
                fs.copyFileSync(sourcePath, destPath);
                console.log(`✅ Copiado: ${file}`);
                return;
            }
            
            // Guardar archivo procesado
            fs.writeFileSync(destPath, processedContent);
            console.log(`🔧 Procesado: ${file} (versión ${version})`);
        }
    });
    
    console.log('\n🎉 Build completado exitosamente!');
    console.log(`📁 Archivos generados en: ${BUILD_DIR}`);
    console.log(`🔗 Usar: ${BUILD_DIR}/index.html`);
}

// Función de watch para desarrollo
function watch() {
    console.log('👀 Modo watch activado...');
    console.log('📝 Modificando archivos en tiempo real...');
    
    // Ejecutar build inicial
    build();
    
    // Observar cambios en archivos fuente
    FILES_TO_PROCESS.forEach(file => {
        const filePath = path.join(SOURCE_DIR, file);
        fs.watchFile(filePath, { interval: 1000 }, (curr, prev) => {
            if (curr.mtime > prev.mtime) {
                console.log(`\n🔄 Archivo modificado: ${file}`);
                build();
            }
        });
    });
    
    console.log('⏳ Esperando cambios... (Ctrl+C para salir)');
}

// Manejar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--watch') || args.includes('-w')) {
    watch();
} else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📖 Uso: node build.js [opciones]

Opciones:
  --watch, -w    Modo watch para desarrollo
  --help, -h     Mostrar esta ayuda

Ejemplos:
  node build.js           # Build único
  node build.js --watch   # Modo watch
  node build.js -w        # Modo watch (abreviado)
    `);
} else {
    build();
}
