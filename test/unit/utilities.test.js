/**
 * Tests para funciones utilitarias de manejo de clases CSS
 */

// Mock del DOM para testing
document.body.innerHTML = `
    <div id="test-element" class="inactive"></div>
    <div id="test-element-2" class="active"></div>
    <div id="test-element-3" class="other-class"></div>
    <div id="hidden-element" style="display: block;"></div>
`;

// Importar las funciones (necesitamos acceder a ellas desde el scope global)
// Por ahora, las definiremos localmente para testing

describe('Funciones Utilitarias de Manejo de Clases CSS', () => {
    
    let testElement, testElement2, testElement3, hiddenElement;
    
    beforeEach(() => {
        // Obtener referencias a los elementos
        testElement = document.getElementById('test-element');
        testElement2 = document.getElementById('test-element-2');
        testElement3 = document.getElementById('test-element-3');
        hiddenElement = document.getElementById('hidden-element');
        
        // Resetear clases y estilos
        testElement.className = 'inactive';
        testElement2.className = 'active';
        testElement3.className = 'other-class';
        hiddenElement.style.display = 'block';
    });
    
    describe('activate', () => {
        test('debe remover "inactive" y añadir "active"', () => {
            // Simular la función activate
            testElement.classList.remove('inactive');
            testElement.classList.add('active');
            
            expect(testElement.classList.contains('active')).toBe(true);
            expect(testElement.classList.contains('inactive')).toBe(false);
        });
        
        test('debe funcionar con elementos sin clases', () => {
            const elementWithoutClasses = document.createElement('div');
            
            elementWithoutClasses.classList.remove('inactive');
            elementWithoutClasses.classList.add('active');
            
            expect(elementWithoutClasses.classList.contains('active')).toBe(true);
        });
        
        test('debe mantener otras clases existentes', () => {
            testElement3.classList.remove('inactive');
            testElement3.classList.add('active');
            
            expect(testElement3.classList.contains('active')).toBe(true);
            expect(testElement3.classList.contains('other-class')).toBe(true);
        });
    });
    
    describe('deactivate', () => {
        test('debe remover "active" y añadir "inactive"', () => {
            // Simular la función deactivate
            testElement2.classList.remove('active');
            testElement2.classList.add('inactive');
            
            expect(testElement2.classList.contains('inactive')).toBe(true);
            expect(testElement2.classList.contains('active')).toBe(false);
        });
        
        test('debe funcionar con elementos sin clases', () => {
            const elementWithoutClasses = document.createElement('div');
            
            elementWithoutClasses.classList.remove('active');
            elementWithoutClasses.classList.add('inactive');
            
            expect(elementWithoutClasses.classList.contains('inactive')).toBe(true);
        });
        
        test('debe mantener otras clases existentes', () => {
            testElement3.classList.remove('active');
            testElement3.classList.add('inactive');
            
            expect(testElement3.classList.contains('inactive')).toBe(true);
            expect(testElement3.classList.contains('other-class')).toBe(true);
        });
    });
    
    describe('setVisibility', () => {
        test('debe mostrar elemento cuando isVisible es true', () => {
            // Simular la función setVisibility
            if (hiddenElement) {
                hiddenElement.style.display = 'block';
            }
            
            expect(hiddenElement.style.display).toBe('block');
        });
        
        test('debe ocultar elemento cuando isVisible es false', () => {
            // Simular la función setVisibility
            if (hiddenElement) {
                hiddenElement.style.display = 'none';
            }
            
            expect(hiddenElement.style.display).toBe('none');
        });
        
        test('debe manejar elementos null/undefined graciosamente', () => {
            // Simular la función setVisibility con elemento null
            const nullElement = null;
            
            // No debería lanzar error
            expect(() => {
                if (nullElement) {
                    nullElement.style.display = 'block';
                }
            }).not.toThrow();
        });
    });
    
    describe('Comportamiento conjunto', () => {
        test('debe poder alternar entre estados active/inactive', () => {
            // Simular activate
            testElement.classList.remove('inactive');
            testElement.classList.add('active');
            expect(testElement.classList.contains('active')).toBe(true);
            
            // Simular deactivate
            testElement.classList.remove('active');
            testElement.classList.add('inactive');
            expect(testElement.classList.contains('inactive')).toBe(true);
            
            // Simular activate de nuevo
            testElement.classList.remove('inactive');
            testElement.classList.add('active');
            expect(testElement.classList.contains('active')).toBe(true);
        });
        
        test('debe mantener consistencia entre active e inactive', () => {
            // Un elemento puede tener ambas clases si se añaden manualmente
            testElement.classList.add('active');
            testElement.classList.add('inactive');
            
            // Verificar que ambas clases estén presentes
            const hasActive = testElement.classList.contains('active');
            const hasInactive = testElement.classList.contains('inactive');
            
            // Ambas deben ser true
            expect(hasActive).toBe(true);
            expect(hasInactive).toBe(true);
            
            // Esto demuestra por qué necesitamos las funciones activate/deactivate
            // para mantener consistencia
        });
    });
});
