
# MedAI Platform

A React-based medical AI platform providing features like patient analysis, disease prediction, and drug recommendations.

## Features

- 🔒 Secure authentication system
- 👤 Patient analysis with genetic profiles
- 🔬 Disease prediction based on patient data
- 💊 AI-powered drug recommendations
- 🧬 Drug discovery with molecular analysis
- 📊 Side effects analysis

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui Components
- React Router DOM
- Recharts for data visualization

## Prerequisites

- Node.js (v18 or later)
- npm or yarn

## Installation

```bash
# Clone this repository
git clone <repository-url>

# Navigate to project directory
cd medai-platform

# Install dependencies
npm install

# Start the development server
npm run dev
```

## API Keys Setup

This application uses the Groq AI API for generating medical recommendations and analysis.

### Production Configuration:

For production deployments, API keys should always be stored in server-side environment variables:

1. Create a server middleware or backend API to proxy requests to the Groq API
2. Store your Groq API key in server-side environment variables (e.g., .env file that's not committed to version control)
3. Create API endpoints that your frontend can call without exposing the API key

Example server-side .env file:
```
GROQ_API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here
```

### Development Configuration:

For local development:

1. Create a `.env.local` file in the project root (do not commit this to version control)
2. Add your API key: `VITE_GROQ_API_KEY=your_api_key_here`
3. In your code, access it via `import.meta.env.VITE_GROQ_API_KEY`

### Demo Configuration:

The demo version uses a placeholder API key for demonstration purposes only.

## Server-Side Implementation

In a production environment, you should implement:

1. A secure backend service that stores API keys in environment variables
2. Proper authentication and session management
3. API endpoint proxying to keep sensitive keys secure

## Demo Credentials

For testing purposes, you can use these demo credentials:

- Email: `demo@example.com`
- Password: `password123`

## Project Structure

- `src/`
  - `components/`: Reusable UI components
  - `config/`: Configuration settings
  - `hooks/`: Custom React hooks
  - `lib/`: Utility functions
  - `pages/`: Main application pages
  - `utils/`: Helper utilities including API services

## Security Notes

- This demo uses localStorage for authentication. In a production environment, use a proper authentication system with JWT or similar.
- Never expose API keys in client-side code in production. Always use server-side environment variables and proxy your API requests.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
