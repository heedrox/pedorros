# PEDORROS - Juego de Fiesta Multijugador

[![Tests](https://img.shields.io/badge/tests-22%20passed-brightgreen)](https://github.com/yourusername/pedorro)
[![Node.js](https://img.shields.io/badge/node-20.x-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎮 Descripción

PEDORROS es una aplicación web de fiesta multijugador que simula un juego de detective social. Los jugadores deben identificar quién ha sido el "pedorro" (el que se ha echado un pedo) y quiénes han sido los "peditos" (pedos menores) basándose únicamente en los sonidos reproducidos por la aplicación.

## ✨ Funcionalidades Implementadas

### 🎯 Pantalla de Estado START
- **Interfaz visual completa** con temática marrón
- **Botón DISIMULAR prominente** y centrado
- **Información de ronda** (Ronda X de 5)
- **Identificación de jugador** (Jugador X / Y)
- **Diseño responsive** optimizado para dispositivos móviles

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

### 🧪 Suite de Tests Unitarios
- **22 tests pasando** con cobertura completa
- **Tests de funcionalidad pura** (inmutabilidad, predictibilidad)
- **Tests de edge cases** (URLs inválidas, casos límite)
- **Tests de validación de regex** (caracteres especiales, espacios)
- **Configuración Jest** con soporte para módulos ES6

## 🚀 Tecnologías Utilizadas

- **Frontend**: JavaScript vanilla con módulos ES6
- **Testing**: Jest + Babel + jsdom
- **Servidor de desarrollo**: live-server
- **Entorno**: Node.js 20 (usar `nvm use 20`)
- **Arquitectura**: Funcional e inmutable

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
│       └── parseGameURL.test.js # Tests para parseGameURL
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

### Paleta de Colores (Temática Marrón)
- **Color principal**: `#8B4513` (Saddle Brown)
- **Color secundario**: `#A0522D` (Sienna)
- **Color claro**: `#DEB887` (Burlywood)
- **Color oscuro**: `#654321` (Dark Brown)
- **Color de acento**: `#D2691E` (Chocolate)
- **Fondo**: Gradiente de marrones claros

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

### Utilidades
- `isValidGameState()` - Valida estructura del estado
- `getPlayerInfo()` - Obtiene información del jugador
- `getRoundInfo()` - Obtiene información de la ronda
- `handleDisimularClick()` - Maneja click del botón DISIMULAR

## 🧪 Testing

### Cobertura de Tests
- **parseGameURL**: 22 tests cubriendo todos los casos
- **URLs válidas**: 4 tests
- **URLs inválidas**: 7 tests
- **Casos edge**: 4 tests
- **Validación de regex**: 3 tests
- **Funcionalidad pura**: 4 tests

### Casos de Test Cubiertos
- ✅ URLs con diferentes formatos y códigos
- ✅ Manejo de URLs inválidas y malformadas
- ✅ Casos límite (códigos largos, números grandes)
- ✅ Validación de inmutabilidad y funciones puras
- ✅ Manejo de URLs null/undefined/empty

## 🚧 Próximas Funcionalidades

### Fase 2: Funcionalidad del Botón DISIMULAR
- [ ] Sistema de audio y temporizador de 5 segundos
- [ ] Reproducción de sonidos de pedorros y peditos
- [ ] Sincronización local entre dispositivos

### Fase 3: Estados del Juego
- [ ] Transición a estado ACUSE
- [ ] Sistema de votación y acusaciones
- [ ] Estado RESULTS con puntuaciones

### Fase 4: Integración Firebase
- [ ] Sincronización en tiempo real
- [ ] Base de datos para estado del juego
- [ ] Sistema de roles y distribución

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
