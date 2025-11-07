# Azure Vocabulary API

API REST construida con Express y TypeScript que evalúa pronunciación mediante Azure Speech.
Incluye conversión automática de audio MP3 a WAV cuando es necesario y devuelve métricas detalladas
de exactitud, fluidez, prosodia y errores por palabra, sílaba y fonema.
Pensada para integrarse con aplicaciones de aprendizaje de idiomas que requieren análisis en tiempo real.

## Requisitos

- Node.js 18 o superior (probado con Node 22)
- Cuenta de Azure con Speech Service habilitado
- ffmpeg disponible (se instala gracias a `@ffmpeg-installer/ffmpeg`)

## Configuración

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear archivo `.env` en la raíz con las siguientes variables:

   ```env
   AZURE_SPEECH_KEY=tu_clave
   AZURE_SPEECH_REGION=tu_region
   AZURE_SPEECH_LANGUAGE=en-US
   PORT=3000
   ```

3. Levantar el servidor en modo desarrollo:

   ```bash
   npm run dev
   ```

4. Compilar y ejecutar en producción:

   ```bash
   npm run build
   npm start
   ```

## Estructura

```text
src/
├── app.ts                      # Inicialización de Express y wiring de dependencias
├── server.ts                   # Punto de entrada (levanta el servidor)
├── application/
│   ├── dtos/
│   │   └── assessPronunciationDto.ts
│   └── use-cases/
│       └── assessPronunciationUseCase.ts
├── config/
│   └── azureSpeechConfig.ts    # Configuración centralizada de Azure
├── controllers/
│   └── pronunciationController.ts
├── interfaces/
│   └── pronunciationResult.interface.ts
├── middlewares/
│   ├── ensureFile.ts
│   └── validateBody.ts
├── routes/
│   └── pronunciationRoutes.ts
├── services/
│   └── azureSpeechService.ts
└── utils/
    └── convertAudio.ts
```

## Middlewares de validación

- `ensureFile(fieldName)`: Garantiza que el archivo esté presente en la petición.
- `validateBody(DtoClass)`: Valida el cuerpo con `class-validator`, aplica `whitelist` y devuelve errores formateados.

Ambos se aplican en la ruta antes de ejecutar el controlador, lo que permite reutilizar validaciones en otros endpoints.

## Endpoint

`POST /pronunciation/assess`

- Contenido: `multipart/form-data`
- Campos:
  - `sentence` (string, requerido)
  - `language` (string, opcional; se usa `AZURE_SPEECH_LANGUAGE` si no se envía)
  - `file` (archivo, requerido). Si el archivo es MP3 se convierte automáticamente a WAV 16kHz mono.

### Ejemplo con curl

```bash
curl -X POST http://localhost:3000/pronunciation/assess \
  -F "sentence=Hello, how are you?" \
  -F "language=en-US" \
  -F "file=@/ruta/al/audio.mp3"
```

### Respuesta exitosa

```json
{
  "message": "Pronunciación evaluada correctamente",
  "success": true,
  "result": {
    "statistics_sentence": {
      "accuracy_score": 90.4,
      "pronunciation_score": 88.0,
      "completeness_score": 95.5,
      "fluency_score": 84.7,
      "prosody_score": 82.0
    },
    "words": [
      {
        "index": 1,
        "word": "Hello",
        "pronunciation": 92.0,
        "pronunciationAssessment": "None",
        "syllables": [
          {
            "index": 1,
            "syllable": "Hel",
            "accuracyScore": 93.5,
            "errorType": "None",
            "offsetMs": 120,
            "durationMs": 210
          }
        ],
        "phonemes": [
          {
            "index": 1,
            "phoneme": "H",
            "accuracyScore": 95.0,
            "errorType": "None",
            "offsetMs": 120,
            "durationMs": 60
          }
        ]
      }
    ],
    "recognized_text": "Hello, how are you?"
  }
}
```

### Errores comunes

- `400` Archivo faltante: no se envió `file`.
- `400` Validación: `sentence` vacío o campos adicionales no permitidos.
- `500` Azure Speech: errores al comunicarse con el servicio o al convertir el audio.

## Flujo interno

1. La ruta aplica `multer`, valida la presencia del archivo y el cuerpo con los middlewares reutilizables.
2. El controlador convierte el MP3 a WAV si es necesario y delega al caso de uso.
3. El caso de uso invoca al servicio `AzureSpeechService`.
4. El servicio configura Azure Speech, evalúa la pronunciación y formatea el resultado usando las interfaces tipadas.
5. El controlador responde con un JSON consistente (`message`, `success`, `result`).

## Scripts útiles

- `npm run dev`: inicia el servidor con nodemon y soporte ESM.
- `npm run build`: genera la salida compilada en `dist`.
- `npm start`: ejecuta la versión compilada.
- `npm run clean`: elimina la carpeta `dist`.

## Próximos pasos sugeridos

- Añadir pruebas automáticas para el flujo feliz y los errores más comunes.
- Integrar un sistema de logging estructurado.
- Publicar la API detrás de una capa de autenticación si se expone más allá del entorno interno.
