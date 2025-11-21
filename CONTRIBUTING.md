# Contributing to Heru 🤝

Thank you for your interest in contributing to Heru! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, background, or identity.

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers and help them get started
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling or insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Basic knowledge of React, TypeScript, and Blockchain
- Hedera testnet account (for blockchain features)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/heru.git
   cd heru
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-owner/heru.git
   ```

### Install Dependencies

```bash
# Install frontend dependencies
cd heru-web
npm install

# Install backend dependencies
cd backend
npm install
```

### Set Up Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Initialize Database

```bash
cd backend
npm run init-db
npm run seed-demo
```

### Start Development Servers

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run backend:dev
```

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write clean, readable code
- Follow the coding standards
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Run tests (when implemented)
npm run test

# Test manually in browser
npm run dev
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature"
```

See [Commit Guidelines](#commit-guidelines) for commit message format.

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

- Go to GitHub and create a Pull Request
- Fill out the PR template
- Link any related issues
- Wait for review

## 📝 Coding Standards

### TypeScript/JavaScript

#### Style Guide

- Use **TypeScript** for all new code
- Use **functional components** with hooks
- Use **arrow functions** for component definitions
- Use **PascalCase** for component names
- Use **camelCase** for variables and functions
- Use **UPPER_CASE** for constants

#### Example Component

```typescript
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent = ({ title, onAction }: MyComponentProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Effect logic
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <Button onClick={onAction}>Click Me</Button>
    </div>
  );
};
```

#### Type Safety

- Always define interfaces for props
- Avoid using `any` type
- Use type inference where appropriate
- Define return types for functions

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  return fetch(`/api/users/${id}`).then(res => res.json());
}

// Bad
function getUser(id: any): any {
  return fetch(`/api/users/${id}`).then(res => res.json());
}
```

### React Best Practices

#### Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface Props {
  // ...
}

// 3. Component
export const MyComponent = ({ prop }: Props) => {
  // 4. Hooks
  const [state, setState] = useState();

  // 5. Event Handlers
  const handleClick = () => {
    // ...
  };

  // 6. Effects
  useEffect(() => {
    // ...
  }, []);

  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

#### Hooks Rules

- Only call hooks at the top level
- Only call hooks from React functions
- Use custom hooks for reusable logic

```typescript
// Custom hook example
function useWallet() {
  const [account, setAccount] = useState(null);
  const [connected, setConnected] = useState(false);

  const connect = async () => {
    // Connection logic
  };

  return { account, connected, connect };
}
```

### CSS/Styling

#### Tailwind CSS

- Use Tailwind utility classes
- Follow mobile-first approach
- Use consistent spacing scale
- Leverage design tokens

```typescript
// Good
<div className="flex flex-col gap-4 p-6 md:flex-row md:gap-6">

// Avoid inline styles
<div style={{ display: 'flex', gap: '16px' }}>
```

#### Component Variants

Use `class-variance-authority` for component variants:

```typescript
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white',
        outline: 'border border-primary',
      },
      size: {
        sm: 'px-3 py-1 text-sm',
        lg: 'px-6 py-3 text-lg',
      },
    },
  }
);
```

### File Organization

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   └── feature/         # Feature-specific components
├── pages/               # Page components
├── services/            # Business logic
├── hooks/               # Custom hooks
├── lib/                 # Utilities
└── types/               # Type definitions
```

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(dashboard): add real-time temperature monitoring"

# Bug fix
git commit -m "fix(wallet): resolve connection timeout issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactor
git commit -m "refactor(services): simplify hedera service API"
```

### Commit Message Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- First line should be 50 characters or less
- Reference issues and pull requests when relevant

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Tests added for new features
- [ ] All tests passing

### PR Title Format

Follow the same format as commit messages:

```
feat(component): add new feature
fix(service): resolve bug
docs(readme): update documentation
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. **Automated Checks**: CI/CD runs linting and tests
2. **Code Review**: Maintainers review the code
3. **Feedback**: Address any requested changes
4. **Approval**: PR is approved by maintainer(s)
5. **Merge**: PR is merged into main branch

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onAction={handleClick} />);
    
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## 📚 Documentation

### Code Comments

- Add JSDoc comments for functions and classes
- Explain "why" not "what"
- Keep comments up to date

```typescript
/**
 * Verifies a medicine batch using blockchain records
 * @param batchId - Unique batch identifier
 * @returns Verification result with compliance status
 * @throws {Error} If batch not found or verification fails
 */
async function verifyBatch(batchId: string): Promise<VerificationResult> {
  // Implementation
}
```

### README Updates

- Update README when adding new features
- Include usage examples
- Document configuration options
- Keep installation instructions current

## 🎯 Areas for Contribution

### High Priority

- [ ] Additional test coverage
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] Mobile responsiveness
- [ ] Error handling enhancements

### Feature Requests

- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Export functionality
- [ ] Notification system
- [ ] Admin dashboard

### Documentation

- [ ] API documentation
- [ ] Architecture diagrams
- [ ] Tutorial videos
- [ ] Use case examples

## 💬 Getting Help

### Resources

- **Documentation**: Check the README and docs folder
- **Issues**: Search existing issues on GitHub
- **Discussions**: Join GitHub Discussions
- **Email**: support@heru-pharma.com

### Asking Questions

When asking for help:
1. Search existing issues first
2. Provide context and details
3. Include error messages
4. Share relevant code snippets
5. Describe what you've tried

## 🏆 Recognition

Contributors will be:
- Listed in the CONTRIBUTORS.md file
- Mentioned in release notes
- Acknowledged in project documentation

## 📄 License

By contributing to Heru, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Heru!** 🦅

Together, we're building a system that protects life-saving medicines and helps save lives around the world.
