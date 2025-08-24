/**
 * Tests unitarios para las funciones de cálculo de roles y sonidos del juego
 */

import { 
    calculateGameRoles, 
    generateNextSounds, 
    shuffleArray 
} from '../../web/lib.js';

describe('shuffleArray', () => {
    test('debe mezclar un array sin modificar el original', () => {
        const original = [1, 2, 3, 4, 5];
        const shuffled = shuffleArray(original);
        
        expect(shuffled).not.toEqual(original);
        expect(original).toEqual([1, 2, 3, 4, 5]); // Original no modificado
        expect(shuffled).toHaveLength(5);
        expect(shuffled).toContain(1);
        expect(shuffled).toContain(2);
        expect(shuffled).toContain(3);
        expect(shuffled).toContain(4);
        expect(shuffled).toContain(5);
    });
    
    test('debe retornar array vacío para input inválido', () => {
        expect(shuffleArray(null)).toEqual([]);
        expect(shuffleArray(undefined)).toEqual([]);
        expect(shuffleArray('string')).toEqual([]);
        expect(shuffleArray(123)).toEqual([]);
    });
    
    test('debe manejar arrays vacíos', () => {
        expect(shuffleArray([])).toEqual([]);
    });
    
    test('debe manejar arrays de un elemento', () => {
        expect(shuffleArray([42])).toEqual([42]);
    });
});

describe('calculateGameRoles', () => {
    test('debe calcular roles correctamente para 4 jugadores', () => {
        const result = calculateGameRoles(4);
        
        expect(result.success).toBe(true);
        expect(result.peditos).toHaveLength(2);
        expect(result.pedorro).toBeGreaterThan(0);
        expect(result.pedorro).toBeLessThanOrEqual(4);
        expect(result.totalPlayers).toBe(4);
        
        // Verificar que pedorro no esté en peditos
        expect(result.peditos).not.toContain(result.pedorro);
        
        // Verificar que todos los números estén en el rango correcto
        result.peditos.forEach(num => {
            expect(num).toBeGreaterThan(0);
            expect(num).toBeLessThanOrEqual(4);
        });
    });
    
    test('debe calcular roles correctamente para 8 jugadores', () => {
        const result = calculateGameRoles(8);
        
        expect(result.success).toBe(true);
        expect(result.peditos).toHaveLength(4);
        expect(result.pedorro).toBeGreaterThan(0);
        expect(result.pedorro).toBeLessThanOrEqual(8);
        expect(result.totalPlayers).toBe(8);
        
        // Verificar que pedorro no esté en peditos
        expect(result.peditos).not.toContain(result.pedorro);
    });
    
    test('debe calcular roles correctamente para 16 jugadores', () => {
        const result = calculateGameRoles(16);
        
        expect(result.success).toBe(true);
        expect(result.peditos).toHaveLength(10);
        expect(result.pedorro).toBeGreaterThan(0);
        expect(result.pedorro).toBeLessThanOrEqual(16);
        expect(result.totalPlayers).toBe(16);
    });
    
    test('debe fallar para menos de 4 jugadores', () => {
        const result = calculateGameRoles(3);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Número de jugadores debe estar entre 4 y 16');
        expect(result.peditos).toEqual([]);
        expect(result.pedorro).toBeNull();
    });
    
    test('debe fallar para más de 16 jugadores', () => {
        const result = calculateGameRoles(17);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Número de jugadores debe estar entre 4 y 16');
        expect(result.peditos).toEqual([]);
        expect(result.pedorro).toBeNull();
    });
    
    test('debe fallar para input inválido', () => {
        const result = calculateGameRoles('invalid');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Número de jugadores debe ser un número entero');
        expect(result.peditos).toEqual([]);
        expect(result.pedorro).toBeNull();
    });
    
    test('debe generar roles únicos cada vez', () => {
        const result1 = calculateGameRoles(6);
        const result2 = calculateGameRoles(6);
        
        expect(result1.success).toBe(true);
        expect(result2.success).toBe(true);
        
        // Los roles pueden ser diferentes (aleatorios)
        // Pero ambos deben ser válidos
        expect(result1.peditos).toHaveLength(3);
        expect(result2.peditos).toHaveLength(3);
        expect(result1.pedorro).toBeGreaterThan(0);
        expect(result2.pedorro).toBeGreaterThan(0);
    });
});

describe('generateNextSounds', () => {
    test('debe generar sonidos correctamente para roles válidos', () => {
        const roles = {
            success: true,
            peditos: [2, 4],
            pedorro: 1,
            totalPlayers: 5
        };
        
        const nextSounds = generateNextSounds(roles, 5);
        
        expect(Object.keys(nextSounds)).toHaveLength(5);
        expect(nextSounds[1]).toBeGreaterThan(0); // pedorro
        expect(nextSounds[1]).toBeLessThanOrEqual(5);
        expect(nextSounds[2]).toBeGreaterThan(0); // pedito
        expect(nextSounds[2]).toBeLessThanOrEqual(5);
        expect(nextSounds[3]).toBeNull(); // neutral
        expect(nextSounds[4]).toBeGreaterThan(0); // pedito
        expect(nextSounds[4]).toBeLessThanOrEqual(5);
        expect(nextSounds[5]).toBeNull(); // neutral
        
        // Verificar que todos los peditos tengan el mismo sonido
        expect(nextSounds[2]).toBe(nextSounds[4]);
    });
    
    test('debe retornar objeto vacío para roles inválidos', () => {
        expect(generateNextSounds(null, 5)).toEqual({});
        expect(generateNextSounds({}, 5)).toEqual({});
        expect(generateNextSounds({ success: false }, 5)).toEqual({});
        expect(generateNextSounds({ success: true, peditos: null }, 5)).toEqual({});
    });
    
    test('debe manejar diferentes números de jugadores', () => {
        const roles = {
            success: true,
            peditos: [2, 4, 6],
            pedorro: 1,
            totalPlayers: 8
        };
        
        const nextSounds = generateNextSounds(roles, 8);
        
        expect(Object.keys(nextSounds)).toHaveLength(8);
        expect(nextSounds[1]).toBeGreaterThan(0); // pedorro
        expect(nextSounds[2]).toBeGreaterThan(0); // pedito
        expect(nextSounds[3]).toBeNull(); // neutral
        expect(nextSounds[4]).toBeGreaterThan(0); // pedito
        expect(nextSounds[5]).toBeNull(); // neutral
        expect(nextSounds[6]).toBeGreaterThan(0); // pedito
        expect(nextSounds[7]).toBeNull(); // neutral
        expect(nextSounds[8]).toBeNull(); // neutral
        
        // Verificar que todos los peditos tengan el mismo sonido
        expect(nextSounds[2]).toBe(nextSounds[4]);
        expect(nextSounds[4]).toBe(nextSounds[6]);
    });
    
    test('debe generar sonidos en rango 1-5', () => {
        const roles = {
            success: true,
            peditos: [2],
            pedorro: 1,
            totalPlayers: 3
        };
        
        const nextSounds = generateNextSounds(roles, 3);
        
        // Verificar rango de sonidos
        Object.values(nextSounds).forEach(sound => {
            if (sound !== null) {
                expect(sound).toBeGreaterThan(0);
                expect(sound).toBeLessThanOrEqual(5);
            }
        });
    });
});
