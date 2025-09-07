# Claude Code TODO App

A responsive, modern TODO application built with Next.js, featuring Google OAuth authentication, dark theme UI, and a comprehensive development setup.

## 🚀 Features

### Current Implementation (v1.0)

- ✅ **Google OAuth Authentication** - Secure login with JWT sessions
- ✅ **Dark Theme UI** - Modern, responsive design matching provided theme
- ✅ **Protected Dashboard** - Secure access to user's TODO workspace
- ✅ **Database Integration** - MongoDB with Prisma ORM
- ✅ **State Management** - Zustand for client-side state
- ✅ **Docker Support** - Full containerization for development and production
- ✅ **Testing Suite** - Jest unit tests and Playwright E2E tests
- ✅ **Development Tools** - ESLint, Prettier, TypeScript, Husky

### Planned Features

- 📝 TODO List Management (CRUD operations)
- 🎯 Task Items with priorities and due dates
- 📊 Progress tracking and analytics
- 🔔 Deadline notifications
- 📱 Mobile responsiveness optimizations
- 🚀 Performance enhancements

## 🛠 Tech Stack

### Core Framework

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling

### Authentication & Database

- **NextAuth.js** - Authentication with Google OAuth
- **Prisma** - Type-safe database client
- **MongoDB** - Document database

### State Management & Data Fetching

- **Zustand** - Lightweight state management
- **SWR** - Data fetching and caching
- **React Hook Form + Zod** - Form handling and validation

### Development & Testing

- **Jest** - Unit and integration testing
- **Playwright** - End-to-end testing
- **ESLint + Prettier** - Code linting and formatting
- **Husky + lint-staged** - Git hooks for quality gates

### Deployment & DevOps

- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline

## 🏗 Project Structure

```
claude-code-todo-app/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/auth/        # NextAuth API routes
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Protected dashboard
│   │   └── globals.css      # Global styles
│   ├── components/          # Reusable UI components
│   │   └── providers/       # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   │   ├── auth.ts          # NextAuth configuration
│   │   └── prisma.ts        # Database client
│   ├── store/               # Zustand state stores
│   │   ├── auth-store.ts    # Authentication state
│   │   └── todo-store.ts    # TODO application state
│   └── types/               # TypeScript type definitions
├── prisma/                  # Database schema and migrations
├── e2e/                     # Playwright E2E tests
├── docker/                  # Docker configuration
└── public/                  # Static assets
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB (local or Atlas)
- Google OAuth credentials

### Environment Setup

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd claude-code-todo-app
npm install
```

2. **Configure environment variables:**

```bash
cp .env.example .env.local
```

Update `.env.local` with your values:

```env
DATABASE_URL="mongodb://localhost:27017/claude-todo-app"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

3. **Set up Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add `http://localhost:3000/api/auth/callback/google` as redirect URI

4. **Set up database:**

```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test                    # Jest unit tests
npm run test:e2e           # Playwright E2E tests

# Code quality
npm run lint               # ESLint
npm run typecheck          # TypeScript check
npm run format             # Prettier format
```

Visit `http://localhost:3000` to see the application.

## 🐳 Docker Deployment

### Development with Docker

```bash
# Using provided script
./docker/scripts/start-dev.sh

# Or manually
docker-compose --profile dev up --build
```

### Production with Docker

```bash
# Using provided script
./docker/scripts/start-prod.sh

# Or manually
docker-compose up --build -d
```

## 🧪 Testing

### Unit Tests (Jest)

```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
```

### E2E Tests (Playwright)

```bash
npm run test:e2e           # Headless mode
npm run test:e2e:ui        # Interactive UI mode
```

### Code Quality Gates

All quality checks run automatically on commit via Husky:

- ESLint for code quality
- Prettier for formatting
- TypeScript for type safety
- Jest tests must pass

## 📐 Architecture Decisions

### Authentication

- **NextAuth.js** for secure, production-ready auth
- **Database sessions** for better security over JWT
- **Prisma Adapter** for seamless database integration

### State Management

- **Zustand** for simplicity over Redux complexity
- **Persistent storage** for user preferences
- **Optimistic updates** for better UX

### Database Design

- **MongoDB** for flexibility and scalability
- **Prisma** for type safety and excellent DX
- **Hierarchical data model** (User → TodoList → TodoItem)

### UI/UX

- **Dark theme** following provided design specifications
- **Mobile-first responsive design**
- **Tailwind CSS** for rapid, consistent styling

## 🚀 Deployment

### Production Checklist

- [ ] Update environment variables for production
- [ ] Configure proper Google OAuth redirect URIs
- [ ] Set up MongoDB Atlas or production database
- [ ] Configure proper NEXTAUTH_SECRET
- [ ] Set up monitoring and logging

### CI/CD Pipeline

GitHub Actions workflow (planned):

- Run tests and quality checks
- Build Docker image
- Deploy to staging/production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code patterns
- Write tests for new features
- Update documentation as needed
- Ensure all quality gates pass

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Design inspiration from the provided theme specifications
- Built with modern Next.js 14 App Router patterns
- Follows industry best practices for authentication and security
