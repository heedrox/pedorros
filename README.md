# PEDORROS - Juego de Fiesta Multijugador

[![Tests](https://img.shields.io/badge/tests-37%20passed-brightgreen)](https://github.com/yourusername/pedorro)
[![Node.js](https://img.shields.io/badge/node-20.x-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎮 Descripción

PEDORROS es una aplicación web de fiesta multijugador que simula un juego de detective social. Los jugadores deben identificar quién ha sido el "pedorro" (el que se ha echado un pedo) y quiénes han sido los "peditos" (pedos menores) basándose únicamente en los sonidos reproducidos por la aplicación.

## ✨ Funcionalidades Implementadas

### 🎯 Pantalla de Estado START
- **Interfaz visual completa** con temática marrón clara
- **Botón DISIMULAR prominente** y centrado
- **Información de ronda** (Ronda X de 5)
- **Identificación de jugador** (Jugador X / Y)
- **Diseño responsive** optimizado para dispositivos móviles

### 🔄 Sistema de Reinicio del Juego
- **Botón REINICIAR** exclusivo para el jugador 1 (director del juego)
- **Posicionamiento superior derecho** del header
- **Integración con Firebase Realtime Database**
- **Guardado de estado de reinicio** en `/pedorros-game/{CODIGO_JUEGO}`
- **Confirmación del usuario** antes de ejecutar reinicio
- **Feedback visual** de éxito o error de la operación

### 🎭 Cálculo Automático de Roles y Sonidos
- **Listener de Firebase** que detecta cambios en el estado del juego
- **Cálculo automático** de distribución de roles (peditos, pedorro, neutrales)
- **Generación de sonidos** para cada jugador según su rol
- **Restricción de acceso** - solo el jugador 1 puede ejecutar cálculos
- **Distribución según tabla** del PRODUCT_BRIEF (4-16 jugadores)
- **Prevención de loops** - no recalcula si roles ya existen

### 🎵 Funcionalidad DISIMULAR con Contador y Sonidos
- **Contador visual prominente** de 5, 4, 3, 2, 1, 0 en pantalla completa
- **Ocultación del contenido principal** durante la secuencia de DISIMULAR
- **Estado "DISIMULANDO"** después del contador con animaciones dramáticas
- **Web Audio API nativa** con timing preciso de 5 segundos
- **Precarga automática para iOS** al hacer click en DISIMULAR
- **Sistema de sonidos inteligente** basado en Firebase
- **Lógica de sonidos** según rol del jugador (pedito, pedorro, neutral)
- **Reproducción automática** de sonidos después del contador
- **Integración completa** con campos `nextSounds`, `peditos` y `pedorro`
- **Experiencia inmersiva** con contador a pantalla completa
- **Fallback robusto** a HTML5 Audio si Web Audio API falla
- **Compatibilidad total con iOS** sin problemas de autoplay

### 🔍 Botón de Investigar después de Disimular
- **Transición automática** de secuencia DISIMULAR a pantalla de investigar
- **Secuencia especial de sonidos** para jugador 1 antes del botón INVESTIGAR:
  - `intro.mp3` (3 segundos) + sonido del pedorro desde Firebase + 1.5s adicionales
- **Botón clicable "(👃) INVESTIGAR"** exclusivo para jugador 1 (director del juego)
- **Texto no clicable "(👃)"** para otros jugadores
- **Actualización de estado** del juego a "ACUSE" en Firebase Database
- **Interfaz a pantalla completa** con temática marrón consistente
- **Diseño responsive** adaptado para dispositivos móviles
- **Animaciones suaves** con transiciones CSS
- **Integración completa** con sistema de permisos existente

### 🎯 Sistema de Acusaciones Completo
- **Pantalla de acusación** con grid de botones de jugadores (4 columnas responsive)
- **Estados de botones con colores reales**:
  - 🟢 **Verde**: Jugador neutral (estado por defecto)
  - 🟠 **Naranja**: Acusado de ser pedito
  - 🔴 **Rojo**: Acusado de ser pedorro
- **Cambio cíclico de colores** en cada botón (verde → naranja → rojo → verde)
- **Validación automática** que activa el botón ACUSAR cuando las cantidades coinciden
- **Inicialización inteligente** con todos los jugadores en verde por defecto
- **Mensaje especial "¡ERES EL PEDORRO!"** para el jugador correspondiente
- **Integración con Firebase** para cargar estado real del juego (no hardcodeado)
- **Funciones utilitarias** para manejo consistente de clases CSS (activate/deactivate/setVisibility)

### 🔗 Sistema de URLs Inteligente
- **Formato de URL**: `index.html?/g/CODIGO/p/NUMERO_JUGADOR/TOTAL_JUGADORES`
- **Ejemplo**: `index.html?/g/galerna/p/1/5` → Jugador 1 de 5, código "galerna"
- **Detección automática** del número de jugador y total de jugadores
- **Modo desarrollo** con valores por defecto si la URL no es válida

### 🏗️ Arquitectura Funcional e Inmutable
- **Separación de responsabilidades**: Core (`lib.js`) vs DOM (`script.js`)
- **Módulos ES6** con import/export
- **Funciones puras** sin side effects
- **Estado inmutable** usando spread operator
- **Programación funcional** sin variables globales mutables

### 🗄️ Integración Firebase
- **Autenticación anónima** para acceso al juego
- **Realtime Database** para persistencia de estado
- **Sincronización en tiempo real** del estado del juego
- **Reglas de seguridad** configuradas para acceso autenticado
- **Actualización de estado** del juego con `updateGameState()`
- **Carga de estado real** desde Firebase con `getGameState()`
- **Listener inteligente** que detecta cambios de estado automáticamente

### 🧪 Suite de Tests Unitarios
- **105 tests pasando** con cobertura completa
- **Tests de funcionalidad pura** (inmutabilidad, predictibilidad)
- **Tests de edge cases** (URLs inválidas, casos límite)
- **Tests de validación de regex** (caracteres especiales, espacios)
- **Tests de cálculo de roles** (distribución, sonidos, mezcla de arrays)
- **Tests de funcionalidad DISIMULAR** (lógica de sonidos, roles, inmutabilidad)
- **Tests de funcionalidad INVESTIGAR** (botón, permisos, cambio de estado)
- **Tests de funcionalidad de acusaciones** (validación, estados, cantidades)
- **Tests de funciones utilitarias** (manejo de clases CSS)
- **Configuración Jest** con soporte para módulos ES6

## 🚀 Tecnologías Utilizadas

- **Frontend**: JavaScript vanilla con módulos ES6
- **Testing**: Jest + Babel + jsdom
- **Servidor de desarrollo**: live-server
- **Entorno**: Node.js 20 (usar `nvm use 20`)
- **Arquitectura**: Funcional e inmutable
- **🎨 Estilos**: Guía oficial de colores documentada en sección UI
- **🗄️ Base de datos**: Firebase Realtime Database
- **🔐 Autenticación**: Firebase Auth (anónima)

### ⚠️ Importante para Desarrolladores
- **NO modificar la paleta de colores** sin consultar la guía de estilos
- **Mantener coherencia visual** en todos los elementos
- **Respetar la temática marrón** establecida
- **Configurar reglas de Firebase** para acceso autenticado

## 📁 Estructura del Proyecto

```
pedorro/
├── web/                          # Frontend de la aplicación
│   ├── index.html               # Pantalla principal START
│   ├── styles.css               # Estilos con temática marrón
│   ├── lib.js                   # Core de la aplicación (lógica pura)
│   └── script.js                # Lógica de DOM y conexión
├── test/                        # Tests unitarios
│   └── unit/                    # Tests de funciones del core
│       ├── parseGameURL.test.js # Tests para parseGameURL
│       ├── gameRoles.test.js    # Tests para cálculo de roles y sonidos
│       ├── disimular.test.js    # Tests para funcionalidad DISIMULAR
│       ├── investigar.test.js   # Tests para funcionalidad INVESTIGAR
│       ├── introPedorro.test.js # Tests para secuencia intro + pedorro
│       ├── acusaciones.test.js  # Tests para funcionalidad de acusaciones
│       └── utilities.test.js    # Tests para funciones utilitarias CSS
├── docs/                        # Documentación del proyecto
│   ├── PRODUCT_BRIEF.md         # Especificación del producto
│   └── features/                # Planes técnicos de funcionalidades
│       └── 0001_PLAN.md         # Plan de la pantalla START
└── package.json                 # Dependencias y scripts
```

## 🛠️ Instalación y Desarrollo

### Prerrequisitos
- Node.js 20.x (usar `nvm use 20`)
- npm
- Proyecto Firebase configurado

### Configuración de Firebase
1. **Crear proyecto** en [Firebase Console](https://console.firebase.google.com/)
2. **Habilitar Authentication** con login anónimo
3. **Habilitar Realtime Database** (no Firestore)
4. **Configurar reglas** en `database.rules.json`:
```json
{
  "rules": {
    "pedorros-game": {
      "$gameCode": {
        ".read": "auth != null",
        ".write": "auth != null && $gameCode == 'galerna'"
      }
    }
  }
}
```

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd pedorro

# Instalar dependencias
npm install

# Activar Node.js 20
nvm use 20
```

### Scripts Disponibles
```bash
# Servidor de desarrollo
npm run dev          # Inicia live-server en puerto 3000

# Tests
npm test             # Ejecuta todos los tests
npm run test:unit    # Solo tests unitarios
npm run test:coverage # Tests con coverage
npm run test:watch   # Tests en modo watch

# Tests E2E (Playwright)
npm run test:e2e     # Tests end-to-end
npm run test:e2e:headed # Tests E2E con navegador visible
```

## 🎨 Características de la UI

### 🎨 GUÍA DE ESTILOS OFICIAL - NO MODIFICAR

**⚠️ IMPORTANTE: Esta es la paleta de colores oficial de PEDORROS. NO modificar estos colores sin autorización explícita.**

#### Paleta de Colores Principal (Temática Marrón Clara)
- **Color principal**: `#8B4513` (Saddle Brown) - **NO CAMBIAR**
- **Color secundario**: `#A0522D` (Sienna) - **NO CAMBIAR**
- **Color claro**: `#CD853F` (Sandy Brown) - **NO CAMBIAR**
- **Color oscuro**: `#654321` (Dark Brown) - **NO CAMBIAR**
- **Color de acento**: `#CD853F` (Sandy Brown) - **NO CAMBIAR**
- **Fondo principal**: `linear-gradient(135deg, #8B4513, #A0522D, #CD853F)` - **NO CAMBIAR**

#### Colores de Elementos Específicos
- **Header del juego**: `linear-gradient(135deg, #654321, #8B4513)` - **NO CAMBIAR**
- **Botón DISIMULAR**: `linear-gradient(135deg, #8B4513, #A0522D)` - **NO CAMBIAR**
- **Botón REINICIAR**: `linear-gradient(135deg, #CD853F, #A0522D)` - **NO CAMBIAR**
- **Contenido principal**: `rgba(255, 255, 255, 0.1)` - **NO CAMBIAR**

#### Reglas de Diseño
1. **NUNCA cambiar el fondo principal** del body
2. **MANTENER la temática marrón clara** en todos los elementos
3. **PRESERVAR la coherencia visual** entre header y contenido
4. **NO introducir colores claros** que rompan la estética
5. **MANTENER el toque cálido y marrón claro** establecido
6. **NO usar colores dorados** - solo marrones

### Diseño Responsive
- **Mobile-first approach**
- **Breakpoints**: 768px, 480px
- **Botón DISIMULAR**: Adaptativo según resolución
- **Tipografía**: Escalable y legible

## 🔧 Funciones del Core (lib.js)

### Gestión de Estado
- `createGameState()` - Crea estado inmutable del juego
- `changeGameState()` - Cambia estado retornando nuevo objeto
- `updateRound()` - Actualiza ronda retornando nuevo objeto

### Parsing de URLs
- `parseGameURL(url)` - Parsea URL y extrae parámetros del juego
- `initializeGameState(url)` - Inicializa estado desde URL

### Cálculo de Roles y Sonidos
- `calculateGameRoles(totalPlayers)` - Calcula distribución de roles según tabla del PRODUCT_BRIEF
- `generateNextSounds(roles, totalPlayers)` - Genera diccionario de sonidos para cada jugador
- `shuffleArray(array)` - Mezcla array usando algoritmo Fisher-Yates (inmutable)

### Funcionalidad DISIMULAR
- `getPlayerRole(peditos, pedorro, playerNumber)` - Determina rol del jugador (pedito, pedorro, neutral)
- `determineSoundForPlayer(nextSounds, peditos, pedorro, playerNumber)` - Lógica de selección de sonido
- `handleDisimularClick(gameState)` - Maneja click del botón DISIMULAR con estado inmutable
- `playIntroAndPedorroSound()` - Secuencia especial de sonidos para jugador 1 (intro + pedorro)
- `createAudioContext()` - Crea y gestiona contexto de Web Audio API
- `playSoundWebAudio(soundFileName, delayMs)` - Reproduce sonido con timing preciso usando Web Audio API
- `playSoundHTML5(soundFileName)` - Fallback a HTML5 Audio si Web Audio API falla
- `preloadAudioForIOS()` - Precarga audio para compatibilidad con iOS

### Funcionalidad de Acusaciones
- `getAccusationState(accusations, playerNumber)` - Obtiene estado actual de acusación de un jugador
- `validateAccusations(accusations, totalPlayers)` - Valida que las cantidades coincidan con distribución esperada

### Utilidades
- `isValidGameState()` - Valida estructura del estado
- `getPlayerInfo()` - Obtiene información del jugador
- `getRoundInfo()` - Obtiene información de la ronda
- `handleDisimularClick()` - Maneja click del botón DISIMULAR

## 🧪 Testing

### Cobertura de Tests
- **parseGameURL**: 22 tests cubriendo todos los casos
- **shuffleArray**: 4 tests (mezcla, inmutabilidad, casos edge)
- **calculateGameRoles**: 8 tests (distribución, validación, aleatoriedad)
- **generateNextSounds**: 3 tests (generación, validación, rangos)
- **Funcionalidad DISIMULAR**: 16 tests (lógica de sonidos, roles, inmutabilidad)
- **Funcionalidad INVESTIGAR**: 13 tests (botón, permisos, cambio de estado)
- **Funcionalidad Intro + Pedorro**: 16 tests (secuencia de sonidos, timing, fallbacks)
- **Funcionalidad de Acusaciones**: 13 tests (validación, estados, cantidades)
- **Funciones Utilitarias**: 11 tests (manejo de clases CSS)
- **Total**: 105 tests con cobertura completa

### Casos de Test Cubiertos
- ✅ URLs con diferentes formatos y códigos
- ✅ Manejo de URLs inválidas y malformadas
- ✅ Casos límite (códigos largos, números grandes)
- ✅ Validación de inmutabilidad y funciones puras
- ✅ Manejo de URLs null/undefined/empty
- ✅ Cálculo de roles para 4-16 jugadores
- ✅ Generación de sonidos según roles
- ✅ Mezcla de arrays con preservación de inmutabilidad
- ✅ Validación de rangos y tipos de entrada
- ✅ Funcionalidad de investigar con permisos de jugador 1
- ✅ Cambio de estado del juego a ACUSE
- ✅ Validación de elementos del DOM para investigar
- ✅ Funcionalidad de acusaciones con validación de cantidades
- ✅ Estados de botones (verde, naranja, rojo) y cambio cíclico
- ✅ Funciones utilitarias para manejo de clases CSS
- ✅ Integración con Firebase para cargar estado real del juego

## 🚧 Próximas Funcionalidades

### ✅ **COMPLETADO - Fase 4: Transición a Estado ACUSE**
- [x] Botón de investigar después de secuencia DISIMULAR
- [x] Secuencia especial de sonidos para jugador 1 (intro + pedorro) antes del botón INVESTIGAR
- [x] Permisos exclusivos para jugador 1 (director del juego)
- [x] Actualización de estado del juego a "ACUSE" en Firebase
- [x] Interfaz diferenciada para jugador 1 vs otros jugadores
- [x] Tests unitarios completos (29 nuevos tests: 13 investigar + 16 intro+pedorro)
- [x] Diseño responsive y temática visual consistente
- [x] Integración con arquitectura existente sin regresiones

### ✅ **COMPLETADO - Fase 3: Funcionalidad del Botón DISIMULAR**
- [x] Sistema de audio y temporizador de 5 segundos
- [x] Contador visual prominente de 5, 4, 3, 2, 1, 0 en pantalla completa
- [x] Ocultación del contenido principal durante la secuencia de DISIMULAR
- [x] Estado "DISIMULANDO" después del contador con animaciones dramáticas
- [x] Web Audio API nativa con timing preciso de 5 segundos
- [x] Precarga automática para iOS al hacer click en DISIMULAR
- [x] Reproducción automática de sonidos según rol del jugador
- [x] Lógica inteligente de sonidos basada en Firebase
- [x] Integración completa con campos `nextSounds`, `peditos` y `pedorro`
- [x] Fallback robusto a HTML5 Audio si Web Audio API falla
- [x] Compatibilidad total con iOS sin problemas de autoplay
- [x] Tests unitarios completos (16 nuevos tests)
- [x] Arquitectura inmutable y funcional
- [x] Scripts de preparación de juegos de prueba
- [x] Experiencia inmersiva con contador a pantalla completa

### ✅ **COMPLETADO - Fase 5: Sistema de Acusaciones Completo**
- [x] Pantalla de acusación con grid de botones de jugadores
- [x] Estados de botones con colores reales (verde, naranja, rojo)
- [x] Cambio cíclico de colores en cada botón
- [x] Validación automática que activa botón ACUSAR
- [x] Inicialización inteligente con todos en verde por defecto
- [x] Mensaje especial "¡ERES EL PEDORRO!" para jugador correspondiente
- [x] Integración con Firebase para cargar estado real (no hardcodeado)
- [x] Funciones utilitarias para manejo consistente de clases CSS
- [x] Tests unitarios completos (24 nuevos tests: 13 acusaciones + 11 utilitarias)
- [x] Diseño responsive y colores intuitivos
- [x] Integración completa con arquitectura existente

### Fase 6: Estado RESULTS y Puntuaciones
- [ ] Estado RESULTS con puntuaciones y ranking
- [ ] Lógica de cálculo de puntos por acusaciones correctas

### Fase 6: Sincronización Avanzada
- [ ] Sincronización en tiempo real del estado del juego
- [ ] Sistema de roles y distribución automática
- [ ] Persistencia de ranking entre sesiones

### ✅ **COMPLETADO - Fase 1: Sistema de Reinicio**
- [x] Botón REINICIAR para jugador 1
- [x] Integración con Firebase Realtime Database
- [x] Guardado de estado de reinicio
- [x] Sistema de autenticación anónima
- [x] Arquitectura funcional e inmutable

### ✅ **COMPLETADO - Fase 2: Cálculo Automático de Roles y Sonidos**
- [x] Funciones de cálculo de roles según tabla del PRODUCT_BRIEF
- [x] Generación automática de sonidos para cada jugador
- [x] Listener de Firebase solo para jugador 1 (director del juego)
- [x] Prevención de cálculos duplicados
- [x] Tests unitarios completos (15 nuevos tests)
- [x] Integración con sistema existente sin regresiones

## 📚 Documentación Adicional

- **PRODUCT_BRIEF.md**: Especificación completa del producto
- **docs/features/**: Planes técnicos de cada funcionalidad
- **Tests**: Documentación de casos de uso y edge cases

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- **Principios de programación funcional** para código limpio y mantenible
- **Arquitectura de módulos ES6** para separación de responsabilidades
- **Testing profesional** para calidad y confiabilidad del código
