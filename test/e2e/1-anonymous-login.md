# Scenario: Login anónimo

## ARRANGE
- Iniciar servidor de desarrollo con `nvm use 20 && npm run dev`
- Abrir navegador
- Navegar a: {BASE_URL}?/g/galerna/p/1/5

## ACT
- Pulsa botón "ACCEDER".

## ASSERT
- Se muestra el botón "DISIMULAR"
- No se ve el botón "ACCEDER"

