/**
 * Tests unitarios para las funciones de cálculo de puntuación
 */

import {
    validateScoreInputs,
    countPeditoHits,
    countPedorroHits,
    countPedorroHitsByOthers,
    calculatePlayerScore,
    calculateRoundScore
} from '../../web/lib.js';

describe('Funciones de Cálculo de Puntuación', () => {
    
    describe('validateScoreInputs', () => {
        const validAccusations = {
            acusation1: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' },
            acusation2: { 1: 'pedorro', 2: 'neutral', 3: 'pedito', 4: 'neutral' },
            acusation3: { 1: 'neutral', 2: 'pedito', 3: 'neutral', 4: 'pedito' },
            acusation4: { 1: 'pedorro', 2: 'pedito', 3: 'pedito', 4: 'neutral' }
        };
        const validPeditos = [2, 3];
        const validPedorro = 1;
        
        test('debe validar entradas correctas', () => {
            const result = validateScoreInputs(validAccusations, validPeditos, validPedorro);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        
        test('debe rechazar acusations inválido', () => {
            const result = validateScoreInputs(null, validPeditos, validPedorro);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('acusations debe ser un objeto válido');
        });
        
        test('debe rechazar peditos que no sea array', () => {
            const result = validateScoreInputs(validAccusations, 'invalid', validPedorro);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('peditos debe ser un array');
        });
        
        test('debe rechazar peditos vacío', () => {
            const result = validateScoreInputs(validAccusations, [], validPedorro);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('peditos no puede estar vacío');
        });
        
        test('debe rechazar peditos con valores no numéricos', () => {
            const result = validateScoreInputs(validAccusations, [2, 'invalid', 3], validPedorro);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('peditos debe contener solo números positivos');
        });
        
        test('debe rechazar pedorro inválido', () => {
            const result = validateScoreInputs(validAccusations, validPeditos, -1);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('pedorro debe ser un número positivo');
        });
        
        test('debe rechazar conflicto entre peditos y pedorro', () => {
            const result = validateScoreInputs(validAccusations, [1, 2], 1);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('pedorro no puede ser también un pedito');
        });
        
        test('debe rechazar claves inválidas en acusations', () => {
            const invalidAccusations = {
                ...validAccusations,
                invalidKey: { 1: 'neutral' }
            };
            const result = validateScoreInputs(invalidAccusations, validPeditos, validPedorro);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Clave inválida en acusations: invalidKey');
        });
        
        test('debe rechazar roles inválidos', () => {
            const invalidAccusations = {
                ...validAccusations,
                acusation1: { ...validAccusations.acusation1, 1: 'invalid' }
            };
            const result = validateScoreInputs(invalidAccusations, validPeditos, validPedorro);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain("Rol inválido 'invalid' en acusation1 para jugador 1");
        });
    });
    
    describe('countPeditoHits', () => {
        test('debe contar correctamente los aciertos de peditos', () => {
            const playerAccusations = { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' };
            const peditos = [2, 3];
            const result = countPeditoHits(playerAccusations, peditos);
            expect(result).toBe(2);
        });
        
        test('debe contar 0 si no hay aciertos', () => {
            const playerAccusations = { 1: 'neutral', 2: 'neutral', 3: 'neutral', 4: 'neutral' };
            const peditos = [2, 3];
            const result = countPeditoHits(playerAccusations, peditos);
            expect(result).toBe(0);
        });
        
        test('debe manejar entradas inválidas', () => {
            expect(countPeditoHits(null, [2, 3])).toBe(0);
            expect(countPeditoHits({ 1: 'pedito' }, null)).toBe(0);
        });
        
        test('debe contar solo aciertos exactos', () => {
            const playerAccusations = { 1: 'pedorro', 2: 'pedito', 3: 'pedito', 4: 'pedito' };
            const peditos = [2, 3];
            const result = countPeditoHits(playerAccusations, peditos);
            expect(result).toBe(2); // Solo 2 y 3, no 4
        });
    });
    
    describe('countPedorroHits', () => {
        const allAccusations = {
            acusation1: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' },
            acusation2: { 1: 'pedorro', 2: 'neutral', 3: 'pedito', 4: 'neutral' },
            acusation3: { 1: 'pedorro', 2: 'pedito', 3: 'neutral', 4: 'pedito' },
            acusation4: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' }
        };
        
        test('debe contar correctamente los aciertos al pedorro', () => {
            const result = countPedorroHits(allAccusations, 1);
            expect(result).toBe(2); // Jugadores 2 y 3 acusaron correctamente
        });
        
        test('debe contar 0 si nadie acierta al pedorro', () => {
            const result = countPedorroHits(allAccusations, 4);
            expect(result).toBe(0);
        });
        
        test('debe manejar entradas inválidas', () => {
            expect(countPedorroHits(null, 1)).toBe(0);
            expect(countPedorroHits(allAccusations, 'invalid')).toBe(0);
        });
        
        test('debe ignorar claves que no empiecen con acusation', () => {
            const mixedAccusations = {
                ...allAccusations,
                otherKey: { 1: 'pedorro' }
            };
            const result = countPedorroHits(mixedAccusations, 1);
            expect(result).toBe(2); // Solo cuenta las acusations válidas
        });
    });
    
    describe('calculatePlayerScore', () => {
        const allAccusations = {
            acusation1: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' },
            acusation2: { 1: 'pedorro', 2: 'neutral', 3: 'pedito', 4: 'neutral' },
            acusation3: { 1: 'pedorro', 2: 'pedito', 3: 'neutral', 4: 'pedito' },
            acusation4: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' }
        };
        const peditos = [2, 3];
        const pedorro = 1;
        
        test('debe calcular puntuación para jugador que no es pedorro', () => {
            const playerAccusations = { 1: 'pedorro', 2: 'pedito', 3: 'pedito', 4: 'neutral' };
            const result = calculatePlayerScore(2, playerAccusations, peditos, pedorro, allAccusations);
            // 2 puntos por peditos (acertó a 2 y 3) + 5 puntos por pedorro (otra persona también acertó)
            expect(result).toBe(7);
        });
        
        test('debe calcular puntuación para pedorro descubierto', () => {
            const playerAccusations = { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' };
            const result = calculatePlayerScore(1, playerAccusations, peditos, pedorro, allAccusations);
            // 2 puntos por peditos (acertó a 2 y 3) + 0 puntos por pedorro (fue descubierto)
            expect(result).toBe(2);
        });
        
        test('debe calcular puntuación para pedorro oculto', () => {
            // Modificar acusaciones para que nadie acierte al pedorro
            const modifiedAccusations = {
                acusation1: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' },
                acusation2: { 1: 'neutral', 2: 'neutral', 3: 'pedito', 4: 'neutral' },
                acusation3: { 1: 'neutral', 2: 'pedito', 3: 'neutral', 4: 'pedito' },
                acusation4: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' }
            };
            const playerAccusations = { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' };
            const result = calculatePlayerScore(1, playerAccusations, peditos, pedorro, modifiedAccusations);
            // 2 puntos por peditos (acertó a 2 y 3) + 10 puntos por pedorro (nadie lo descubrió)
            expect(result).toBe(12);
        });
        
        test('debe calcular puntuación sin bonus de pedorro si solo uno acierta', () => {
            // Modificar acusaciones para que solo el jugador 2 acierte al pedorro
            const modifiedAccusations = {
                acusation1: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' },
                acusation2: { 1: 'pedorro', 2: 'neutral', 3: 'pedito', 4: 'neutral' },
                acusation3: { 1: 'neutral', 2: 'pedito', 3: 'neutral', 4: 'pedito' },
                acusation4: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' }
            };
            const playerAccusations = { 1: 'pedorro', 2: 'neutral', 3: 'pedito', 4: 'neutral' };
            const result = calculatePlayerScore(2, playerAccusations, peditos, pedorro, modifiedAccusations);
            // 1 punto por peditos (acertó a 3) + 0 puntos por pedorro (solo él acertó)
            expect(result).toBe(1);
        });
        
        test('un pedito suma 1 punto si se acusa a sí mismx como pedito', () => {
            const all = {
                acusation1: { 1: 'neutral', 2: 'neutral', 3: 'neutral', 4: 'neutral' },
                acusation2: { 1: 'neutral', 2: 'pedito', 3: 'neutral', 4: 'neutral' },
                acusation3: { 1: 'neutral', 2: 'neutral', 3: 'neutral', 4: 'neutral' },
                acusation4: { 1: 'neutral', 2: 'neutral', 3: 'neutral', 4: 'neutral' }
            };
            const peds = [2, 3];
            const ped = 1;
            // El jugador 2 es pedito y se acusa a sí mismx como pedito → +1
            const score = calculatePlayerScore(2, all.acusation2, peds, ped, all);
            expect(score).toBe(1);
        });
        
        test('un pedito que no se acusa a sí mismx no recibe ese punto', () => {
            const all = {
                acusation1: { 1: 'neutral', 2: 'neutral', 3: 'neutral', 4: 'neutral' },
                acusation2: { 1: 'neutral', 2: 'neutral', 3: 'neutral', 4: 'neutral' },
                acusation3: { 1: 'neutral', 2: 'neutral', 3: 'neutral', 4: 'neutral' },
                acusation4: { 1: 'neutral', 2: 'neutral', 3: 'neutral', 4: 'neutral' }
            };
            const peds = [2, 3];
            const ped = 1;
            const score = calculatePlayerScore(2, all.acusation2, peds, ped, all);
            expect(score).toBe(0);
        });
        
        test('si un pedito se acusa a sí mismx y acierta a otrx pedito, suma 2', () => {
            const all = {
                acusation1: { 1: 'neutral', 2: 'neutral', 3: 'neutral', 4: 'neutral' },
                acusation2: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' },
                acusation3: { 1: 'neutral', 2: 'neutral', 3: 'neutral', 4: 'neutral' },
                acusation4: { 1: 'neutral', 2: 'neutral', 3: 'neutral', 4: 'neutral' }
            };
            const peds = [2, 3];
            const ped = 1;
            const score = calculatePlayerScore(2, all.acusation2, peds, ped, all);
            expect(score).toBe(2);
        });
        
        test('si un pedito se acusa a sí mismx y también acierta al pedorro con colaboración, suma 1+5', () => {
            const all = {
                acusation1: { 1: 'pedorro', 2: 'neutral', 3: 'neutral', 4: 'neutral' },
                acusation2: { 1: 'pedorro', 2: 'pedito', 3: 'neutral', 4: 'neutral' },
                acusation3: { 1: 'pedorro', 2: 'neutral', 3: 'neutral', 4: 'neutral' }, // Jugador 3 también acierta al pedorro
                acusation4: { 1: 'neutral', 2: 'neutral', 3: 'neutral', 4: 'neutral' }
            };
            const peds = [2, 3];
            const ped = 1;
            const score = calculatePlayerScore(2, all.acusation2, peds, ped, all);
            expect(score).toBe(6); // 1 por autopedito + 5 por pedorro (otra persona no-pedorro también acierta)
        });
        
        test('debe manejar entradas inválidas', () => {
            expect(calculatePlayerScore(1, null, peditos, pedorro, allAccusations)).toBe(0);
            expect(calculatePlayerScore(1, { 1: 'pedito' }, null, pedorro, allAccusations)).toBe(0);
            expect(calculatePlayerScore(1, { 1: 'pedito' }, peditos, 'invalid', allAccusations)).toBe(0);
        });
    });
    
    describe('calculateRoundScore', () => {
        const validAccusations = {
            acusation1: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' },
            acusation2: { 1: 'pedorro', 2: 'neutral', 3: 'pedito', 4: 'neutral' },
            acusation3: { 1: 'pedorro', 2: 'pedito', 3: 'neutral', 4: 'pedito' },
            acusation4: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' }
        };
        const validPeditos = [2, 3];
        const validPedorro = 1;
        
        test('debe calcular puntuación completa para todos los jugadores', () => {
            const result = calculateRoundScore(validAccusations, validPeditos, validPedorro);
            
            expect(result).toEqual({
                1: 2,   // Pedorro descubierto: 2 puntos por peditos + 0 por pedorro
                2: 6,   // 1 pedito + 5 por pedorro (otra persona también acertó)
                3: 6,   // 1 pedito + 5 por pedorro (otra persona también acertó)
                4: 2    // 2 peditos
            });
        });
        
        test('debe lanzar error con entradas inválidas', () => {
            expect(() => {
                calculateRoundScore(null, validPeditos, validPedorro);
            }).toThrow('Entradas inválidas para cálculo de puntuación');
            
            expect(() => {
                calculateRoundScore(validAccusations, [1, 2], 1); // Conflicto pedito/pedorro
            }).toThrow('Entradas inválidas para cálculo de puntuación');
        });
        
        test('debe manejar caso donde nadie descubre al pedorro', () => {
            const hiddenPedorroAccusations = {
                acusation1: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' },
                acusation2: { 1: 'neutral', 2: 'neutral', 3: 'pedito', 4: 'neutral' },
                acusation3: { 1: 'neutral', 2: 'pedito', 3: 'neutral', 4: 'pedito' },
                acusation4: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' }
            };
            
            const result = calculateRoundScore(hiddenPedorroAccusations, validPeditos, validPedorro);
            
            expect(result).toEqual({
                1: 12,  // Pedorro oculto: 2 puntos por peditos + 10 por pedorro
                2: 1,   // 1 pedito
                3: 1,   // 1 pedito
                4: 2    // 2 peditos
            });
        });
        
        test('debe manejar caso con solo un acierto al pedorro', () => {
            const singleHitAccusations = {
                acusation1: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' },
                acusation2: { 1: 'pedorro', 2: 'neutral', 3: 'pedito', 4: 'neutral' },
                acusation3: { 1: 'neutral', 2: 'pedito', 3: 'neutral', 4: 'pedito' },
                acusation4: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' }
            };
            
            const result = calculateRoundScore(singleHitAccusations, validPeditos, validPedorro);
            
            expect(result).toEqual({
                1: 2,   // Pedorro descubierto: 2 puntos por peditos + 0 por pedorro
                2: 1,   // 1 pedito + 0 por pedorro (solo él acertó)
                3: 1,   // 1 pedito
                4: 2    // 2 peditos
            });
        });
        
        test('debe manejar caso con múltiples aciertos de peditos', () => {
            const multiplePeditoHits = {
                acusation1: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'neutral' },
                acusation2: { 1: 'pedorro', 2: 'pedito', 3: 'pedito', 4: 'neutral' },
                acusation3: { 1: 'pedorro', 2: 'pedito', 3: 'pedito', 4: 'pedito' },
                acusation4: { 1: 'neutral', 2: 'pedito', 3: 'pedito', 4: 'pedito' }
            };
            
            const result = calculateRoundScore(multiplePeditoHits, validPeditos, validPedorro);
            
            expect(result).toEqual({
                1: 2,   // Pedorro descubierto: 2 puntos por peditos + 0 por pedorro
                2: 7,   // 3 peditos + 0 por pedorro (solo él acertó)
                3: 7,   // 3 peditos + 0 por pedorro (solo él acertó)
                4: 2    // 2 peditos
            });
        });

        test('debe manejar escenario real donde el pedorro se acusa a sí mismo', () => {
            // Escenario: Jugador 1 es pedorro, Jugadores 2 y 3 son peditos
            // Jugador 1 se acusa a sí mismo como pedorro
            // Jugador 2 acusa al jugador 1 como pedorro
            // Jugador 3 acusa al jugador 2 como pedorro (incorrecto)
            // Jugador 4 acusa al jugador 2 como pedorro (incorrecto)
            const realScenario = {
                acusation1: { 1: 'pedorro', 2: 'pedito', 3: 'pedito', 4: 'neutral' }, // Pedorro se acusa a sí mismo
                acusation2: { 1: 'pedorro', 2: 'pedito', 3: 'pedito', 4: 'neutral' }, // Pedito acierta al pedorro
                acusation3: { 1: 'neutral', 2: 'pedorro', 3: 'pedito', 4: 'pedito' }, // Pedito se equivoca
                acusation4: { 1: 'neutral', 2: 'pedorro', 3: 'pedito', 4: 'pedito' }  // Pedito se equivoca
            };
            const peditos = [2, 3];
            const pedorro = 1;
            

            
            const result = calculateRoundScore(realScenario, peditos, pedorro);
            
            expect(result).toEqual({
                1: 2,   // Pedorro: 2 peditos + 0 por pedorro (fue descubierto por jugador 2)
                2: 2,   // Pedito: 1 pedito + 1 por pedorro (acertó, pero no recibe bonus por colaboración)
                3: 1,   // Pedito: 1 pedito + 0 por pedorro (se equivocó)
                4: 1    // Pedito: 1 pedito + 0 por pedorro (se equivocó)
            });
        });

        test('debe manejar escenario de la pregunta del usuario', () => {
            // Escenario de la pregunta:
            // - Jugador 1 es pedorro
            // - Jugadores 2 y 3 son peditos
            // - Jugador 1 indica que él es pedorro y que 2 y 3 son peditos
            // - Jugador 2 indica que el pedorro es el 1 y que 2 y 3 son peditos
            // - Jugador 3 indica que el pedorro es el 2 y que 3 y 4 son peditos
            // - Jugador 4 indica que el pedorro es el 2 y que 3 y 4 son peditos
            const userScenario = {
                acusation1: { 1: 'pedorro', 2: 'pedito', 3: 'pedito', 4: 'neutral' }, // Pedorro se acusa a sí mismo
                acusation2: { 1: 'pedorro', 2: 'pedito', 3: 'pedito', 4: 'neutral' }, // Pedito acierta al pedorro
                acusation3: { 1: 'neutral', 2: 'pedorro', 3: 'pedito', 4: 'pedito' }, // Pedito se equivoca
                acusation4: { 1: 'neutral', 2: 'pedorro', 3: 'pedito', 4: 'pedito' }  // Pedito se equivoca
            };
            const peditos = [2, 3];
            const pedorro = 1;
            
            const result = calculateRoundScore(userScenario, peditos, pedorro);
            
            // Con la nueva lógica corregida:
            // - Jugador 1: 2 puntos por peditos + 0 por pedorro (fue descubierto por jugador 2)
            // - Jugador 2: 1 punto por pedito + 1 por acertar al pedorro (pero NO recibe 5 puntos extra porque solo él acierta)
            // - Jugador 3: 1 punto por pedito + 0 por pedorro (se equivocó)
            // - Jugador 4: 1 punto por pedito + 0 por pedorro (se equivocó)
            expect(result).toEqual({
                1: 2,   // Pedorro descubierto: 2 peditos + 0 por pedorro
                2: 2,   // Pedito: 1 pedito + 1 por pedorro (sin bonus de colaboración)
                3: 1,   // Pedito: 1 pedito + 0 por pedorro
                4: 1    // Pedito: 1 pedito + 0 por pedorro
            });
            
            // Verificar que el jugador 2 NO recibe los 5 puntos extra por colaboración
            // porque solo él (que no es pedorro) acertó al pedorro
            expect(result[2]).toBe(2); // Solo 2 puntos, no 6
        });
    });
});
