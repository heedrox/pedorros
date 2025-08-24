/**
 * Tests unitarios para funcionalidad DISIMULAR
 * Prueba las funciones core de lógica de sonidos y roles
 */

import { 
    getPlayerRole, 
    determineSoundForPlayer,
    handleDisimularClick 
} from '../../web/lib.js';

describe('Funcionalidad DISIMULAR - Core Functions', () => {
    
    describe('getPlayerRole', () => {
        test('debe retornar "pedito" si el jugador está en el array de peditos', () => {
            const peditos = [1, 3, 5];
            const pedorro = 2;
            const playerNumber = 3;
            
            const result = getPlayerRole(peditos, pedorro, playerNumber);
            expect(result).toBe('pedito');
        });
        
        test('debe retornar "pedorro" si el jugador es el pedorro', () => {
            const peditos = [1, 3, 5];
            const pedorro = 2;
            const playerNumber = 2;
            
            const result = getPlayerRole(peditos, pedorro, playerNumber);
            expect(result).toBe('pedorro');
        });
        
        test('debe retornar "neutral" si el jugador no es ni pedito ni pedorro', () => {
            const peditos = [1, 3, 5];
            const pedorro = 2;
            const playerNumber = 4;
            
            const result = getPlayerRole(peditos, pedorro, playerNumber);
            expect(result).toBe('neutral');
        });
        
        test('debe retornar "neutral" si los parámetros son inválidos', () => {
            expect(getPlayerRole(null, 2, 1)).toBe('neutral');
            expect(getPlayerRole([1, 2], null, 1)).toBe('neutral');
            expect(getPlayerRole([1, 2], 3, null)).toBe('neutral');
            expect(getPlayerRole('invalid', 2, 1)).toBe('neutral');
            expect(getPlayerRole([1, 2], 'invalid', 1)).toBe('neutral');
            expect(getPlayerRole([1, 2], 3, 'invalid')).toBe('neutral');
        });
        
        test('debe retornar "neutral" si el array de peditos está vacío', () => {
            const peditos = [];
            const pedorro = 1;
            const playerNumber = 1;
            
            const result = getPlayerRole(peditos, pedorro, playerNumber);
            expect(result).toBe('pedorro'); // Si peditos está vacío y pedorro es 1, el jugador 1 es pedorro
        });
        
        test('debe retornar "neutral" si el array de peditos está vacío y el jugador no es pedorro', () => {
            const peditos = [];
            const pedorro = 1;
            const playerNumber = 2;
            
            const result = getPlayerRole(peditos, pedorro, playerNumber);
            expect(result).toBe('neutral');
        });
    });
    
    describe('determineSoundForPlayer', () => {
        test('debe retornar "neutral.mp3" si nextSounds[jugador] es null', () => {
            const nextSounds = { 1: null, 2: 3, 3: 1 };
            const peditos = [2, 3];
            const pedorro = 1;
            const playerNumber = 1;
            
            const result = determineSoundForPlayer(nextSounds, peditos, pedorro, playerNumber);
            expect(result).toBe('neutral.mp3');
        });
        
        test('debe retornar "pedito-X.mp3" si el jugador es pedito y tiene número X', () => {
            const nextSounds = { 1: 2, 2: 3, 3: 1 };
            const peditos = [2, 3];
            const pedorro = 1;
            const playerNumber = 2;
            
            const result = determineSoundForPlayer(nextSounds, peditos, pedorro, playerNumber);
            expect(result).toBe('pedito-3.mp3');
        });
        
        test('debe retornar "pedorro-X.mp3" si el jugador es pedorro y tiene número X', () => {
            const nextSounds = { 1: 2, 2: 3, 3: 1 };
            const peditos = [2, 3];
            const pedorro = 1;
            const playerNumber = 1;
            
            const result = determineSoundForPlayer(nextSounds, peditos, pedorro, playerNumber);
            expect(result).toBe('pedorro-2.mp3');
        });
        
        test('debe retornar "neutral.mp3" si el jugador no tiene rol definido', () => {
            const nextSounds = { 1: 2, 2: 3, 3: 1 };
            const peditos = [2, 3];
            const pedorro = 1;
            const playerNumber = 4;
            
            const result = determineSoundForPlayer(nextSounds, peditos, pedorro, playerNumber);
            expect(result).toBe('neutral.mp3');
        });
        
        test('debe retornar "neutral.mp3" si nextSounds[jugador] está fuera del rango 1-5', () => {
            const nextSounds = { 1: 6, 2: 0, 3: -1 };
            const peditos = [1, 2, 3];
            const pedorro = 4;
            
            expect(determineSoundForPlayer(nextSounds, peditos, pedorro, 1)).toBe('neutral.mp3');
            expect(determineSoundForPlayer(nextSounds, peditos, pedorro, 2)).toBe('neutral.mp3');
            expect(determineSoundForPlayer(nextSounds, peditos, pedorro, 3)).toBe('neutral.mp3');
        });
        
        test('debe retornar "neutral.mp3" si los parámetros son inválidos', () => {
            expect(determineSoundForPlayer(null, [1], 2, 1)).toBe('neutral.mp3');
            expect(determineSoundForPlayer({1: 1}, null, 2, 1)).toBe('neutral.mp3');
            expect(determineSoundForPlayer({1: 1}, [1], null, 1)).toBe('neutral.mp3');
            expect(determineSoundForPlayer({1: 1}, [1], 2, null)).toBe('neutral.mp3');
        });
        
        test('debe manejar casos edge con diferentes tipos de datos', () => {
            const nextSounds = { 1: 'invalid', 2: true, 3: undefined };
            const peditos = [1, 2, 3];
            const pedorro = 4;
            
            expect(determineSoundForPlayer(nextSounds, peditos, pedorro, 1)).toBe('neutral.mp3');
            expect(determineSoundForPlayer(nextSounds, peditos, pedorro, 2)).toBe('neutral.mp3');
            expect(determineSoundForPlayer(nextSounds, peditos, pedorro, 3)).toBe('neutral.mp3');
        });
    });
    
    describe('handleDisimularClick', () => {
        test('debe retornar nuevo estado con flag isDisimulando en true', () => {
            const gameState = {
                state: 'START',
                round: 1,
                gameCode: 'test',
                playerNumber: 1,
                totalPlayers: 4
            };
            
            const result = handleDisimularClick(gameState);
            
            expect(result).not.toBe(gameState); // Debe ser un nuevo objeto
            expect(result.isDisimulando).toBe(true);
            expect(result.state).toBe('START');
            expect(result.round).toBe(1);
            expect(result.gameCode).toBe('test');
            expect(result.playerNumber).toBe(1);
            expect(result.totalPlayers).toBe(4);
        });
        
        test('debe mantener inmutabilidad del estado original', () => {
            const gameState = {
                state: 'START',
                round: 1,
                gameCode: 'test',
                playerNumber: 1,
                totalPlayers: 4
            };
            
            const originalState = { ...gameState };
            const result = handleDisimularClick(gameState);
            
            // El estado original no debe cambiar
            expect(gameState).toEqual(originalState);
            expect(gameState.isDisimulando).toBeUndefined();
            
            // El resultado debe ser un nuevo objeto
            expect(result).not.toBe(gameState);
        });
        
        test('debe funcionar con diferentes tipos de estado', () => {
            const gameState1 = {
                state: 'ACUSE',
                round: 3,
                gameCode: 'galerna',
                playerNumber: 2,
                totalPlayers: 6
            };
            
            const result1 = handleDisimularClick(gameState1);
            expect(result1.isDisimulando).toBe(true);
            expect(result1.state).toBe('ACUSE');
            expect(result1.round).toBe(3);
            
            const gameState2 = {
                state: 'RESULTS',
                round: 5,
                gameCode: 'fiesta',
                playerNumber: 4,
                totalPlayers: 8
            };
            
            const result2 = handleDisimularClick(gameState2);
            expect(result2.isDisimulando).toBe(true);
            expect(result2.state).toBe('RESULTS');
            expect(result2.round).toBe(5);
        });
    });
});
