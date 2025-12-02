# Notes App

A Notion-style notes application built with Next.js, TypeScript, and PostgreSQL. Features a rich text editor with slash commands, user authentication, and an admin panel.

## Features

- Rich text editor powered by [Novel](https://novel.sh/) (based on TipTap/ProseMirror)
- Authentication with NextAuth v5 (credentials-based)
- User management with role-based access (Admin/User)
- Modern UI with shadcn/ui components and Tailwind CSS
- Auto-save functionality with debounced updates
- PostgreSQL database with Prisma ORM
- Docker Compose for local development

## Tech Stack

### Core Technologies

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **PostgreSQL** - Relational database
- **Prisma** - Database ORM and migrations
- **NextAuth v5** - Authentication solution
- **Novel/TipTap** - Rich text editor with slash commands

### UI & Styling

- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Reusable component library
- **Radix UI** - Accessible component primitives
- **Lucide Icons** - Icon library

### State Management

- **Redux Toolkit** - Global state management
- **RTK Query** - Data fetching and caching
- **React Hook Form** - Form state management
- **Zod** - Schema validation

## Architecture Overview

The application follows an **MVC (Model-View-Controller)** pattern adapted for Next.js:

```plaintext
src/
├── app/                    # Next.js App Router (Controllers/Routes)
│   ├── (admin)/           # Admin-only routes
│   ├── (user)/            # User routes
│   ├── api/               # API routes (Controllers)
│   └── auth/              # Authentication pages
├── components/            # React components (Views)
│   ├── ui/               # Reusable UI components
│   ├── views/            # Feature-specific views
│   └── layout/           # Layout components
├── lib/                   # Business logic
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   └── store/            # Redux store setup
├── services/             # Data access layer (Models)
├── types/                # TypeScript type definitions
└── validations/          # Zod schemas
```

### Key Architectural Decisions

1. **Monolithic Structure**: Frontend and backend are coupled within Next.js for rapid development
2. **Route Groups**: Using `(admin)` and `(user)` for layout separation without affecting URLs
3. **Server Components**: Leveraging React Server Components for initial data fetching
4. **API Routes**: RESTful API endpoints for client-side data mutations

## Authentication Trade-offs

**Current Implementation**: NextAuth v5 with JWT sessions and credential provider

**Trade-offs Made**:

- **Pros**: Quick setup, works seamlessly with Next.js, built-in CSRF protection
- **Cons**: Tightly coupled frontend/backend, limited token refresh capabilities

**Ideal Production Setup**:

- Separate frontend (Next.js) and backend (Node.js/Express)
- JWT access tokens (short-lived, 15min) + refresh tokens (long-lived, 7 days)
- HTTP-only cookies for refresh tokens
- Better separation of concerns and scalability

**Why This Approach**:
For an MVP/prototype, NextAuth provides the fastest path to secure authentication. The current setup is suitable for small-to-medium applications but would require refactoring for enterprise scale.

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Docker and Docker Compose (for PostgreSQL)

### Environment Variables

Create a `.env` file in the root directory:

```env
# PostgreSQL Configuration
POSTGRES_DB=notes-app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_PORT=5434

# Database URL
DATABASE_URL="postgresql://postgres:password@localhost:5434/notes-app?schema=public"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# Admin User (for initial seed)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

> **Generate NEXTAUTH_SECRET**: Run `openssl rand -base64 32` in your terminal

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd notes-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start PostgreSQL with Docker**

   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**

   ```bash
   npx prisma migrate deploy
   ```

5. **Seed the database (optional)**

   ```bash
   npx prisma db seed
   ```

   This creates an admin user with the credentials from your `.env` file.

6. **Start the development server**

   ```bash
   npm run dev
   ```

7. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Admin Access

After seeding, login with:

- **Email**: Value from `ADMIN_EMAIL` env variable
- **Password**: Value from `ADMIN_PASSWORD` env variable

## Project Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate   # Create new migration
```

## Database Schema

Key models:

- **User**: Authentication, profile, and role management
- **Notes**: Rich text notes with JSON content
- **Account/Session**: NextAuth session management
- **VerificationToken**: Email verification support

See `prisma/schema.prisma` for the complete schema.

## Features in Detail

### Rich Text Editor

- Slash commands for quick formatting
- Markdown shortcuts
- Auto-save with debouncing (500ms delay)
- JSON content storage for flexibility

### Role-Based Access Control

- **Admin**: Full access to all notes and user management
- **User**: Access only to their own notes

### Admin Panel

- View and manage all users
- Access any user's notes
- User creation and deletion

## Development Notes

### Why These Technologies?

- **Next.js**: Full-stack framework reducing boilerplate, great DX
- **TypeScript**: Type safety prevents bugs, improves maintainability
- **PostgreSQL**: Robust relational database, excellent Prisma support
- **Prisma**: Type-safe ORM, great migrations, generated types
- **Novel**: Production-ready editor with slash commands out-of-the-box
- **Redux Toolkit**: Predictable state management, RTK Query for API caching
- **shadcn/ui**: Copy-paste components, full customization, no package lock-in

### Folder Structure Decisions

- **Route Groups** `(admin)` and `(user)`: Clean separation without URL nesting
- **API Routes Colocation**: API endpoints near their feature for better organization
- **Service Layer**: Abstract database queries for reusability and testing

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.
