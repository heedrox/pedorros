/**
 * Tests para funcionalidad de acusaciones
 */

import { 
    getAccusationState, 
    validateAccusations,
    convertAccusationColorsToRoles,
    validateAccusationFormat,
    getAccusationsProgress
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
    
    describe('convertAccusationColorsToRoles', () => {
        test('debe convertir colores a roles correctamente', () => {
            const accusationsState = { 1: 'verde', 2: 'naranja', 3: 'rojo', 4: 'verde' };
            const result = convertAccusationColorsToRoles(accusationsState);
            
            expect(result.success).toBe(true);
            expect(result.accusations).toEqual({
                1: 'neutral',
                2: 'pedito',
                3: 'pedorro',
                4: 'neutral'
            });
        });
        
        test('debe manejar parámetros inválidos', () => {
            expect(convertAccusationColorsToRoles(null).success).toBe(false);
            expect(convertAccusationColorsToRoles(undefined).success).toBe(false);
            expect(convertAccusationColorsToRoles('invalid').success).toBe(false);
        });
        
        test('debe rechazar colores inválidos', () => {
            const accusationsState = { 1: 'verde', 2: 'azul', 3: 'rojo' };
            const result = convertAccusationColorsToRoles(accusationsState);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain("Color inválido 'azul'");
        });
        
        test('debe convertir solo colores válidos', () => {
            const accusationsState = { 1: 'verde', 2: 'naranja', 3: 'rojo' };
            const result = convertAccusationColorsToRoles(accusationsState);
            
            expect(result.success).toBe(true);
            expect(result.accusations).toEqual({
                1: 'neutral',
                2: 'pedito',
                3: 'pedorro'
            });
        });
    });
    
    describe('validateAccusationFormat', () => {
        test('debe validar formato correcto para 4 jugadores', () => {
            const accusations = { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'pedorro' };
            const result = validateAccusationFormat(accusations, 4);
            
            expect(result.success).toBe(true);
            expect(result.message).toBe('Formato de acusaciones válido');
        });
        
        test('debe validar formato correcto para 5 jugadores', () => {
            const accusations = { 1: 'neutral', 2: 'neutral', 3: 'pedito', 4: 'pedito', 5: 'pedorro' };
            const result = validateAccusationFormat(accusations, 5);
            
            expect(result.success).toBe(true);
            expect(result.message).toBe('Formato de acusaciones válido');
        });
        
        test('debe rechazar número incorrecto de acusaciones', () => {
            const accusations = { 1: 'neutral', 2: 'pedito', 3: 'pedorro' };
            const result = validateAccusationFormat(accusations, 4);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('Número de acusaciones (3) no coincide con total de jugadores (4)');
        });
        
        test('debe rechazar roles inválidos', () => {
            const accusations = { 1: 'neutral', 2: 'pedito', 3: 'pedorro', 4: 'invalid' };
            const result = validateAccusationFormat(accusations, 4);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain("Rol inválido 'invalid'");
        });
        
        test('debe rechazar números de jugador faltantes', () => {
            const accusations = { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'pedorro', 6: 'neutral' };
            const result = validateAccusationFormat(accusations, 5);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('Falta acusación para el jugador 5');
        });
        
        test('debe rechazar número de jugadores fuera del rango válido', () => {
            const accusations = { 1: 'neutral', 2: 'pedito', 3: 'pedorro' };
            expect(validateAccusationFormat(accusations, 3).success).toBe(false);
            expect(validateAccusationFormat(accusations, 17).success).toBe(false);
        });
        
        test('debe manejar parámetros inválidos', () => {
            expect(validateAccusationFormat(null, 4).success).toBe(false);
            expect(validateAccusationFormat(undefined, 4).success).toBe(false);
            expect(validateAccusationFormat('invalid', 4).success).toBe(false);
            expect(validateAccusationFormat({}, 'invalid').success).toBe(false);
        });
        
        test('debe validar formato para 16 jugadores', () => {
            const accusations = {};
            // Crear acusaciones para 16 jugadores: 10 peditos, 1 pedorro, 5 neutrales
            for (let i = 1; i <= 16; i++) {
                if (i <= 10) {
                    accusations[i] = 'pedito';
                } else if (i === 11) {
                    accusations[i] = 'pedorro';
                } else {
                    accusations[i] = 'neutral';
                }
            }
            
            const result = validateAccusationFormat(accusations, 16);
            expect(result.success).toBe(true);
            expect(result.message).toBe('Formato de acusaciones válido');
        });
    });
    
    describe('getAccusationsProgress', () => {
        test('debe obtener progreso correcto para acusaciones completas', () => {
            const accusationsData = {
                acusation1: { 1: 'neutral', 2: 'pedito', 3: 'pedorro', 4: 'pedito' },
                acusation3: { 1: 'pedito', 2: 'neutral', 3: 'pedorro', 4: 'neutral' }
            };
            const result = getAccusationsProgress(accusationsData, 4);
            
            expect(result.success).toBe(true);
            expect(result.playersWithAccusations).toEqual([1, 3]);
            expect(result.totalSent).toBe(2);
            expect(result.totalExpected).toBe(4);
            expect(result.progress).toBe('2/4');
            expect(result.message).toBe('Acusaciones enviadas: 1, 3');
        });
        
        test('debe manejar acusaciones incompletas', () => {
            const accusationsData = {
                acusation1: { 1: 'neutral', 2: 'pedito' }, // Solo 2 acusaciones de 4
                acusation2: { 1: 'pedito', 2: 'neutral', 3: 'pedorro', 4: 'pedito' } // Completa
            };
            const result = getAccusationsProgress(accusationsData, 4);
            
            expect(result.success).toBe(true);
            expect(result.playersWithAccusations).toEqual([2]);
            expect(result.totalSent).toBe(1);
            expect(result.totalExpected).toBe(4);
            expect(result.progress).toBe('1/4');
            expect(result.message).toBe('Acusaciones enviadas: 2');
        });
        
        test('debe manejar acusaciones con valores inválidos', () => {
            const accusationsData = {
                acusation1: { 1: 'neutral', 2: 'pedito', 3: 'pedorro', 4: 'invalid' }
            };
            const result = getAccusationsProgress(accusationsData, 4);
            
            expect(result.success).toBe(true);
            expect(result.playersWithAccusations).toEqual([]);
            expect(result.totalSent).toBe(0);
            expect(result.message).toBe('Ninguna acusación enviada aún');
        });
        
        test('debe manejar acusaciones vacías', () => {
            const accusationsData = {};
            const result = getAccusationsProgress(accusationsData, 4);
            
            expect(result.success).toBe(true);
            expect(result.playersWithAccusations).toEqual([]);
            expect(result.totalSent).toBe(0);
            expect(result.message).toBe('Ninguna acusación enviada aún');
        });
        
        test('debe manejar parámetros inválidos', () => {
            expect(getAccusationsProgress(null, 4).success).toBe(false);
            expect(getAccusationsProgress(undefined, 4).success).toBe(false);
            expect(getAccusationsProgress('invalid', 4).success).toBe(false);
            expect(getAccusationsProgress({}, 'invalid').success).toBe(false);
        });
        
        test('debe rechazar número de jugadores fuera del rango válido', () => {
            const accusationsData = { acusation1: { 1: 'neutral', 2: 'pedito', 3: 'pedorro' } };
            expect(getAccusationsProgress(accusationsData, 3).success).toBe(false);
            expect(getAccusationsProgress(accusationsData, 17).success).toBe(false);
        });
        
        test('debe ordenar jugadores numéricamente', () => {
            const accusationsData = {
                acusation5: { 1: 'neutral', 2: 'pedito', 3: 'pedorro', 4: 'pedito', 5: 'neutral' },
                acusation1: { 1: 'pedito', 2: 'neutral', 3: 'pedorro', 4: 'neutral', 5: 'pedito' },
                acusation3: { 1: 'neutral', 2: 'pedito', 3: 'pedorro', 4: 'pedito', 5: 'neutral' }
            };
            const result = getAccusationsProgress(accusationsData, 5);
            
            expect(result.success).toBe(true);
            expect(result.playersWithAccusations).toEqual([1, 3, 5]);
            expect(result.message).toBe('Acusaciones enviadas: 1, 3, 5');
        });
    });
});
