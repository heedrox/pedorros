# Scripts de Preparación del Juego PEDORROS

Este directorio contiene scripts para preparar juegos de prueba con el jugador 1 como pedorro.

## 📁 Scripts Disponibles

### 1. `quick-test.cjs` - Prueba Rápida (Recomendado)
**Uso:** `node scripts/quick-test.cjs`

- **Configuración fija**: Código "test", 5 jugadores
- **Roles predefinidos**:
  - Jugador 1: Pedorro (pedorro-1.mp3)
  - Jugadores 2, 3: Peditos (pedito-3.mp3)
  - Jugadores 4, 5: Neutrales (neutral.mp3)
- **Ideal para**: Pruebas rápidas y desarrollo

### 2. `prepare-test-game-simple.js` - Configuración Personalizable
**Uso:** `node scripts/prepare-test-game-simple.js [codigo-juego] [total-jugadores]`

**Ejemplos:**
```bash
node scripts/prepare-test-game-simple.js galerna 5
node scripts/prepare-test-game-simple.js fiesta 8
node scripts/prepare-test-game-simple.js test 12
```

- **Configuración personalizable**: Código y número de jugadores
- **Roles automáticos**: Según la tabla del PRODUCT_BRIEF
- **Ideal para**: Pruebas con diferentes configuraciones

### 3. `prepare-test-game.js` - Versión Completa
**Uso:** `node scripts/prepare-test-game.js [codigo-juego] [total-jugadores]`

- **Configuración hardcodeada**: Requiere editar el script
- **Funcionalidad completa**: Con validaciones avanzadas
- **Ideal para**: Casos de uso específicos

## 🚀 Uso Rápido

### Opción 1: Prueba Inmediata
```bash
# Preparar juego de prueba con 5 jugadores
node scripts/quick-test.cjs
```

### Opción 2: Configuración Personalizada
```bash
# Preparar juego "galerna" con 6 jugadores
node scripts/prepare-test-game-simple.js galerna 6
```

## 📋 Configuración de Roles

### Distribución Automática (4-16 jugadores)
| Jugadores | Peditos | Pedorros | Neutrales |
|-----------|---------|----------|-----------|
| 4         | 2       | 1        | 1         |
| 5         | 2       | 1        | 2         |
| 6         | 3       | 1        | 2         |
| 7         | 4       | 1        | 2         |
| 8         | 4       | 1        | 3         |
| 9         | 5       | 1        | 3         |
| 10        | 6       | 1        | 3         |
| 11        | 6       | 1        | 4         |
| 12        | 7       | 1        | 4         |
| 13        | 8       | 1        | 4         |
| 14        | 8       | 1        | 5         |
| 15        | 9       | 1        | 5         |
| 16        | 10      | 1        | 5         |

### Regla de Prueba
- **El jugador 1 SIEMPRE será el pedorro** para facilitar las pruebas
- Los peditos serán los siguientes jugadores según la distribución
- Los neutrales serán el resto

## 🎵 Configuración de Sonidos

### Sonidos de Prueba
- **Pedorro**: `pedorro-1.mp3` (número 1)
- **Peditos**: `pedito-3.mp3` (número 3)
- **Neutrales**: `neutral.mp3` (null)

### Estructura Firebase
```json
{
  "pedorros-game": {
    "test": {
      "nextSounds": {
        "1": 1,    // Pedorro
        "2": 3,    // Pedito
        "3": 3,    // Pedito
        "4": null, // Neutral
        "5": null  // Neutral
      },
      "peditos": [2, 3],
      "pedorro": 1,
      "state": "START",
      "numRound": 1
    }
  }
}
```

## 🔧 Requisitos

### Antes de Ejecutar
1. **Firebase configurado**: Archivo `web/firebase-config.js` debe existir
2. **Node.js 20**: Usar `nvm use 20`
3. **Dependencias instaladas**: `npm install`
4. **Servidor ejecutándose**: `npm run dev` (opcional, para pruebas)

### Configuración de Firebase
Los scripts leen automáticamente la configuración de:
- `web/firebase-config.js`
- Extraen `apiKey`, `authDomain`, `databaseURL`, etc.
- No es necesario editar los scripts

## 🧪 Proceso de Prueba

### 1. Preparar el Juego
```bash
node scripts/quick-test.cjs
```

### 2. Abrir URLs en Pestañas Separadas
```
http://localhost:3000/index.html?/g/test/p/1/5  # Pedorro
http://localhost:3000/index.html?/g/test/p/2/5  # Pedito
http://localhost:3000/index.html?/g/test/p/3/5  # Pedito
http://localhost:3000/index.html?/g/test/p/4/5  # Neutral
http://localhost:3000/index.html?/g/test/p/5/5  # Neutral
```

### 3. Probar Funcionalidad
1. Pulsar "DISIMULAR" en cada pestaña
2. Verificar contador y estado "DISIMULANDO"
3. Confirmar que cada jugador escucha el sonido correcto

## 🚨 Solución de Problemas

### Error: "No se pudo extraer la configuración de Firebase"
- Verificar que `web/firebase-config.js` existe
- Comprobar que la configuración es válida

### Error: "Usuario no autenticado"
- Verificar conexión a internet
- Comprobar reglas de Firebase Database

### Error: "No se puede escribir en la base de datos"
- Verificar reglas de seguridad de Firebase
- Comprobar que el proyecto esté activo

## 📝 Notas de Desarrollo

- Los scripts usan **imports dinámicos** para Firebase
- **Autenticación anónima** para simplicidad
- **Configuración automática** desde archivos existentes
- **Validación completa** de parámetros de entrada
- **Manejo de errores** robusto con mensajes claros

## 🔄 Reutilización

Los scripts están diseñados para ser reutilizables:
- **Sin dependencias hardcodeadas**
- **Configuración automática** desde archivos del proyecto
- **Parámetros flexibles** para diferentes escenarios
- **Documentación completa** para mantenimiento
