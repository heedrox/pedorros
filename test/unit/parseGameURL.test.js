/**
 * Tests unitarios para la función parseGameURL
 * 
 * Esta función parsea URLs con el formato:
 * index.html?/g/CODIGO/p/NUMERO_JUGADOR/TOTAL_JUGADORES
 * 
 * NOTA: Ahora importamos la función real desde lib.js
 */

// Importar la función real desde lib.js
import { parseGameURL } from '../../web/lib.js';

// Tests para URLs válidas
describe('parseGameURL - URLs válidas', () => {
    test('debe parsear URL válida con código "galerna", jugador 1 de 5', () => {
        const url = 'http://localhost:3000/index.html?/g/galerna/p/1/5';
        const result = parseGameURL(url);
        
        expect(result.success).toBe(true);
        expect(result.gameCode).toBe('galerna');
        expect(result.playerNumber).toBe(1);
        expect(result.totalPlayers).toBe(5);
    });
    
    test('debe parsear URL válida con código "fiesta123", jugador 3 de 8', () => {
        const url = 'http://localhost:3000/index.html?/g/fiesta123/p/3/8';
        const result = parseGameURL(url);
        
        expect(result.success).toBe(true);
        expect(result.gameCode).toBe('fiesta123');
        expect(result.playerNumber).toBe(3);
        expect(result.totalPlayers).toBe(8);
    });
    
    test('debe parsear URL válida con código "test", jugador 16 de 16', () => {
        const url = 'http://localhost:3000/index.html?/g/test/p/16/16';
        const result = parseGameURL(url);
        
        expect(result.success).toBe(true);
        expect(result.gameCode).toBe('test');
        expect(result.playerNumber).toBe(16);
        expect(result.totalPlayers).toBe(16);
    });
    
    test('debe parsear URL válida con código "a", jugador 1 de 4', () => {
        const url = 'http://localhost:3000/index.html?/g/a/p/1/4';
        const result = parseGameURL(url);
        
        expect(result.success).toBe(true);
        expect(result.gameCode).toBe('a');
        expect(result.playerNumber).toBe(1);
        expect(result.totalPlayers).toBe(4);
    });
});

// Tests para URLs inválidas
describe('parseGameURL - URLs inválidas', () => {
    test('debe fallar con URL sin parámetros', () => {
        const url = 'http://localhost:3000/index.html';
        const result = parseGameURL(url);
        
        expect(result.success).toBe(false);
        expect(result.gameCode).toBe('');
        expect(result.playerNumber).toBe(0);
        expect(result.totalPlayers).toBe(0);
    });
    
    test('debe fallar con formato incorrecto - sin "g"', () => {
        const url = 'http://localhost:3000/index.html?/p/1/5';
        const result = parseGameURL(url);
        
        expect(result.success).toBe(false);
    });
    
    test('debe fallar con formato incorrecto - sin "p"', () => {
        const url = 'http://localhost:3000/index.html?/g/galerna/1/5';
        const result = parseGameURL(url);
        
        expect(result.success).toBe(false);
    });
    
    test('debe parsear URL con código de juego numérico', () => {
        const url = 'http://localhost:3000/index.html?/g/123/p/1/5';
        const result = parseGameURL(url);
        
        expect(result.success).toBe(true);
        expect(result.gameCode).toBe('123');
        expect(result.playerNumber).toBe(1);
        expect(result.totalPlayers).toBe(5);
    });
    
    test('debe fallar con formato incorrecto - letras en lugar de números', () => {
        const url = 'http://localhost:3000/index.html?/g/galerna/p/a/b';
        const result = parseGameURL(url);
        
        expect(result.success).toBe(false);
    });
    
    test('debe fallar con URL parcialmente correcta', () => {
        const url = 'http://localhost:3000/index.html?/g/galerna/p/1';
        const result = parseGameURL(url);
        
        expect(result.success).toBe(false);
    });
    
    test('debe parsear URL con parámetros extra (regex solo busca el patrón específico)', () => {
        const url = 'http://localhost:3000/index.html?/g/galerna/p/1/5/extra';
        const result = parseGameURL(url);
        
        expect(result.success).toBe(true);
        expect(result.gameCode).toBe('galerna');
        expect(result.playerNumber).toBe(1);
        expect(result.totalPlayers).toBe(5);
    });
});

// Tests para casos edge
describe('parseGameURL - Casos edge', () => {
    test('debe parsear URL con código de juego muy largo', () => {
        const longCode = 'a'.repeat(100);
        const url = `http://localhost:3000/index.html?/g/${longCode}/p/1/5`;
        const result = parseGameURL(url);
        
        expect(result.success).toBe(true);
        expect(result.gameCode).toBe(longCode);
    });
    
    test('debe parsear URL con números de jugador en límites', () => {
        const url = 'http://localhost:3000/index.html?/g/test/p/1/999';
        const result = parseGameURL(url);
        
        expect(result.success).toBe(true);
        expect(result.playerNumber).toBe(1);
        expect(result.totalPlayers).toBe(999);
    });
    
    test('debe fallar con números negativos', () => {
        const url = 'http://localhost:3000/index.html?/g/test/p/-1/5';
        const result = parseGameURL(url);
        
        expect(result.success).toBe(false);
    });
    
    test('debe parsear URL con cero como número de jugador (regex acepta 0)', () => {
        const url = 'http://localhost:3000/index.html?/g/test/p/0/5';
        const result = parseGameURL(url);
        
        expect(result.success).toBe(true);
        expect(result.gameCode).toBe('test');
        expect(result.playerNumber).toBe(0);
        expect(result.totalPlayers).toBe(5);
    });
});

// Tests para validación de regex
describe('parseGameURL - Validación de regex', () => {
    test('debe aceptar caracteres especiales en código de juego', () => {
        const url = 'http://localhost:3000/index.html?/g/test-123_abc/p/1/5';
        const result = parseGameURL(url);
        
        expect(result.success).toBe(true);
        expect(result.gameCode).toBe('test-123_abc');
    });
    
    test('debe aceptar números en código de juego', () => {
        const url = 'http://localhost:3000/index.html?/g/test123/p/1/5';
        const result = parseGameURL(url);
        
        expect(result.success).toBe(true);
        expect(result.gameCode).toBe('test123');
    });
    
    test('debe parsear URL con espacios en código de juego (regex acepta espacios)', () => {
        const url = 'http://localhost:3000/index.html?/g/test 123/p/1/5';
        const result = parseGameURL(url);
        
        expect(result.success).toBe(true);
        expect(result.gameCode).toBe('test 123');
    });
});

// Tests para funcionalidad pura
describe('parseGameURL - Funcionalidad pura', () => {
    test('debe ser una función pura - mismo input siempre produce mismo output', () => {
        const url = 'http://localhost:3000/index.html?/g/test/p/1/5';
        const result1 = parseGameURL(url);
        const result2 = parseGameURL(url);
        const result3 = parseGameURL(url);
        
        expect(result1).toEqual(result2);
        expect(result2).toEqual(result3);
        expect(result1).toEqual(result3);
    });
    
    test('debe ser una función pura - no modifica el input', () => {
        const url = 'http://localhost:3000/index.html?/g/test/p/1/5';
        const originalUrl = url;
        
        parseGameURL(url);
        
        expect(url).toBe(originalUrl);
    });
    
    test('debe ser una función pura - retorna nuevo objeto cada vez', () => {
        const url = 'http://localhost:3000/index.html?/g/test/p/1/5';
        const result1 = parseGameURL(url);
        const result2 = parseGameURL(url);
        
        expect(result1).not.toBe(result2); // Objetos diferentes en memoria
        expect(result1).toEqual(result2);   // Pero con el mismo contenido
    });
    
    test('debe manejar URLs vacías o null', () => {
        expect(parseGameURL('')).toEqual({
            success: false,
            gameCode: '',
            playerNumber: 0,
            totalPlayers: 0
        });
        
        expect(parseGameURL(null)).toEqual({
            success: false,
            gameCode: '',
            playerNumber: 0,
            totalPlayers: 0
        });
        
        expect(parseGameURL(undefined)).toEqual({
            success: false,
            gameCode: '',
            playerNumber: 0,
            totalPlayers: 0
        });
    });
});

