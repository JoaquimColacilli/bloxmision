# BloxMision

Plataforma educativa de programación visual (bloques) para niños de 8+ años.  
Aprenden secuencias, bucles y condicionales resolviendo desafíos de lógica en un entorno drag & drop.

## Features
- Editor de bloques + área de código
- Niveles por “mundos” (progresión guiada)
- Progreso por usuario (XP, racha, badges)
- Persistencia en la nube (Firestore) y login (Firebase Auth)

## Stack
- **React 18 + Vite**
- **TypeScript**
- **Tailwind CSS**
- **Firebase Authentication**
- **Firestore**
- **Firebase Hosting**

## Arquitectura (Spark plan friendly)
Este proyecto es **100% client-side** (sin Cloud Functions) para mantenerse en el plan gratuito (Spark).

- **Validación**: se ejecuta en cliente (motor/validador de bloques).
- **Seguridad real**: la asegura **Firestore Security Rules** (control de escritura, progresos inmutables, etc).

> Nota: la validación en cliente es inspeccionable. Para este caso de uso (educativo/infantil) es un trade-off aceptable a cambio de costo $0.

## Requisitos
- Node.js 18+
- npm (o yarn/pnpm)
- Firebase project configurado

## Configuración de entorno
1) Crear un archivo `.env.local` en la raíz (no se versiona).  
2) Usar este template:

# Firebase (Vite)
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
Recomendado: mantener un .env.example en el repo con estas mismas keys “placeholder”.

# Instalación

npm install
Desarrollo

npm run dev
App: http://localhost::3000

Build

npm run build
npm run preview
Deploy (Firebase Hosting)

npm install -g firebase-tools
firebase login
firebase deploy

# Estructura del proyecto

src/
  components/        UI y componentes del juego
  contexts/          Contextos (Auth, Academy, etc.)
  hooks/             Custom hooks
  lib/
    game/            Motor/validador de bloques
    services/        Servicios (progreso, xp, racha, badges)
    firebase*.ts     Firebase setup / wrappers
  pages/             Rutas (React Router)
  types/             Tipos compartidos
Firestore (modelo general)
Colecciones principales:

users (perfil + estado de progreso)

levels (niveles / contenido)

progress (intentos y completados, inmutable)

Ver el detalle en el código y reglas de seguridad.

Security Rules
Las reglas están en firestore.rules. Puntos clave:

users: solo el dueño puede escribir/leer sus datos

progress: create-only (sin update/delete)

levels: solo lectura

Contribuir
Branch: feature/...

Commits claros y chicos

Mantener TypeScript strict + lint sin warnings
EOF
