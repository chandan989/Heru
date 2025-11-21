# Heru Components 🧩

This directory contains all React components used throughout the Heru application.

## 📁 Directory Structure

```
components/
├── ui/                          # shadcn/ui component library
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ... (49 components)
├── ArchitectureDemo.tsx         # System architecture visualization
├── DatabaseDashboard.tsx        # Database monitoring dashboard
├── ErrorBoundary.tsx            # Error handling wrapper
├── IntegrationTestDashboard.tsx # Integration testing interface
├── IoTDashboard.tsx             # IoT sensor monitoring
├── LiveDashboard.tsx            # Real-time data dashboard
├── MedicineFlowDashboard.tsx    # Medicine supply chain flow
├── ModernWalletConnect.tsx      # Wallet connection UI
├── Navigation.tsx               # App navigation component
├── QRScanner.tsx                # QR code scanning
├── SacredVaultDashboard.tsx     # Blockchain vault interface
├── SimpleWalletConnector.tsx    # Basic wallet connector
├── SmartContractDashboard.tsx   # Smart contract interaction
├── StoragePerformanceDashboard.tsx # Storage analytics
├── SystemStatusChecker.tsx      # System health monitoring
├── TransactionScanner.tsx       # Blockchain transaction viewer
├── WalletConnector.tsx          # Wallet integration
├── WalletTransactionNotice.tsx  # Transaction notifications
└── WelcomePage.tsx              # Landing/welcome screen
```

## 🎨 UI Components (shadcn/ui)

The `ui/` directory contains 49 high-quality, accessible components from shadcn/ui:

### Layout Components
- **Card**: Container for content sections
- **Separator**: Visual divider
- **Scroll Area**: Scrollable content container
- **Resizable**: Resizable panels

### Form Components
- **Button**: Interactive buttons with variants
- **Input**: Text input fields
- **Textarea**: Multi-line text input
- **Select**: Dropdown selection
- **Checkbox**: Boolean input
- **Radio Group**: Single selection from options
- **Switch**: Toggle switch
- **Slider**: Range input
- **Label**: Form field labels

### Navigation Components
- **Navigation Menu**: Main navigation
- **Menubar**: Menu bar
- **Dropdown Menu**: Contextual menus
- **Context Menu**: Right-click menus
- **Tabs**: Tabbed interface
- **Breadcrumb**: Navigation breadcrumbs
- **Pagination**: Page navigation

### Feedback Components
- **Toast**: Notification messages
- **Alert**: Important messages
- **Alert Dialog**: Confirmation dialogs
- **Dialog**: Modal dialogs
- **Drawer**: Side drawer
- **Popover**: Floating content
- **Tooltip**: Hover information
- **Progress**: Progress indicators
- **Skeleton**: Loading placeholders

### Data Display
- **Table**: Data tables
- **Avatar**: User avatars
- **Badge**: Status badges
- **Carousel**: Image/content carousel
- **Chart**: Data visualization
- **Collapsible**: Expandable content
- **Accordion**: Expandable sections
- **Hover Card**: Hover information card

### Utility Components
- **Command**: Command palette
- **Calendar**: Date picker
- **Date Picker**: Date selection
- **Input OTP**: OTP input
- **Sonner**: Advanced toast notifications

## 🏗️ Custom Components

### Dashboard Components

#### **DatabaseDashboard.tsx**
Comprehensive database monitoring interface showing:
- Real-time statistics
- Batch records
- Transaction history
- Performance metrics

```typescript
<DatabaseDashboard />
```

#### **LiveDashboard.tsx**
Real-time monitoring dashboard with:
- Active shipments
- Temperature readings
- Alert notifications
- Compliance status

#### **IoTDashboard.tsx**
IoT sensor monitoring interface:
- Live sensor readings
- Temperature charts
- Humidity tracking
- Location monitoring

#### **MedicineFlowDashboard.tsx**
Supply chain visualization:
- Batch flow tracking
- Stage transitions
- Compliance checkpoints
- Timeline view

### Blockchain Components

#### **SacredVaultDashboard.tsx**
Blockchain vault interface for:
- Secure data storage
- IPFS integration
- Hedera consensus
- Verification proofs

#### **SmartContractDashboard.tsx**
Smart contract interaction:
- Contract deployment
- Function calls
- Event monitoring
- Transaction history

#### **TransactionScanner.tsx**
Blockchain transaction viewer:
- Transaction details
- HashScan integration
- Status tracking
- Receipt display

### Wallet Components

#### **ModernWalletConnect.tsx**
Modern wallet connection UI with:
- Multi-wallet support
- QR code connection
- Account display
- Balance information

#### **SimpleWalletConnector.tsx**
Basic wallet connector for quick integration

#### **WalletTransactionNotice.tsx**
Transaction notification component

### Utility Components

#### **QRScanner.tsx**
QR code scanning functionality:
- Camera access
- Code detection
- Verification integration
- Error handling

#### **SystemStatusChecker.tsx**
System health monitoring:
- Service status
- API connectivity
- Blockchain status
- Database health

#### **ErrorBoundary.tsx**
Error handling wrapper:
- Catches React errors
- Displays fallback UI
- Logs error details
- Recovery options

#### **Navigation.tsx**
Main navigation component:
- Route management
- Active state
- Mobile responsive
- User menu

#### **WelcomePage.tsx**
Landing page with:
- Hero section
- Feature highlights
- Call-to-action
- Animations

## 🎯 Component Usage

### Basic Usage
```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const MyComponent = () => {
  return (
    <Card>
      <Button>Click Me</Button>
    </Card>
  );
};
```

### Dashboard Usage
```typescript
import { LiveDashboard } from '@/components/LiveDashboard';

export const DashboardPage = () => {
  return <LiveDashboard />;
};
```

### Wallet Integration
```typescript
import { ModernWalletConnect } from '@/components/ModernWalletConnect';

export const Header = () => {
  return (
    <header>
      <ModernWalletConnect />
    </header>
  );
};
```

## 🎨 Styling

All components use:
- **Tailwind CSS**: Utility-first styling
- **CSS Variables**: Theme customization
- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: Theme support (coming soon)

## ♿ Accessibility

Components follow accessibility best practices:
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast compliance

## 🔧 Customization

### Theming
Components can be customized via CSS variables in `src/index.css`:
```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  /* ... more variables */
}
```

### Component Variants
Many components support variants:
```typescript
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

## 📚 Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 🤝 Contributing

When adding new components:
1. Follow existing naming conventions
2. Add TypeScript types
3. Include JSDoc comments
4. Ensure accessibility
5. Add to this README

---

**Note**: All components are designed to be reusable, accessible, and performant. Refer to individual component files for detailed prop documentation.
