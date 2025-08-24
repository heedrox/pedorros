module.exports = {
    // Directorio donde Jest buscará los tests
    testMatch: [
        '**/test/**/*.test.js'
    ],
    
    // Directorio donde se guardarán los reports de coverage
    coverageDirectory: 'coverage',
    
    // Archivos que se deben ignorar en coverage
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/test/'
    ],
    
    // Configuración del entorno de testing
    testEnvironment: 'jsdom',
    
    // Transformar archivos .js
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    
    // Setup files si son necesarios
    setupFilesAfterEnv: [],
    
    // Timeout para tests individuales (en ms)
    testTimeout: 5000,
    
    // Verbose output
    verbose: true,
    
    // Configuración adicional
    // colors: true, // Opción no válida en Jest
    
    // Configuración de reporters
    reporters: [
        'default',
        ['jest-junit', {
            outputDirectory: 'coverage',
            outputName: 'junit.xml',
            classNameTemplate: '{classname}',
            titleTemplate: '{title}',
            ancestorSeparator: ' › ',
            usePathForSuiteName: true
        }]
    ]
};
