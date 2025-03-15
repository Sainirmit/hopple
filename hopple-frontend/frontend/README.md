# Hopple Frontend

This is the frontend for the Hopple application, built with Next.js.

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: use nvm to manage Node versions)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd hopple-frontend/frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Testing

To run tests:

```bash
npm test
# or
yarn test
```

To run tests in watch mode:

```bash
npm run test:watch
# or
yarn test:watch
```

### Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm run start
# or
yarn start
```

## API Routes

The frontend includes API routes that proxy requests to the backend:

- `/api/auth` - Authentication endpoints
- `/api/projects` - Project management endpoints
- `/api/projects/[id]/tasks` - Task management endpoints
- `/api/agents` - AI agent endpoints

## Backend Integration

The frontend is configured to communicate with the backend running on `http://localhost:8000`. Make sure the backend server is running before using the frontend.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

- `app/` - Next.js app directory
  - `api/` - API routes
  - `components/` - UI components
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions
  - `types/` - TypeScript type definitions
- `public/` - Static assets
- `styles/` - Global styles

## Contributing

Please follow the project's coding standards and commit message conventions.
