# PEDORROS - Product Brief

## Resumen del Proyecto

PEDORROS es una aplicación móvil de fiesta multijugador que simula un juego de detective social. Los jugadores deben identificar quién ha sido el "pedorro" (el que se ha echado un pedo) y quiénes han sido los "peditos" (pedos menores) basándose únicamente en los sonidos reproducidos por la aplicación.

## Audiencia Objetivo

- **Jugadores de fiesta**: Personas que buscan entretenimiento grupal divertido y casual
- **Grupos de amigos**: Ideal para reuniones sociales, fiestas, o momentos de ocio
- **Edad**: Adolescentes y adultos que aprecian el humor irreverente
- **Tamaño de grupo**: 4-16 jugadores

## Beneficios y Características Principales

### Core Gameplay
- **Juego de deducción social**: Combina elementos de misterio con interacción social
- **Mecánica única**: Uso de sonidos para crear pistas auditivas
- **Competitivo y colaborativo**: Sistema de puntuación que premia tanto la habilidad individual como la colaboración grupal
- **Sin preparación**: Solo requiere móviles y la aplicación
- **Distribución variable**: El número de peditos y jugadores neutrales varía según el total de participantes

### Experiencia de Usuario
- **Interfaz intuitiva**: Estados claros y transiciones fluidas entre fases del juego
- **Sincronización en tiempo real**: Todos los jugadores experimentan el juego simultáneamente
- **Liderazgo distribuido**: El jugador 1 actúa como director de juego mientras participa
- **Identificación numérica**: Los jugadores se identifican con números del 1 al total de participantes
- **Sin límite de tiempo**: Las acusaciones no tienen restricción temporal
- **Paleta de colores**: Tonos marrones como tema principal de la aplicación
- **Control del director**: Botón "REINICIAR" en zona superior derecha para reiniciar el juego en cualquier momento

### Sistema de Puntuación
- Puntos por acertar peditos individuales
- Puntos por acertar al pedorro (requiere colaboración grupal)
- Bonificación para pedorros que evitan ser descubiertos
- Ranking visible entre rondas

## Tecnología y Arquitectura

### Stack Tecnológico
- **Frontend**: Aplicación web con JavaScript vanilla
- **Base de datos**: Firebase Realtime Database para sincronización en tiempo real
- **Hosting**: Firebase Hosting para despliegue
- **Backend**: Sin servidor tradicional - lógica distribuida en el frontend

### Arquitectura de Alto Nivel
- **Arquitectura peer-to-peer**: Los dispositivos se comunican a través de Firebase
- **Jugador maestro**: El jugador 1 coordina los cambios de estado y cálculos centralizados
- **Sincronización en tiempo real**: Todos los dispositivos reflejan el mismo estado del juego
- **Estados del juego**: START → ACUSE → RESULTS → START (ciclo de 5 rondas)

### Estados del Juego
1. **START**: Configuración de ronda y botón "DISIMULAR"
2. **ACUSE**: Selección de jugadores y votación
3. **RESULTS**: Puntuaciones y ranking
4. **Ciclo**: Retorno a START para siguiente ronda

**Nota**: El botón "DISIMULAR" no cambia el estado de la base de datos. Es una acción local que cada jugador ejecuta simultáneamente, iniciando un contador de 5 segundos en cada dispositivo y reproduciendo los sonidos correspondientes.

### Distribución de Roles por Número de Jugadores
| Jugadores | Peditos | Pedorros | Neutrales |
|-----------|---------|----------|-----------|
| 4         | 2       | 1        | 1         |
| 5         | 2       | 1        | 2         |
| 6         | 3       | 1        | 2         |
| 7         | 4       | 1        | 2         |
| 8         | 4       | 1        | 3         |
| 9         | 5       | 1        | 3         |
| 10        | 6       | 1        | 3         |
| 11        | 6       | 1        | 4         |
| 12        | 7       | 1        | 4         |
| 13        | 8       | 1        | 4         |
| 14        | 8       | 1        | 5         |
| 15        | 9       | 1        | 5         |
| 16        | 10      | 1        | 5         |

## Requisitos Técnicos

- **Responsive design**: Optimizado para dispositivos móviles
- **Audio**: Reproducción de múltiples tipos de sonidos
- **Tiempo real**: Sincronización instantánea entre dispositivos
- **Online only**: Requiere conexión a internet para funcionar
- **Cross-platform**: Funciona en cualquier navegador móvil moderno

### Sistema de Audio
- **Variedad de sonidos**: Diferentes tipos de pedos para pedorros y peditos
- **Sincronización local**: Los sonidos se reproducen automáticamente tras 5 segundos de pulsar "DISIMULAR" en cada dispositivo
- **Distribución aleatoria**: Los roles se asignan aleatoriamente cada ronda
- **Sonidos diferenciados**: El pedorro tiene sonidos claramente distintos a los peditos

## Métricas de Éxito

- **Engagement**: Tiempo de juego por sesión
- **Retención**: Jugadores que completan las 5 rondas
- **Satisfacción**: Feedback de usuarios sobre la experiencia
- **Viralidad**: Compartir la aplicación con otros grupos
