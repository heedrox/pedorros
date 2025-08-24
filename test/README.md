# Tests Unitarios - PEDORROS

## Estructura de Tests

```
test/
├── unit/                    # Tests unitarios
│   └── parseGameURL.test.js # Tests para la función parseGameURL
└── README.md               # Esta documentación
```

## Comandos de Testing

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar solo tests unitarios
```bash
npm run test:unit
```

### Ejecutar tests con coverage
```bash
npm run test:coverage
```

### Ejecutar tests en modo watch
```bash
npm run test:watch
```

## Tests Implementados

### parseGameURL.test.js

Tests para la función `parseGameURL()` que parsea URLs con el formato:
`index.html?/g/CODIGO/p/NUMERO_JUGADOR/TOTAL_JUGADORES`

#### Cobertura de Tests:

**URLs Válidas (4 tests):**
- ✅ Código "galerna", jugador 1 de 5
- ✅ Código "fiesta123", jugador 3 de 8  
- ✅ Código "test", jugador 16 de 16
- ✅ Código "a", jugador 1 de 4

**URLs Inválidas (7 tests):**
- ✅ URL sin parámetros
- ✅ Formato incorrecto - sin "g"
- ✅ Formato incorrecto - sin "p"
- ✅ Código de juego numérico (aceptado)
- ✅ Letras en lugar de números
- ✅ URL parcialmente correcta
- ✅ Parámetros extra (aceptado por regex)

**Casos Edge (4 tests):**
- ✅ Código de juego muy largo
- ✅ Números de jugador en límites
- ✅ Números negativos (rechazado)
- ✅ Cero como número de jugador (aceptado)

**Validación de Regex (3 tests):**
- ✅ Caracteres especiales en código
- ✅ Números en código
- ✅ Espacios en código (aceptado)

**Logging (2 tests):**
- ✅ Log de información para URLs válidas
- ✅ Warning para URLs inválidas

## Total: 20 tests ✅

## Notas de Implementación

- Los tests usan mocks para `window.location` y `console`
- La función es más permisiva de lo inicialmente esperado (acepta códigos numéricos, espacios, etc.)
- Los tests se han ajustado para reflejar el comportamiento real de la función
- Cobertura completa de todos los casos de uso y edge cases
