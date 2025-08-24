/**
 * Tests para funcionalidad de acusaciones
 */

import { 
    getAccusationState, 
    validateAccusations 
} from '../../web/lib.js';

describe('Funcionalidad de Acusaciones', () => {
    
    describe('getAccusationState', () => {
        test('debe retornar "verde" por defecto para jugador sin acusación', () => {
            const accusations = {};
            const result = getAccusationState(accusations, 1);
            expect(result).toBe('verde');
        });
        
        test('debe retornar el estado actual de un jugador', () => {
            const accusations = { 1: 'naranja', 2: 'rojo', 3: 'verde' };
            expect(getAccusationState(accusations, 1)).toBe('naranja');
            expect(getAccusationState(accusations, 2)).toBe('rojo');
            expect(getAccusationState(accusations, 3)).toBe('verde');
        });
        
        test('debe manejar parámetros inválidos', () => {
            expect(getAccusationState(null, 1)).toBe('verde');
            expect(getAccusationState(undefined, 1)).toBe('verde');
            expect(getAccusationState('invalid', 1)).toBe('verde');
            expect(getAccusationState({}, 'invalid')).toBe('verde');
        });
    });
    
    describe('validateAccusations', () => {
        test('debe validar acusaciones correctas para 4 jugadores', () => {
            const accusations = { 1: 'verde', 2: 'naranja', 3: 'naranja', 4: 'rojo' };
            const result = validateAccusations(accusations, 4);
            
            expect(result.success).toBe(true);
            expect(result.error).toBeNull();
            expect(result.counts).toEqual({ verdes: 1, naranjas: 2, rojos: 1 });
            expect(result.expected).toEqual({ peditos: 2, pedorros: 1, neutrales: 1 });
        });
        
        test('debe validar acusaciones correctas para 5 jugadores', () => {
            const accusations = { 1: 'verde', 2: 'verde', 3: 'naranja', 4: 'naranja', 5: 'rojo' };
            const result = validateAccusations(accusations, 5);
            
            expect(result.success).toBe(true);
            expect(result.error).toBeNull();
            expect(result.counts).toEqual({ verdes: 2, naranjas: 2, rojos: 1 });
            expect(result.expected).toEqual({ peditos: 2, pedorros: 1, neutrales: 2 });
        });
        
        test('debe rechazar acusaciones con cantidades incorrectas', () => {
            const accusations = { 1: 'verde', 2: 'verde', 3: 'naranja', 4: 'rojo' };
            const result = validateAccusations(accusations, 4);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('Cantidades incorrectas');
            expect(result.counts).toEqual({ verdes: 2, naranjas: 1, rojos: 1 });
        });
        
        test('debe manejar acusaciones incompletas', () => {
            const accusations = { 1: 'verde', 2: 'naranja' };
            const result = validateAccusations(accusations, 4);
            
            expect(result.success).toBe(false);
            expect(result.counts).toEqual({ verdes: 3, naranjas: 1, rojos: 0 });
        });
        
        test('debe validar acusaciones para 16 jugadores', () => {
            const accusations = {};
            // Crear acusaciones para 16 jugadores: 10 peditos, 1 pedorro, 5 neutrales
            for (let i = 1; i <= 16; i++) {
                if (i <= 10) {
                    accusations[i] = 'naranja'; // peditos
                } else if (i === 11) {
                    accusations[i] = 'rojo'; // pedorro
                } else {
                    accusations[i] = 'verde'; // neutrales
                }
            }
            
            const result = validateAccusations(accusations, 16);
            expect(result.success).toBe(true);
            expect(result.counts).toEqual({ verdes: 5, naranjas: 10, rojos: 1 });
        });
        
        test('debe rechazar número de jugadores fuera del rango válido', () => {
            expect(validateAccusations({}, 3).success).toBe(false);
            expect(validateAccusations({}, 17).success).toBe(false);
        });
        
        test('debe manejar parámetros inválidos', () => {
            expect(validateAccusations(null, 4).success).toBe(false);
            expect(validateAccusations(undefined, 4).success).toBe(false);
            expect(validateAccusations('invalid', 4).success).toBe(false);
            expect(validateAccusations({}, 'invalid').success).toBe(false);
        });
        
        test('debe contar estados inválidos como verdes', () => {
            const accusations = { 1: 'verde', 2: 'naranja', 3: 'naranja', 4: 'invalid' };
            const result = validateAccusations(accusations, 4);
            
            expect(result.success).toBe(false);
            expect(result.counts).toEqual({ verdes: 2, naranjas: 2, rojos: 0 });
        });
        
        test('debe manejar acusaciones vacías como todos verdes', () => {
            const accusations = {};
            const result = validateAccusations(accusations, 4);
            
            expect(result.success).toBe(false);
            expect(result.counts).toEqual({ verdes: 4, naranjas: 0, rojos: 0 });
        });
        
        test('debe manejar acusaciones parciales contando el resto como verdes', () => {
            const accusations = { 1: 'naranja', 2: 'rojo' };
            const result = validateAccusations(accusations, 5);
            
            expect(result.success).toBe(false);
            expect(result.counts).toEqual({ verdes: 3, naranjas: 1, rojos: 1 });
        });
    });
});
