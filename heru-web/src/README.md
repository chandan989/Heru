# Heru Source Code 📂

This directory contains the core source code for the Heru Frontend application.

## 📁 Directory Structure

```
src/
├── components/      # Reusable UI components
├── pages/           # Page-level components
├── services/        # Business logic & API integration
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── assets/          # Static assets (images, fonts, etc.)
├── api/             # API client configuration
├── App.tsx          # Root application component
├── main.tsx         # Application entry point
└── index.css        # Global styles
```

## 🧩 Components

The `components/` directory contains all reusable UI components:
- **ui/**: shadcn/ui component library (buttons, cards, dialogs, etc.)
- **Custom Components**: Application-specific components like dashboards, scanners, and visualizations

See [components/README.md](./components/README.md) for detailed documentation.

## 📄 Pages

The `pages/` directory contains page-level components that represent different routes:
- **Dashboard.tsx**: Main analytics and monitoring dashboard
- **Verification.tsx**: Medicine verification interface
- **IoTMonitoringPage.tsx**: Real-time IoT sensor monitoring
- **ShipmentDetails.tsx**: Detailed shipment information
- **DivineSeal.tsx**: Blockchain verification and sealing

See [pages/README.md](./pages/README.md) for detailed documentation.

## 🔧 Services

The `services/` directory contains business logic and external integrations:
- **Hedera Integration**: Blockchain transaction services
- **Wallet Services**: Wallet connection and management
- **Database Services**: Backend API communication
- **IoT Services**: Sensor data processing
- **Smart Contract Services**: Contract interaction logic

See [services/README.md](./services/README.md) for detailed documentation.

## 🪝 Hooks

Custom React hooks for shared functionality:
- **useWallet**: Wallet connection state management
- **useToast**: Toast notification system
- Additional hooks as needed

## 📚 Lib

Utility functions and helpers:
- **utils.ts**: General utility functions
- Type definitions and constants

## 🎨 Styling

- **index.css**: Global styles, CSS variables, and Tailwind configuration
- **App.css**: Application-specific styles

## 🚀 Getting Started

To work with the source code:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## 🏗️ Architecture Patterns

### Component Structure
```typescript
// Example component structure
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const MyComponent = () => {
  const [state, setState] = useState();
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

### Service Pattern
```typescript
// Example service structure
export class MyService {
  async fetchData() {
    // API call logic
  }
  
  async processData(data: any) {
    // Business logic
  }
}
```

## 🔒 Type Safety

All code is written in TypeScript for maximum type safety:
- Strict type checking enabled
- Interface definitions for all data structures
- Type-safe API calls
- Comprehensive error handling

## 📝 Code Style

- **ESLint**: Configured for React and TypeScript
- **Prettier**: Code formatting (if configured)
- **Component Naming**: PascalCase for components
- **File Naming**: PascalCase for component files, camelCase for utilities

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test
```

## 📖 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

**Note**: This is a living codebase. Always refer to inline comments and type definitions for the most up-to-date documentation.
