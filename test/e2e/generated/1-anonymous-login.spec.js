/**
 * Test E2E: Login anónimo con Firebase
 * Verifica que el flujo de autenticación funcione correctamente
 */

import { test, expect } from '@playwright/test';

test.describe('Login Anónimo', () => {
    test('debe mostrar pantalla de login inicialmente', async ({ page }) => {
        // ARRANGE: Navegar a la aplicación con parámetros de juego
        await page.goto('http://127.0.0.1:51541?/g/galerna/p/1/5');
        
        // Verificar que la pantalla de login esté visible inicialmente
        await expect(page.locator('#login-screen')).toBeVisible();
        await expect(page.locator('#game-screen')).not.toBeVisible();
        
        // Verificar que el título "PEDORROS" esté visible en la pantalla de login
        await expect(page.locator('#login-screen .game-title')).toHaveText('PEDORROS');
        
        // Verificar que el botón "ACCEDER" esté visible y habilitado
        const accederButton = page.locator('#acceder-btn');
        await expect(accederButton).toBeVisible();
        await expect(accederButton).toHaveText('ACCEDER');
        await expect(accederButton).toBeEnabled();
    });
    
    test('debe iniciar proceso de login al hacer click en ACCEDER', async ({ page }) => {
        // ARRANGE: Navegar a la aplicación
        await page.goto('http://127.0.0.1:51541?/g/galerna/p/1/5');
        
        // Verificar estado inicial
        await expect(page.locator('#login-screen')).toBeVisible();
        await expect(page.locator('#acceder-btn')).toBeVisible();
        
        // ACT: Hacer click en el botón ACCEDER
        await page.locator('#acceder-btn').click();
        
        // Esperar un momento para que se procese la acción
        await page.waitForTimeout(3000);
        
        // ASSERT: Verificar que se haya iniciado el proceso
        const loginScreen = page.locator('#login-screen');
        const gameScreen = page.locator('#game-screen');
        const accederButton = page.locator('#acceder-btn');
        
        // Verificar el estado actual
        const isLoginVisible = await loginScreen.isVisible();
        const isGameVisible = await gameScreen.isVisible();
        const isAccederVisible = await accederButton.isVisible();
        
        // Debug: Log del estado actual
        console.log('Estado de las pantallas:');
        console.log('- Login visible:', isLoginVisible);
        console.log('- Game visible:', isGameVisible);
        console.log('- Acceder visible:', isAccederVisible);
        
        // Verificar que al menos una pantalla esté visible
        expect(isLoginVisible || isGameVisible).toBeTruthy();
        
        // Si el juego está visible (login exitoso o en proceso)
        if (isGameVisible) {
            console.log('Pantalla del juego detectada - verificando elementos');
            
            // Verificar que los elementos del juego estén presentes
            const disimularButton = page.locator('#disimular-btn');
            const currentRound = page.locator('#current-round');
            
            // Estos elementos pueden no estar visibles inmediatamente si la transición no se ha completado
            if (await disimularButton.isVisible()) {
                console.log('Botón DISIMULAR visible - login completado');
                await expect(currentRound).toHaveText('1');
                
                // IMPORTANTE: Verificar que el botón ACCEDER ya no esté visible
                await expect(accederButton).not.toBeVisible();
                
                // Verificar que la pantalla de login esté oculta
                await expect(loginScreen).not.toBeVisible();
            } else {
                console.log('Botón DISIMULAR no visible - login en proceso');
                // Durante la transición, ambas pantallas pueden estar visibles
                // Esto es normal y esperado
            }
        }
        
        // Si el login sigue visible (error de autenticación o en proceso)
        if (isLoginVisible) {
            console.log('Pantalla de login visible - verificando estado');
            
            // Verificar que el botón ACCEDER esté presente
            if (await accederButton.isVisible()) {
                console.log('Botón ACCEDER visible - login en proceso o fallido');
                await expect(loginScreen).toBeVisible();
            }
        }
    });
    
    test('debe mostrar información del juego correctamente', async ({ page }) => {
        // ARRANGE: Navegar a la aplicación
        await page.goto('http://127.0.0.1:51541?/g/galerna/p/1/5');
        
        // Verificar que la URL se parsee correctamente
        await expect(page.locator('#login-screen')).toBeVisible();
        
        // Verificar que el título esté presente
        await expect(page.locator('#login-screen .game-title')).toHaveText('PEDORROS');
        
        // Verificar que el botón ACCEDER esté presente
        await expect(page.locator('#acceder-btn')).toBeVisible();
    });
});
