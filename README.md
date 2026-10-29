# AutoTyper

**Manual de funcionamiento**

Extensión de Chrome (Manifest V3) que automatiza la escritura en TypingClub mediante cuatro modos de velocidad dinámica: Bajo, Medio, Alto y Sobrehumano.

## Índice

- [Instalación](#instalación)
- [Manual de funcionamiento](#manual-de-funcionamiento)
  - [1. ¿Qué es Autotyper?](#1-qué-es-autotyper)
  - [2. Compatibilidad](#2-compatibilidad)
  - [3. Cómo utilizarla](#3-cómo-utilizarla)
  - [4. Modos de velocidad](#4-modos-de-velocidad)
  - [5. Durante la ejecución](#5-durante-la-ejecución)
  - [6. Problemas frecuentes](#6-problemas-frecuentes)
- [Estructura del repositorio](#estructura-del-repositorio)

## Instalación

Autotyper no está publicada en la Chrome Web Store: se instala en modo desarrollador directamente desde este repositorio.

1. Clona o descarga este repositorio.
2. Abre `chrome://extensions` en Chrome.
3. Activa **Modo de desarrollador** (interruptor arriba a la derecha).
4. Pulsa **Cargar descomprimida** y selecciona la carpeta del repositorio.
5. El icono de Autotyper aparecerá en la barra de extensiones.

> Requiere Chrome 111 o superior.

## Manual de funcionamiento

### 1. ¿Qué es Autotyper?

Autotyper es una extensión de Chrome diseñada exclusivamente para TypingClub. Automatiza la escritura en las pruebas de nivel mediante cuatro modos de velocidad: Bajo, Medio, Alto y Sobrehumano.

### 2. Compatibilidad

La extensión solo funciona en las pruebas de escritura. No funciona durante las introducciones de los niveles ni en los minijuegos.

![Ventana no compatible](screenshots/no-compatible.png)

![Prueba de escritura compatible](screenshots/compatible.png)

### 3. Cómo utilizarla

1. Abre una prueba de escritura en TypingClub.
2. Haz clic en el icono de Autotyper.
3. Selecciona uno de los cuatro modos de velocidad.
4. Después de seleccionar el modo, aparecerá el indicador:
   - **«NO»**: el script no puede ejecutarse en esa ventana.
   - **Verde**: el script puede ejecutarse y comienza la escritura automática.

![Selección de los modos de velocidad](screenshots/seleccion-modos.png)

![Indicador «NO»](screenshots/indicador-no.png)

![Indicador verde](screenshots/indicador-verde.png)

### 4. Modos de velocidad

Autotyper utiliza rangos de velocidad en lugar de mantener un ritmo fijo. El objetivo es evitar una escritura demasiado constante y mecánica, proporcionando variaciones que den la sensación de un usuario real y hagan menos evidente que la escritura está automatizada.

| Modo | Velocidades combinadas |
|---|---|
| Bajo | Bajo y Medio |
| Medio | Bajo, Medio y Alto |
| Alto | Medio y Alto |
| Sobrehumano | Alto y Sobrehumano |

Cada modo mantiene una intensidad acorde con su categoría, variando el ritmo durante la ejecución.

### 5. Durante la ejecución

Puedes utilizar otras ventanas del navegador mientras el script funciona. No escribas manualmente en la ventana de TypingClub donde está activo, ya que podrías interferir con la automatización.

### 6. Problemas frecuentes

- **Aparece «NO»**: la ventana actual no es compatible.
- **El script no comienza**: comprueba el indicador y el modo seleccionado.
- **La escritura se altera**: evita introducir texto manualmente durante la ejecución.

## Estructura del repositorio

```
.
├── manifest.json     # Configuración de la extensión (Manifest V3)
├── background.js     # Detecta el marco de la lección y lanza el script de escritura
├── velocidad.html    # Popup que se abre al pulsar el icono
├── velocidad.css     # Estilos de la barra de selección de velocidad
└── velocidad.js       # Previsualización de niveles y envío de la orden de ejecución
```
