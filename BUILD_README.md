# Sistema de Build con Cache-Busting

Este proyecto incluye un sistema de build automatizado que genera versiones únicas para todos los archivos estáticos, evitando problemas de caché del navegador.

## 🚀 Comandos disponibles

### Build básico
```bash
npm run build
```
Genera una versión optimizada en el directorio `web-built/` con parámetros de versión únicos.

### Build con watch (desarrollo)
```bash
npm run build:watch
```
Ejecuta el build en modo watch, regenerando automáticamente cuando se modifican archivos fuente.

### Build + servidor de desarrollo
```bash
npm run build:dev
```
Ejecuta el build y abre un servidor de desarrollo en el puerto 3001 con los archivos procesados.

## 📁 Estructura de archivos

```
web/                    # Código fuente
├── index.html         # HTML principal
├── script.js          # JavaScript principal
├── styles.css         # Estilos CSS
├── firebase-config.js # Configuración de Firebase
├── firebase-database.js # Base de datos Firebase
├── audio.js           # Sistema de audio
├── lib.js             # Lógica del core
└── sounds/            # Archivos de audio

web-built/             # Archivos procesados (generado)
├── index.html         # HTML con versiones
├── script.js          # JS con versiones
├── styles.css         # CSS copiado
└── ...                # Resto de archivos
```

## 🔧 Cómo funciona

1. **Generación de versión**: Se crea un timestamp único + string aleatorio
2. **Procesamiento de HTML**: Se añaden parámetros `?v={version}` a CSS y JS
3. **Procesamiento de JS**: Se añaden versiones a todas las importaciones ES6
4. **Copia de archivos**: Los archivos estáticos se copian sin modificar

## 📝 Ejemplo de salida

### Antes (web/index.html)
```html
<link rel="stylesheet" href="styles.css">
<script type="module" src="script.js"></script>
```

### Después (web-built/index.html)
```html
<link rel="stylesheet" href="styles.css?v=1703123456789-abc123">
<script type="module" src="script.js?v=1703123456789-abc123"></script>
```

### Antes (web/script.js)
```javascript
import { ... } from './firebase-config.js';
import { ... } from './firebase-database.js';
```

### Después (web-built/script.js)
```javascript
import { ... } from './firebase-config.js?v=1703123456789-abc123';
import { ... } from './firebase-database.js?v=1703123456789-abc123';
```

## 🎯 Casos de uso

### Desarrollo local
```bash
npm run build:dev
```
- Abre `http://localhost:3001` con archivos sin caché
- Ideal para testing de cambios

### Producción
```bash
npm run build
```
- Genera archivos optimizados en `web-built/`
- Subir solo el contenido de `web-built/` al servidor

### Testing continuo
```bash
npm run build:watch
```
- Regenera automáticamente en cada cambio
- Útil para desarrollo activo

## ⚠️ Consideraciones importantes

1. **Siempre usar archivos de `web-built/` en producción**
2. **No editar archivos en `web-built/` directamente**
3. **El directorio `web-built/` está en `.gitignore`**
4. **Cada build genera una versión completamente nueva**

## 🐛 Solución de problemas

### Error: "Cannot find module"
- Verificar que se ejecutó `npm run build`
- Comprobar que existe el directorio `web-built/`

### Archivos no se actualizan
- Limpiar caché del navegador
- Verificar que se está usando `web-built/index.html`

### Problemas de importación
- Verificar que todos los archivos JS tienen la extensión `.js`
- Comprobar que las rutas de importación son relativas (`./`)

## 🔄 Flujo de trabajo recomendado

1. **Desarrollo**: Trabajar en archivos de `web/`
2. **Testing**: Usar `npm run build:dev` para testing local
3. **Build**: Ejecutar `npm run build` antes de deploy
4. **Deploy**: Subir contenido de `web-built/` al servidor
