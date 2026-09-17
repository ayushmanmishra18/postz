# 🧠 Thoughts - Social Thought Sharing Platform

> **A modern, full-stack social media application** built with React Native (Expo), TypeScript, MongoDB Atlas, and Node.js. Share your thoughts, connect with people, and discover ideas in a beautiful, performant, and secure platform.

![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue)
![Framework](https://img.shields.io/badge/Expo%20React_Native-SDK50-0078D4?logo=react)
![Backend](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![Database](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![Language](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript)

## 🚀 Current Project Status

The current codebase targets **Expo SDK 50** with React Native Web and Expo Router.

### Startup & Web Stability

- Root routing uses Expo Router route groups: `(auth)` and `(tabs)`.
- Authentication state is persisted with Zustand and the root navigator waits for persistence hydration before rendering the application routes.
- TanStack Query is provided at the application root through a shared QueryClient.
- Metro uses Expo's standard configuration.
- NativeWind styling is supported through Tailwind classes and a local `tw` compatibility helper for existing template-string class usage.
- A root redirect route sends signed-out users to login and authenticated users to the main tab area.
- The web build can be started with `npx expo start -c` followed by **w**.

### Recommended local verification

```powershell
npm install
npx expo install --fix
npm run typecheck
npx expo start -c
```

If Web loads as a blank page, check the **first** browser-console error and the Expo terminal output before changing dependencies. Avoid mixing package versions from different Expo SDK releases.


---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Architecture](#-architecture)
3. [Features](#-features)
4. [Technology Stack](#-technology-stack)
5. [System Requirements](#-system-requirements)
6. [Installation & Setup](#-installation--setup)
7. [Environment Configuration](#-environment-configuration)
8. [Project Structure](#-project-structure)
9. [Database Schema](#-database-schema)
10. [API Documentation](#-api-documentation)
11. [Frontend Guide](#-frontend-guide)
12. [Backend Guide](#-backend-guide)
13. [Real-Time Events](#-realtime-events)
14. [Testing Guide](#-testing-guide)
15. [Deployment](#-deployment)
16. [Security](#-security)
17. [Performance](#-performance)
18. [Troubleshooting](#-troubleshooting)
19. [Contributing](#-contributing)
20. [License](#-license)

---

## 🧠 Project Overview

**Thoughts** is a full-featured social thought-sharing platform that allows users to:

- **Express Ideas**: Create posts with text and images, share your thoughts with the world
- **Connect**: Follow users, interact through likes, comments, saves, and reposts
- **Discover**: Search for people, browse a personalized feed, explore trending content
- **Stay Updated**: Get real-time notifications for every interaction

The application follows a clean **client-server architecture** with a robust **REST API** backend and a **React Native** frontend that works across iOS, Android, and Web from a single codebase.

### Key Design Principles
- **Type Safety**: Full TypeScript coverage across the entire codebase
- **Performance**: Optimistic UI updates, infinite pagination, real-time updates
- **Security**: JWT authentication, bcrypt password hashing, input validation
- **Scalability**: Modular architecture, indexed database queries, connection pooling
- **Developer Experience**: Comprehensive documentation, clean code patterns, easy setup

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Mobile / Web / Desktop)                    │
│                                                                          │
│  ┌──────────────────┐  ┌───────────────────┐  ┌──────────────────────┐ │
│  │   Expo Router     │  │   NativeWind       │  │   @expo/vector-    │ │
│  │   (Navigation)    │  │   (Tailwind CSS)   │  │   icons            │ │
│  │                  │  │                   │  │                    │ │
│  │ • (tabs)/         │  │ • w-full           │  │ • Home, Search,    │ │
│  │ • (auth)/         │  │ • bg-surface-900   │  │   Notifications    │ │
│  │ • Dynamic routes  │  │ • text-primary-600 │  │ • Profile          │ │
│  │                  │  │ • rounded-xl       │  │ • Login, Signup    │ │
│  └────────┬─────────┘  └────────┬──────────┘  └────────┬───────────┘ │
│           │                     │                      │              │
│  ┌────────▼─────────────────────▼──────────────────────▼───────────┐  │
│  │                    Zustand (Client State)                        │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │  │
│  │  │  authStore   │  │  feedStore   │  │    uiStore           │   │  │
│  │  │              │  │              │  │                      │   │  │
│  │  │ • user       │  │ • posts[]    │  │ • isCreatePostOpen   │   │  │
│  │  │ • tokens     │  │ • cursor     │  │ • activeTab          │   │  │
│  │  │ • isAuth     │  │ • hasMore    │  │ • selectedPost       │   │  │
│  │  │              │  │              │  │ • selectedUser       │   │  │
│  │  │ • setAuth()  │  │ • appendPost()│ │ • openCommentSheet() │   │  │
│  │  │ • logout()   │  │ • clearFeed() │ │ • setActiveTab()     │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    TanStack Query (Server State)                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │ • Infinite Query (Feed, Notifications, Comments)          │   │  │
│  │  │ • Mutations (Create Post, Like, Follow, Comment)          │   │  │
│  │  │ • Optimistic Updates                                      │   │  │
│  │  │ • Auto Refetch / Cache Management                         │   │  │
│  │  │ • Token Refresh Interceptor                               │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                   Socket.io Client (Real-Time)                    │  │
│  │  • Real-time Post updates, Comments, Likes                       │  │
│  │  • Live Notifications, Follow events                             │  │
│  │  • WebSocket connection management                               │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                              │ HTTPS / WSS
                              │
┌─────────────────────────────▼─────────────────────────────────────────┐
│                     BACKEND (Node.js + Express)                         │
│                                                                          │
│  ┌──────────────────┐  ┌───────────────────┐  ┌──────────────────────┐ │
│  │   Express.js      │  │   Socket.io        │  │   Multer             │ │
│  │   (REST API)      │  │   (Real-time)      │  │   (File Upload)      │ │
│  │                  │  │                   │  │                    │ │
│  │ • /api/auth      │  │ • post:created     │  │ • /api/upload/image  │ │
│  │ • /api/users     │  │ • comment:created  │  │ • /api/upload/avatar │ │
│  │ • /api/posts     │  │ • user:followed    │  │ • /api/upload/cover  │ │
│  │ • /api/comments  │  │ • notification     │  │ • Size limits        │ │
│  │ • /api/notifications│ │ • Live rooms      │  │ • Type validation    │ │
│  │                  │  │                   │  │                    │ │
│  └────────┬─────────┘  └────────┬──────────┘  └────────┬───────────┘ │
│           │                     │                      │              │
│  ┌────────▼─────────────────────▼──────────────────────▼───────────┐  │
│  │                    Middleware Layer                                │  │
│  │  ┌─────────────┐  ┌────────────────────┐  ┌──────────────────┐ │  │
│  │  │  authMiddleware│ │  errorHandler       │  │  asyncHandler    │ │  │
│  │  │              │  │                    │  │                  │ │  │
│  │  │ • JWT verify │  │ • Catch-all errors  │  │ • Async wrapper  │ │  │
│  │  │ • Token      │  │ • Consistent format │  │ • Error catching │ │  │
│  │  │   rotation   │  │ • Stack traces      │  │                  │ │  │
│  │  │ • User attach│  │ • Dev/Prod modes    │  │                  │ │  │
│  │  └──────────────┘  └────────────────────┘  └──────────────────┘ │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    Mongoose ODM (MongoDB Atlas)                    │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │  │
│  │  │  User         │  │  Post         │  │  Comment             │   │  │
│  │  │              │  │              │  │                      │   │  │
│  │  │ • username   │  │ • content     │  │ • content            │   │  │
│  │  │ • email      │  │ • images[]    │  │ • likes[]            │   │  │
│  │  │ • followers  │  │ • likes[]     │  │ • parentComment      │   │  │
│  │  │ • following  │  │ • saves[]     │  │ • repliesCount       │   │  │
│  │  │ • isPrivate  │  │ • visibility  │  │ • replies[]          │   │  │
│  │  │ • verified   │  │ • isRepost    │  │                      │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘   │  │
│  │                                                                  │  │
│  │  ┌─────────────┐  ┌──────────────────────────────────────────┐  │  │
│  │  │  Notification │  │  Follow                                   │  │  │
│  │  │              │  │                                          │  │  │
│  │  │ • type       │  │ • follower → User                         │  │  │
│  │  │ • actor      │  │ • following → User                        │  │  │
│  │  │ • isRead     │  │                                          │  │  │
│  │  │ • post/comment│ │ • Unique constraint                       │  │  │
│  │  └──────────────┘  └──────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────────────┐
│                     MongoDB Atlas (Cloud Database)                      │
│                                                                          │
│  • Collections: users, posts, comments, notifications, follows            │
│  • Indexes: Text search, compound, time-series                           │
│  • Replica Set: High availability                                        │
│  • Backup: Automated                                                     │
│  • Security: TLS/SSL, IP whitelist, Database authentication              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🔐 Authentication & Security
| Feature | Description |
|---------|-------------|
| **Email/Password Registration** | Full signup with username, email, and password validation |
| **JWT Access + Refresh Tokens** | Secure authentication with automatic token rotation |
| **Auto Token Refresh** | Seamless token refresh via Axios interceptors |
| **Secure Token Storage** | Expo SecureStore for encrypted token persistence |
| **Forgot Password** | Email-based password reset with expiring tokens |
| **Email Verification** | Ready for email verification flow |
| **Password Hashing** | bcrypt with 12 rounds for secure password storage |

### 📝 Posts & Content
| Feature | Description |
|---------|-------------|
| **Create Text Posts** | Compose thoughts up to 2000 characters |
| **Image Upload** | Attach up to 4 images per post (JPEG, PNG, WebP, GIF) |
| **Delete Posts** | Remove your own posts with confirmation |
| **Edit Content** | Update post text after publishing |
| **Repost** | Share other users' thoughts with attribution |
| **Visibility Options** | Public, Followers-only, or Private posts |
| **Rich Media Grid** | 1, 2, 3, or 4+ image layouts with smart grid |

### ❤️ Interactions
| Feature | Description |
|---------|-------------|
| **Like/Unlike** | Toggle heart on any post |
| **Save/Unsave** | Bookmark posts for later viewing |
| **Comment** | Add comments to any post |
| **Nested Replies** | Reply to individual comments |
| **Like Comments** | Like/unlike any comment |
| **Delete Comments** | Remove your own comments |
| **Share** | Share posts via native share sheet |

### 👥 Social & Users
| Feature | Description |
|---------|-------------|
| **User Profiles** | Full profile with posts, likes, media tabs |
| **Follow/Unfollow** | Follow or unfollow any user |
| **Follower/Following Lists** | View followers and who you follow |
| **User Search** | Real-time text search across all users |
| **User Suggestions** | Personalized recommendations |
| **Online Status** | Green dot indicator for active users |
| **Profile Customization** | Avatar, cover photo, bio, location, website |
| **Private Accounts** | Option to make profile private |

### 📱 Feed & Discovery
| Feature | Description |
|---------|-------------|
| **Personalized Feed** | Posts from followed users + public content |
| **Infinite Scroll** | Load more posts as you scroll |
| **Pull-to-Refresh** | Refresh feed with pull gesture |
| **Real-Time Updates** | New posts appear instantly via Socket.io |
| **Optimistic UI** | Immediate feedback before server confirmation |
| **Debounced Search** | Search users with 300ms debounce |
| **Tab-Based Navigation** | Home, Search, Notifications, Profile tabs |

### 🔔 Notifications
| Feature | Description |
|---------|-------------|
| **Real-Time Notifications** | Instant updates via Socket.io |
| **Notification Types** | Like, Comment, Follow, Mention, Repost |
| **Mark as Read** | Individual or bulk mark as read |
| **Unread Count** | Badge showing unread notification count |
| **Pagination** | Load older notifications |
| **Grouped by Date** | Today, Yesterday, or specific date grouping |

### 🎨 UI/UX & Design
| Feature | Description |
|---------|-------------|
| **Dark Mode** | Automatic system-aware dark/light theme |
| **NativeWind** | Tailwind CSS for React Native styling |
| **Smooth Animations** | React Native Reanimated for fluid transitions |
| **Toast Notifications** | Non-blocking feedback for all actions |
| **Responsive Layout** | Adapts to all screen sizes |
| **Custom Components** | Reusable Button, Input, Avatar, PostCard |
| **Keyboard-Aware** | Scroll view adjusts for keyboard |

### ⚡ Performance
| Feature | Description |
|---------|-------------|
| **TanStack Query** | Server state caching, background refetching |
| **Infinite Pagination** | Load only what's visible |
| **Optimistic Updates** | Immediate UI response |
| **Image Lazy Loading** | Efficient image handling |
| **Token Refresh** | Automatic without user interaction |
| **Debounced Search** | Reduces unnecessary API calls |

---

## 🛠️ Technology Stack

### Frontend (React Native + Expo)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Expo** | SDK 50 | React Native framework and tooling |
| **Expo Router** | 3.x | File-based navigation system |
| **React Native** | 0.73 | Core UI framework |
| **NativeWind** | 2.x | Tailwind CSS for React Native |
| **TanStack Query** | 5.x | Server state management and caching |
| **Zustand** | 4.x | Lightweight client state management |
| **Socket.io Client** | 4.x | Real-time WebSocket communication |
| **React Hook Form** | 7.x | Form handling with validation |
| **date-fns** | 3.x | Date formatting and relative time |
| **@expo/vector-icons** | 14.x | Icon library |
| **React Native Reanimated** | 3.x | Animations |
| **React Native Safe Area Context** | 4.x | Safe area insets |
| **React Native Screens** | 3.x | Native screen management |
| **expo-image-picker** | 14.x | Image selection from gallery/camera |
| **expo-secure-store** | 12.x | Encrypted local storage |

### Backend (Node.js + Express)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express** | 4.x | REST API framework |
| **MongoDB Atlas** | 6.x | Cloud database |
| **Mongoose** | 8.x | MongoDB ODM |
| **JWT** | 9.x | Token-based authentication |
| **Socket.io** | 4.x | Real-time communication |
| **Multer** | 1.x | File upload handling |
| **bcryptjs** | 2.x | Password hashing |
| **helmet** | 7.x | Security headers |
| **cors** | 2.x | Cross-origin resource sharing |
| **morgan** | 1.x | HTTP request logging |
| **dotenv** | 16.x | Environment variable management |
| **uuid** | 9.x | Unique file identifiers |

### Development Tools

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Type safety across entire codebase |
| **Tailwind CSS** | Utility-first styling |
| **ESLint** | Code linting and consistency |
| **tsx** | TypeScript execution for backend |
| **git** | Version control |
| **MongoDB Atlas** | Cloud database hosting |

---

## 💻 System Requirements

### Minimum Requirements
- **OS**: Windows 10+, macOS 11+, or Linux (Ubuntu 20.04+)
- **Node.js**: v18.17.0 or higher (v24 recommended)
- **npm**: v9.0.0 or higher
- **RAM**: 4 GB minimum, 8 GB recommended
- **Storage**: 2 GB available disk space
- **Internet**: Stable connection for MongoDB Atlas

### Optional Requirements
- **Android Studio**: For Android emulator (API 33+)
- **Xcode**: For iOS simulator (macOS only)
- **Expo Go App**: For testing on physical devices
- **MongoDB Atlas Account**: For cloud database (free tier available)

### Supported Platforms
- **iOS**: 15.0+
- **Android**: API 26+ (Android 8.0+)
- **Web**: Chrome, Firefox, Safari, Edge (latest versions)
- **Electron**: Desktop apps (future support)

---

## 📦 Installation & Setup

### Step 1: Prerequisites Verification

Verify all required tools are installed:

```powershell
# Check Node.js version (must be 18+)
node --version
# Expected: v24.19.0 or similar

# Check npm version
npm --version
# Expected: 10.x.x or higher

# Check if Expo CLI is available
npx expo --version
# Expected: ~50.x.x
```

If Node.js needs to be updated:
```powershell
# Install Node.js 20 LTS using nvm-windows
# https://github.com/coreybutler/nvm-windows
nvm install 20
nvm use 20
```

### Step 2: Clone & Navigate to Project

```powershell
# Navigate to project directory
cd "C:\Users\ayush\OneDrive\Documents\Default Project"
```

### Step 3: Install Frontend Dependencies

```powershell
cd "C:\Users\ayush\OneDrive\Documents\Default Project"
npm install
```

**What gets installed:**
- Expo SDK 50 packages
- React Native 0.73
- NativeWind, TanStack Query, Zustand
- All UI libraries and utilities
- Total: ~1376 packages

### Step 4: Install Backend Dependencies

```powershell
cd "C:\Users\ayush\OneDrive\Documents\Default Project\server"
npm install
```

**What gets installed:**
- Express, Mongoose, Socket.io
- bcryptjs, jsonwebtoken, multer
- helmet, cors, morgan, dotenv
- Total: ~172 packages

### Step 5: Verify Installation

```powershell
# Frontend
cd "C:\Users\ayush\OneDrive\Documents\Default Project"
npm run typecheck
# Expected: No errors (may have warnings)

# Backend
cd "C:\Users\ayush\OneDrive\Documents\Default Project\server"
npm run typecheck
# Expected: No errors
```

### Step 6: Configure Environment Variables

#### Frontend `.env` (project root)

Create `.env` file:
```bash
cp .env.example .env
```

Content:
```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
EXPO_PUBLIC_APP_NAME=Thoughts

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://ayushmanmishraji1_db_user:JduQ0lTC5nEPSKZr@cluster0.tkvdsq0.mongodb.net/thoughts?retryWrites=true&w=majority

# JWT Configuration (Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@thoughts.app

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp,image/gif

# CORS Configuration
CLIENT_URL=http://localhost:8081
```

#### Backend `.env` (server directory)

Create `server/.env`:
```env
PORT=3000
NODE_ENV=development

MONGODB_URI=mongodb+srv://ayushmanmishraji1_db_user:JduQ0lTC5nEPSKZr@cluster0.tkvdsq0.mongodb.net/thoughts?retryWrites=true&w=majority

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

CLIENT_URL=http://localhost:8081

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@thoughts.app

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp,image/gif
```

> ⚠️ **IMPORTANT**: Never commit `.env` files to version control. They are in `.gitignore`.

### Step 7: Generate Secure JWT Secrets (Production)

For production, generate strong secrets:
```powershell
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and replace `your-super-secret-jwt-key-change-in-production` and `your-refresh-token-secret` in both `.env` files.

### Step 8: Create Uploads Directory

```powershell
# The uploads directory will be auto-created by the server
# But ensure the parent exists:
if (!(Test-Path "C:\Users\ayush\OneDrive\Documents\Default Project\server\uploads")) {
    New-Item -ItemType Directory -Path "C:\Users\ayush\OneDrive\Documents\Default Project\server\uploads"
}
```

---

## ⚙️ Environment Configuration

### Environment Variables Reference

| Variable | Frontend | Backend | Default | Description |
|----------|----------|---------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | ✅ | | `http://localhost:3000/api` | Backend API URL |
| `EXPO_PUBLIC_SOCKET_URL` | ✅ | | `http://localhost:3000` | Socket.io server URL |
| `MONGODB_URI` | ✅ | ✅ | — | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | ✅ | — | JWT signing secret (min 64 chars) |
| `JWT_EXPIRES_IN` | ✅ | ✅ | `7d` | Access token expiry |
| `JWT_REFRESH_SECRET` | ✅ | ✅ | — | Refresh token signing secret |
| `JWT_REFRESH_EXPIRES_IN` | ✅ | ✅ | `30d` | Refresh token expiry |
| `CLIENT_URL` | | ✅ | `http://localhost:8081` | Allowed origin for CORS |
| `PORT` | | ✅ | `3000` | Server port |
| `NODE_ENV` | | ✅ | `development` | Environment mode |
| `SMTP_*` | | ✅ | — | Email configuration |
| `UPLOAD_DIR` | | ✅ | `./uploads` | File upload directory |
| `MAX_FILE_SIZE` | | ✅ | `5242880` | Max upload size (5MB) |
| `ALLOWED_MIME_TYPES` | | ✅ | `image/jpeg,...` | Allowed file types |

### Environment Modes

#### Development
```env
NODE_ENV=development
```
- Full error stack traces
- Verbose logging
- Hot reload enabled
- Debug mode active

#### Production
```env
NODE_ENV=production
```
- Minimal error messages
- Performance optimizations
- Security headers strict mode
- JWT secrets enforced (throws if missing)

---

## 📁 Project Structure

### Complete File Tree

```
Default Project/                          # Project Root
│
├── .env                                  # Frontend environment variables
├── .env.example                          # Environment template
├── .gitignore                            # Git exclusions (node_modules, .expo, uploads)
├── README.md                             # This file
├── package.json                          # Frontend dependencies & scripts
├── tsconfig.json                         # TypeScript configuration
├── tailwind.config.js                    # Tailwind CSS configuration
├── babel.config.js                       # Babel configuration
├── app.json                              # Expo configuration
├── index.js                              # Expo entry point
├── App.tsx                               # Root App component
│
├── app/                                  # Expo Router Pages
│   ├── _layout.tsx                       # Root layout with Providers & Toast
│   │
│   ├── (tabs)/                           # Authenticated Tab Navigation
│   │   ├── _layout.tsx                   # Tab layout with TabBar
│   │   ├── index.tsx                     # 🏠 Home Feed Screen
│   │   ├── search.tsx                    # 🔍 User Search Screen
│   │   ├── notifications.tsx             # 🔔 Notifications Screen
│   │   └── profile.tsx                   # 👤 Profile Screen with tabs
│   │
│   └── (auth)/                           # Unauthenticated Auth Navigation
│       ├── _layout.tsx                   # Auth navigation layout
│       ├── login.tsx                     # 🔑 Login Screen
│       └── signup.tsx                    # 📝 Signup Screen
│
├── src/                                  # Frontend Source Code
│   │
│   ├── api/                              # API Layer (Axios calls)
│   │   ├── index.ts                      # API exports
│   │   ├── auth.ts                       # Auth API calls (login, register, logout)
│   │   ├── posts.ts                      # Post API calls (CRUD, like, save)
│   │   ├── users.ts                      # User API calls (profile, follow, search)
│   │   ├── comments.ts                   # Comment API calls (create, delete, like)
│   │   └── notifications.ts              # Notification API calls
│   │
│   ├── components/                       # UI Components
│   │   ├── Providers.tsx                 # QueryClient + Auth providers
│   │   ├── Toast.tsx                     # Toast notification component
│   │   └── ui/                           # Reusable UI Components
│   │       ├── Button.tsx                # Custom button (variants: primary, secondary, outline, ghost, danger)
│   │       ├── Input.tsx                 # Text input with labels, errors, icons
│   │       ├── Avatar.tsx                # Avatar with status indicator (online/offline)
│   │       ├── PostCard.tsx              # Post display (compact & full modes)
│   │       ├── PostList.tsx              # FlatList wrapper with infinite scroll
│   │       └── CreatePostModal.tsx       # Create post bottom sheet with image picker
│   │
│   ├── hooks/                            # TanStack Query Hooks
│   │   ├── useAuth.ts                    # Auth hooks (login, register, logout, updateProfile)
│   │   ├── usePosts.ts                   # Post hooks (feed, create, like, save, delete)
│   │   ├── useUsers.ts                   # User hooks (profile, follow, search, suggestions)
│   │   ├── useComments.ts                # Comment hooks (create, like, delete)
│   │   └── useNotifications.ts           # Notification hooks (list, mark read)
│   │
│   ├── lib/                              # Utilities & Configuration
│   │   ├── api.ts                        # Axios client with token refresh interceptor
│   │   ├── auth.ts                       # JWT utilities, password hashing
│   │   ├── queryClient.ts                # TanStack Query configuration & query keys
│   │   └── db.ts                         # MongoDB connection (backend only)
│   │
│   ├── models/                           # TypeScript Type Definitions
│   │   └── index.ts                      # All shared interfaces (User, Post, Comment, etc.)
│   │
│   ├── store/                            # Zustand State Management
│   │   ├── authStore.ts                  # Auth state (user, tokens, isAuthenticated)
│   │   ├── feedStore.ts                  # Feed pagination state (posts, cursor, hasMore)
│   │   └── uiStore.ts                    # UI state (modals, selected items, activeTab)
│   │
│   └── types/                            # Type Declarations
│       ├── index.ts                      # Shared TypeScript interfaces
│       └── nativewind.d.ts               # NativeWind type declarations for className
│
└── server/                               # Backend Application
    │
    ├── .env                              # Backend environment variables
    ├── .env.example                      # Backend environment template
    ├── .gitignore                        # Git exclusions
    ├── package.json                      # Backend dependencies & scripts
    ├── tsconfig.json                     # TypeScript configuration
    │
    ├── src/                              # Backend Source Code
    │   ├── index.ts                      # Entry point (Express + Socket.io + MongoDB)
    │   │
    │   ├── models/                       # Mongoose Schemas
    │   │   ├── User.ts                   # User schema (username, email, followers, etc.)
    │   │   ├── Post.ts                   # Post schema (content, images, likes, etc.)
    │   │   ├── Comment.ts                # Comment schema (content, parentComment, replies)
    │   │   ├── Notification.ts           # Notification schema (type, actor, isRead)
    │   │   └── Follow.ts                 # Follow schema (follower → following)
    │   │
    │   ├── routes/                       # API Route Handlers
    │   │   ├── auth.ts                   # Auth routes (register, login, logout, refresh)
    │   │   ├── posts.ts                  # Post routes (CRUD, like, save, repost)
    │   │   ├── users.ts                  # User routes (profile, follow, search)
    │   │   ├── comments.ts               # Comment routes (create, delete, like)
    │   │   ├── notifications.ts          # Notification routes (list, mark read)
    │   │   └── upload.ts                 # Upload routes (image, avatar, cover)
    │   │
    │   ├── middleware/                   # Express Middleware
    │   │   ├── auth.ts                   # JWT authentication middleware
    │   │   └── errorHandler.ts           # Error handling middleware
    │   │
    │   └── lib/                          # Backend Utilities
    │       └── auth.ts                   # JWT generation, verification, password hashing
    │
    └── uploads/                          # Uploaded files directory
        └── (uploaded images go here)
```

---

## 🗄️ Database Schema

### MongoDB Collections Overview

```
thoughts Database
├── users         → User Model
├── posts         → Post Model
├── comments      → Comment Model
├── notifications → Notification Model
└── follows       → Follow Model
```

### User Collection Schema

```javascript
{
  // Identity
  _id: ObjectId,
  username: String,           // Unique, lowercase, 3-30 chars, [a-zA-Z0-9_]
  email: String,              // Unique, lowercase
  password: String,           // bcrypt hashed (not returned in queries)
  displayName: String,        // Required, max 50 chars
  
  // Profile
  bio: String,                // Optional, max 160 chars
  avatar: String,             // URL to avatar image
  coverImage: String,         // URL to cover image
  location: String,           // Optional, max 100 chars
  website: String,            // Optional, max 100 chars
  birthDate: Date,            // Optional
  
  // Privacy & Settings
  isVerified: Boolean,        // Default: false
  isPrivate: Boolean,         // Default: false
  
  // Social Graph
  followersCount: Number,     // Default: 0
  followingCount: Number,     // Default: 0
  postsCount: Number,         // Default: 0
  following: [ObjectId],      // Array of User _ids
  followers: [ObjectId],      // Array of User _ids
  
  // Security
  resetPasswordToken: String, // Optional
  resetPasswordExpires: Date, // Optional
  
  // Activity
  lastActiveAt: Date,         // Last seen timestamp
  createdAt: Date,
  updatedAt: Date
}

// Indexes
// { username: 1 } - Unique
// { email: 1 } - Unique
// { username: "text", displayName: "text" } - Text search
// { createdAt: -1 }
```

**Example Document:**
```javascript
{
  "_id": "64a1b2c3d4e5f67890123456",
  "username": "ayushdev",
  "email": "ayush@example.com",
  "displayName": "Ayush Sharma",
  "bio": "Full-stack developer | Open source enthusiast",
  "avatar": "/uploads/abc123.jpg",
  "location": "Delhi, India",
  "website": "https://ayush.dev",
  "isVerified": false,
  "isPrivate": false,
  "followersCount": 156,
  "followingCount": 89,
  "postsCount": 42,
  "following": ["64a1b2c3d4e5f67890123457", "64a1b2c3d4e5f67890123458"],
  "followers": ["64a1b2c3d4e5f67890123459"],
  "lastActiveAt": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Post Collection Schema

```javascript
{
  // Content
  _id: ObjectId,
  author: ObjectId,             // Ref: User (required)
  content: String,              // Required, max 2000 chars
  images: [String],             // Array of image URLs (max 4)
  
  // Engagement
  likes: [ObjectId],            // Array of User _ids who liked
  likesCount: Number,           // Default: 0
  commentsCount: Number,        // Default: 0
  saves: [ObjectId],            // Array of User _ids who saved
  savesCount: Number,           // Default: 0
  sharesCount: Number,          // Default: 0
  
  // Post Type
  visibility: String,           // Enum: 'public', 'followers', 'private'
  originalPost: ObjectId,       // Ref: Post (for reposts)
  isRepost: Boolean,            // Default: false
  isReply: Boolean,             // Default: false
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}

// Indexes
// { author: 1, createdAt: -1 }
// { createdAt: -1 }
// { 'content': 'text' }
// { visibility: 1, createdAt: -1 }
// { originalPost: 1 }
// { likes: 1 }
// { saves: 1 }
```

**Example Document:**
```javascript
{
  "_id": "64a1b2c3d4e5f6789012345a",
  "author": "64a1b2c3d4e5f67890123456",
  "content": "Just built an amazing full-stack app! 🚀 #coding #webdev",
  "images": ["/uploads/xyz789.jpg", "/uploads/xyz790.jpg"],
  "likes": ["64a1b2c3d4e5f67890123457"],
  "likesCount": 1,
  "commentsCount": 3,
  "saves": [],
  "savesCount": 0,
  "sharesCount": 0,
  "visibility": "public",
  "isRepost": false,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:05:00.000Z"
}
```

### Comment Collection Schema

```javascript
{
  _id: ObjectId,
  post: ObjectId,               // Ref: Post (required)
  author: ObjectId,             // Ref: User (required)
  content: String,              // Required, max 1000 chars
  likes: [ObjectId],            // Array of User _ids who liked
  likesCount: Number,           // Default: 0
  parentComment: ObjectId,      // Ref: Comment (for replies, optional)
  repliesCount: Number,         // Default: 0
  createdAt: Date,
  updatedAt: Date
}

// Indexes
// { post: 1, createdAt: 1 }
// { author: 1, createdAt: -1 }
// { parentComment: 1, createdAt: 1 }
```

### Notification Collection Schema

```javascript
{
  _id: ObjectId,
  user: ObjectId,               // Ref: User (required)
  type: String,                 // Enum: 'like', 'comment', 'follow', 'mention', 'repost'
  actor: ObjectId,              // Ref: User (required)
  post: ObjectId,               // Ref: Post (optional)
  comment: ObjectId,            // Ref: Comment (optional)
  isRead: Boolean,              // Default: false
  createdAt: Date
}

// Indexes
// { user: 1, createdAt: -1 }
// { user: 1, isRead: 1 }
// { actor: 1, createdAt: -1 }
```

### Follow Collection Schema

```javascript
{
  _id: ObjectId,
  follower: ObjectId,           // Ref: User (required)
  following: ObjectId,          // Ref: User (required)
  createdAt: Date
}

// Indexes
// { follower: 1, following: 1 } - Unique constraint
// { follower: 1, createdAt: -1 }
// { following: 1, createdAt: -1 }
```

---

## 📡 API Documentation

Complete REST API reference with all endpoints, request/response formats, and examples.

### Base URL
```
http://localhost:3000/api
```

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "ayushdev",
  "email": "ayush@example.com",
  "password": "SecurePassword123!",
  "displayName": "Ayush Sharma"
}

Response 201:
{
  "success": true,
  "data": {
    "user": { "username": "ayushdev", "displayName": "Ayush Sharma", ... },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  },
  "message": "Account created successfully"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ayush@example.com",
  "password": "SecurePassword123!"
}

Response 200:
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": { "accessToken": "...", "refreshToken": "..." }
  },
  "message": "Login successful"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response 200:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": { "username": "ayushdev", "displayName": "Ayush Sharma", ... }
}
```

### Users

#### Get User Profile
```http
GET /api/users/:username

Response 200:
{
  "success": true,
  "data": { "username": "ayushdev", "displayName": "Ayush Sharma", "isFollowing": false, ... }
}
```

#### Update Profile
```http
PATCH /api/users/me
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "displayName": "Ayush Kumar",
  "bio": "Updated bio",
  "location": "New Delhi"
}

Response 200:
{
  "success": true,
  "data": { ...updated user... },
  "message": "Profile updated"
}
```

#### Follow/Unfollow User
```http
POST /api/users/:userId/follow
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": { "isFollowing": true, "followersCount": 157 }
}
```

#### Search Users
```http
GET /api/users/search?query=ayush&page=1&limit=20

Response 200:
{
  "success": true,
  "data": {
    "items": [{ "username": "ayushdev", "displayName": "Ayush Sharma", ... }],
    "page": 1,
    "total": 1,
    "hasNextPage": false
  }
}
```

### Posts

#### Get Feed
```http
GET /api/posts/feed?page=1&limit=10
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": {
    "items": [{ "content": "...", "author": {...}, "isLiked": false, ... }],
    "page": 1,
    "hasNextPage": true
  }
}
```

#### Create Post
```http
POST /api/posts
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "content": "Hello world! 🌍",
  "images": [],
  "visibility": "public"
}

Response 201:
{
  "success": true,
  "data": { "_id": "...", "content": "Hello world!", ... },
  "message": "Post created"
}
```

#### Like/Unlike Post
```http
POST /api/posts/:id/like
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": { "likesCount": 5, "isLiked": true }
}
```

#### Save/Unsave Post
```http
POST /api/posts/:id/save
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": { "savesCount": 3, "isSaved": true }
}
```

#### Delete Post
```http
DELETE /api/posts/:id
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "message": "Post deleted"
}
```

### Comments

#### Get Post Comments
```http
GET /api/comments/post/:postId?page=1&limit=20
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": {
    "items": [{ "content": "Great post!", "author": {...}, ... }],
    "page": 1,
    "hasNextPage": false
  }
}
```

#### Create Comment
```http
POST /api/comments/post/:postId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "content": "Great post! 🔥",
  "parentCommentId": null
}

Response 201:
{
  "success": true,
  "data": { "_id": "...", "content": "Great post!", ... },
  "message": "Comment added"
}
```

### Notifications

#### Get Notifications
```http
GET /api/notifications?page=1&limit=20&unreadOnly=false
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": {
    "items": [{ "type": "like", "actor": {...}, "isRead": false, ... }],
    "page": 1,
    "total": 5
  }
}
```

#### Mark All as Read
```http
PATCH /api/notifications/read-all
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### Upload

#### Upload Image
```http
POST /api/upload/image
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

Body: { image: <file> }

Response 200:
{
  "success": true,
  "data": { "url": "/uploads/abc123.jpg" }
}
```

---

## 🔌 Real-Time Events (Socket.io)

The application uses Socket.io for real-time updates without polling.

### Connection
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: accessToken },
});
```

### Events Emitted by Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `post:created` | `Post` | New post in feed |
| `post:updated` | `Post` | Post was edited |
| `post:deleted` | `string` | Post ID deleted |
| `post:liked` | `{postId, userId, likesCount}` | Someone liked a post |
| `post:unliked` | `{postId, userId, likesCount}` | Someone unliked a post |
| `post:saved` | `{postId, userId, savesCount}` | Someone saved a post |
| `post:unsaved` | `{postId, userId, savesCount}` | Someone unsaved a post |
| `comment:created` | `Comment` | New comment on a post |
| `comment:updated` | `Comment` | Comment was edited |
| `comment:deleted` | `string` | Comment ID deleted |
| `user:followed` | `{followerId, followingId}` | Someone followed a user |
| `user:unfollowed` | `{followerId, followingId}` | Someone unfollowed a user |
| `notification:created` | `Notification` | New notification |

### Client Implementation

```typescript
// Listen for events
socket.on('post:created', (newPost) => {
  // Add to feed immediately
  feedStore.prependPosts([newPost]);
});

socket.on('notification:created', (notification) => {
  // Show toast notification
  Toast.show({ type: 'info', text1: 'New notification' });
});

// Emit events
socket.emit('notification:created', { ... });
```

---

## 🖥️ Frontend Guide

### App Navigation Structure

```
App
├── Root Layout (_layout.tsx)
│   ├── Providers (QueryClient, Zustand, Toast)
│   ├── StatusBar
│   └── Slot (renders current route)
│
├── (Tabs) - Authenticated Routes
│   ├── Tab Layout (_layout.tsx)
│   │   ├── Tab Bar (Home | Search | Notifications | Profile)
│   │   ├── Home (index.tsx) - Feed with infinite scroll
│   │   ├── Search (search.tsx) - User search
│   │   ├── Notifications (notifications.tsx) - Activity feed
│   │   └── Profile (profile.tsx) - User profile with tabs
│   │
│   └── Create Post Modal (CreatePostModal.tsx)
│       ├── Text input (max 2000 chars)
│       ├── Image picker (up to 4)
│       ├── Camera option
│       └── Post button
│
└── (Auth) - Unauthenticated Routes
    ├── Auth Layout (_layout.tsx)
    ├── Login (login.tsx)
    └── Signup (signup.tsx)
```

### Screen-by-Screen Breakdown

#### 🏠 Home Screen (`app/(tabs)/index.tsx`)

The main feed screen displaying posts from followed users.

**Features:**
- Infinite scroll pagination via TanStack Query
- Pull-to-refresh
- Real-time post updates via Socket.io
- Optimistic like/save updates
- Floating "+" button to create post

**Key Hooks:**
```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed();
const createPost = useCreatePost();
```

**Flow:**
1. On mount, fetches first page of feed
2. Scrolls to bottom → triggers `fetchNextPage`
3. Socket.io receives `post:created` → prepends to feed
4. Like/Save → optimistic update, server confirmation later

#### 🔍 Search Screen (`app/(tabs)/search.tsx`)

User search with real-time results and suggestions.

**Features:**
- Debounced search input (300ms)
- User suggestions when search is empty
- Follow/unfollow inline
- Infinite scroll for results

**Key Hooks:**
```typescript
const { data: suggestions } = useUserSuggestions();
const { data: searchData, fetchNextPage } = useSearchUsers(query);
const followUser = useFollowUser();
```

#### 🔔 Notifications Screen (`app/(tabs)/notifications.tsx`)

Activity feed showing all interactions.

**Features:**
- Grouped by date (Today, Yesterday, etc.)
- Unread indicator (blue dot)
- Mark as read / Mark all as read
- Post preview in notification
- Infinite scroll

**Key Hooks:**
```typescript
const { data, fetchNextPage, hasNextPage } = useNotifications();
const markAllAsRead = useMarkAllAsRead();
```

#### 👤 Profile Screen (`app/(tabs)/profile.tsx`)

User profile with multiple tabs.

**Tab Types:**
- **Posts**: All posts by the user
- **Replies**: Only comment replies
- **Media**: Posts with images
- **Likes**: Liked posts

**Features:**
- Avatar, cover photo
- Bio, location, website
- Follow/Unfollow button (others' profiles)
- Edit Profile button (own profile)
- Followers/Following counts (tappable)
- Post count, follower count, following count

**Key Hooks:**
```typescript
const { data: profile } = useUserProfile(username);
const { data: postsData } = useUserPosts(userId, { tab: 'posts' });
const { data: likedData } = useLikedPosts(userId);
const followUser = useFollowUser();
```

#### 🔑 Login Screen (`app/(auth)/login.tsx`)

User authentication with email and password.

**Features:**
- Email input with validation
- Password input with show/hide toggle
- Remember me checkbox
- Forgot password link
- Auto-login with stored tokens
- Error handling with toast messages

**Key Hooks:**
```typescript
const { login, isLoading } = useAuth();
```

#### 📝 Signup Screen (`app/(auth)/signup.tsx`)

New user registration with form validation.

**Fields:**
- Display Name
- Username (with @ prefix)
- Email
- Password (min 8 chars)
- Confirm Password

**Features:**
- Real-time validation
- Username availability check
- Auto-capitalize disabled for email
- Password strength indication
- Terms acceptance (future)

**Key Hooks:**
```typescript
const { register, isLoading } = useAuth();
```

### UI Components Reference

#### Button (`src/components/ui/Button.tsx`)

```tsx
<Button variant="primary" size="md" fullWidth onPress={handlePress} loading={isLoading}>
  Submit
</Button>
```

**Variants:** `primary`, `secondary`, `outline`, `ghost`, `danger`
**Sizes:** `sm`, `md`, `lg`

#### Input (`src/components/ui/Input.tsx`)

```tsx
<Input
  label="Email"
  type="email"
  value={email}
  onChangeText={setEmail}
  placeholder="you@example.com"
  error={errors.email}
/>
```

**Features:** Label, error display, helper text, left/right icons

#### Avatar (`src/components/ui/Avatar.tsx`)

```tsx
<Avatar source={user.avatar} name={user.displayName} size="md" status="online" />
```

**Sizes:** `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
**Status:** `online` (green), `offline` (gray), `busy` (red), `away` (yellow)

#### PostCard (`src/components/ui/PostCard.tsx`)

```tsx
<PostCard post={post} isCompact={false} onPress={handlePress} />
```

**Features:** Author info, content, image grid (1-4+ images), like/save/comment actions, time ago display, repost support

### State Management

#### Zustand Stores

**authStore** — Global authentication state:
```typescript
const { user, accessToken, isAuthenticated, setAuth, logout } = useAuthStore();
```

**feedStore** — Feed pagination state:
```typescript
const { posts, hasMore, isLoading, appendPosts, clearFeed } = useFeedStore();
```

**uiStore** — UI state (modals, tabs):
```typescript
const { isCreatePostOpen, activeTab, openCreatePost, closeCreatePost, setActiveTab } = useUIStore();
```

### Image Handling

**Creating a post with images:**
1. User taps image icon → launches `ImagePicker`
2. Selects up to 4 images from gallery or camera
3. Images displayed as thumbnails in composer
4. On submit, images uploaded to server via `POST /api/upload/images`
5. Server returns URLs → stored in post
6. Post created with `POST /api/posts` including image URLs

---

## ⚙️ Backend Guide

### Server Architecture

```
Express Server
├── HTTP Server (createServer)
├── Socket.io (attach to HTTP server)
├── Express Middleware
│   ├── helmet (security headers)
│   ├── cors (CORS configuration)
│   ├── morgan (HTTP logging)
│   ├── express.json (JSON body parser)
│   ├── express.urlencoded (URL-encoded body parser)
│   └── express.static (serves /uploads)
├── Routes
│   ├── /api/auth
│   ├── /api/users
│   ├── /api/posts
│   ├── /api/comments
│   ├── /api/notifications
│   └── /api/upload
├── Socket.io Namespaces & Rooms
│   ├── User-specific rooms (user:userId)
│   └── Global events
└── MongoDB Connection
```

### Server Entry Point (`src/index.ts`)

```typescript
// 1. Load environment variables
dotenv.config();

// 2. Initialize Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: {...} });

// 3. Apply middleware
app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// 4. Connect to MongoDB
await mongoose.connect(MONGODB_URI);

// 5. Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/posts', authMiddleware, postRoutes);
app.use('/api/comments', authMiddleware, commentRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/upload', authMiddleware, uploadRoutes);

// 6. Socket.io connection handler
io.on('connection', (socket) => {
  // Join user room
  socket.join(socket.user.id);
  
  // Handle disconnect
  socket.on('disconnect', () => {
    socket.leave(socket.user.id);
  });
});

// 7. Start server
httpServer.listen(PORT, () => { ... });
```

### Authentication Flow

```
Client                          Server
  │                                │
  │── POST /api/auth/register ──→  │
  │   {email, password, ...}       │
  │                                │── Hash password (bcrypt 12)
  │                                │── Create user in MongoDB
  │                                │── Generate JWT tokens
  │                                │
  │←── 201 {user, tokens} ────────│
  │                                │
  │ Store tokens in SecureStore    │
  │                                │
  │── GET /api/auth/me ──────────→ │
  │   Authorization: Bearer <token>│
  │                                │── Verify JWT
  │                                │── Find user
  │                                │
  │←── 200 {user} ────────────────│
  │                                │
  │   [Token expires after 7 days] │
  │                                │
  │── POST /api/auth/refresh ───→ │
  │   {refreshToken}               │
  │                                │── Verify refresh token
  │                                │── Generate new tokens
  │                                │
  │←── 200 {accessToken, newRefreshToken} ──│
```

### JWT Middleware

```typescript
export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded.userId).select('-password');
  req.user = user;
  next();
};
```

### Socket.io Rooms & Events

**Room Structure:**
- Each user joins a room with their `userId` on connection
- Server emits events to specific rooms using `io.to(userId).emit()`

**Event Flow:**
```typescript
// When a post is created
io.emit('post:created', newPost);  // Broadcast to all

// When a like happens on a specific post
const likerSocketId = getSocketId(post.author);
io.to(likerSocketId).emit('post:liked', data);  // Notify post author
```

### File Upload Flow

```
Client                          Server
  │                                │
  │── POST /api/upload/image ──→  │
  │   multipart/form-data         │
  │                                │── Multer middleware
  │                                │── Validate file type
  │                                │── Validate file size (5MB max)
  │                                │── Save to /uploads/
  │                                │── Generate unique filename
  │                                │
  │←── 200 {url: "/uploads/xyz"} ─│
  │                                │
  │ Store URL in post              │
```

### Error Handling

```typescript
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      error: message,
      details: err.details,
      stack: err.stack,
    });
  }
  res.status(statusCode).json({ success: false, error: message });
};
```

---

## ⚡ Real-Time Events

### Overview

The application uses **Socket.io** for real-time bidirectional communication, eliminating the need for polling.

### Connection Lifecycle

```
Client Connects → Authenticates → Joins Room
                                          │
User Actions → Server Processes → Broadcast to Relevant Rooms
                                          │
Server Events → Client Receives → Updates UI Optimistically
```

### Complete Event Map

#### Events Emitted BY Client TO Server

| Event | Payload | Description |
|-------|---------|-------------|
| `like:post` | `{postId}` | Like a specific post |
| `save:post` | `{postId}` | Save a specific post |
| `comment:create` | `{postId, content}` | Create a comment |
| `follow:user` | `{userId}` | Follow a user |
| `notification:acknowledge` | `{notificationId}` | Acknowledge notification |

#### Events Emitted BY Server TO Client

| Event | Payload | Description | Recipients |
|-------|---------|-------------|------------|
| `post:created` | `Post` | New post created | All users |
| `post:updated` | `Post` | Post edited | All users |
| `post:deleted` | `postId` | Post deleted | All users |
| `post:liked` | `{postId, userId, likesCount}` | Post liked | Post author |
| `post:unliked` | `{postId, userId, likesCount}` | Post unliked | Post author |
| `post:saved` | `{postId, userId, savesCount}` | Post saved | Post author |
| `post:unsaved` | `{postId, userId, savesCount}` | Post unsaved | Post author |
| `comment:created` | `Comment` | New comment | Post author |
| `comment:updated` | `Comment` | Comment edited | Post author |
| `comment:deleted` | `commentId` | Comment deleted | Post author |
| `user:followed` | `{followerId, followingId}` | User followed | Following user |
| `user:unfollowed` | `{followerId, followingId}` | User unfollowed | Following user |
| `notification:created` | `Notification` | New notification | Notification user |

### Implementation Example

**Frontend Socket Setup:**
```typescript
import { io } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

const socket = io(process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
  autoConnect: false,
});

// Connect when user authenticates
const { accessToken } = useAuthStore();
if (accessToken) {
  socket.auth = { token: accessToken };
  socket.connect();
}

// Listen for real-time updates
socket.on('post:created', (newPost) => {
  feedStore.prependPosts([newPost]);
});

socket.on('notification:created', (notification) => {
  Toast.show({ type: 'info', text1: 'New Notification' });
});
```

**Backend Event Emission:**
```typescript
// When a user likes a post
await post.save();
const postAuthorSocketId = getUserSocketId(post.author);
io.to(postAuthorSocketId).emit('post:liked', {
  postId: post._id,
  userId: req.user._id,
  likesCount: post.likesCount,
});
```

---

## 🧪 Testing Guide

### Manual Testing Checklist

#### Authentication Tests
- [ ] Register with new credentials → Account created, auto-login
- [ ] Login with existing credentials → Redirected to feed
- [ ] Login with wrong password → Error toast displayed
- [ ] Forgot password → Reset email sent
- [ ] Logout → Redirected to login, tokens cleared
- [ ] Token refresh → Seamless, no user interaction needed

#### Post Tests
- [ ] Create text-only post → Appears in feed
- [ ] Create post with image → Image displays correctly
- [ ] Create post with 4 images → All images in grid
- [ ] Like a post → Heart turns red, count updates instantly
- [ ] Unlike a post → Heart returns to outline
- [ ] Save a post → Bookmark turns blue
- [ ] Repost a post → Post appears with "Reposted" label
- [ ] Delete own post → Post removed from feed
- [ ] Edit post content → Updated content displayed

#### Comment Tests
- [ ] Add comment to post → Comment appears immediately
- [ ] Reply to a comment → Nested reply thread displays
- [ ] Like a comment → Heart turns red
- [ ] Delete own comment → Comment removed
- [ ] Load more comments → Infinite scroll works

#### User Tests
- [ ] Search users → Results appear with debounce
- [ ] Follow a user → Button changes to "Following"
- [ ] Unfollow a user → Button changes to "Follow"
- [ ] View profile → All info displayed correctly
- [ ] View followers → List displays with pagination
- [ ] View following → List displays correctly
- [ ] User suggestions → Recommendations appear

#### Notification Tests
- [ ] Like someone's post → Notification appears
- [ ] Comment on someone's post → Notification appears
- [ ] Mark as read → Blue dot disappears
- [ ] Mark all as read → All notifications read
- [ ] Load more notifications → Infinite scroll works

#### Feed Tests
- [ ] Initial load → Posts from followed users appear
- [ ] Scroll to bottom → More posts load
- [ ] Pull to refresh → Feed refreshes
- [ ] Real-time update → New post appears instantly
- [ ] Like post while scrolling → Optimistic update works

### API Testing with cURL

```bash
# Test server health
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"..."}

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Password123!","displayName":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Get profile (use token from login)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <accessToken>"

# Create post
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello World!"}'

# Get feed
curl -X GET http://localhost:3000/api/posts/feed \
  -H "Authorization: Bearer <accessToken>"

# Search users
curl -X GET "http://localhost:3000/api/users/search?query=ayush" \
  -H "Authorization: Bearer <accessToken>"

# Follow user
curl -X POST http://localhost:3000/api/users/64a1b2c3d4e5f67890123456/follow \
  -H "Authorization: Bearer <accessToken>"
```

### Running Type Checks

```powershell
# Frontend type check
cd "C:\Users\ayush\OneDrive\Documents\Default Project"
npm run typecheck

# Backend type check
cd "C:\Users\ayush\OneDrive\Documents\Default Project\server"
npm run typecheck

# Lint frontend
npm run lint

# Lint backend
cd server && npm run lint
```

---

## 🚀 Deployment

### Production Deployment Checklist

#### 1. Environment Variables (Production)

```env
# Frontend (.env.production)
EXPO_PUBLIC_API_URL=https://api.thoughts.app
EXPO_PUBLIC_SOCKET_URL=wss://api.thoughts.app
CLIENT_URL=https://app.thoughts.app

# Backend (server/.env.production)
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.tkvdsq0.mongodb.net/thoughts?retryWrites=true&w=majority
JWT_SECRET=<64-char-generated-secret>
JWT_REFRESH_SECRET=<64-char-generated-secret>
CLIENT_URL=https://app.thoughts.app
```

#### 2. Generate Production Secrets
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output for JWT_SECRET and JWT_REFRESH_SECRET
```

#### 3. Deploy Backend

**Option A: Heroku**
```bash
heroku create thoughts-api
heroku addons:create mongolab:sandbox
git push heroku main
```

**Option B: Railway**
```bash
railway init
railway up
```

**Option C: VPS (Ubuntu)**
```bash
# Install Node.js, MongoDB
# Clone repo, install dependencies
# Configure PM2 for process management
pm2 start server/src/index.ts --name "thoughts-api" --watch
# Configure Nginx as reverse proxy
# Setup SSL with Let's Encrypt
```

#### 4. Deploy Frontend

```bash
# Build for production
npx expo prebuild --clean
npx expo export

# Deploy to Expo Hosting
npx expo export --dev-client

# Or deploy to web hosting
npx expo export --output web-build
# Deploy web-build to Vercel, Netlify, or S3
```

#### 5. Database Backup

```bash
# MongoDB Atlas: Enable automatic backups
# Set up MongoDB Atlas triggers for critical data
# Configure database user roles and permissions
```

#### 6. SSL/HTTPS

- Enable HTTPS on all endpoints
- Use Let's Encrypt for SSL certificates
- Configure MongoDB Atlas with TLS/SSL
- Set up HTTP to HTTPS redirects

### Docker Deployment

```dockerfile
# server/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - NODE_ENV=production
    depends_on:
      - mongo
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
volumes:
  mongo-data:
```

---

## 🔒 Security

### Authentication Security

| Measure | Implementation |
|---------|---------------|
| **Password Hashing** | bcrypt with 12 rounds |
| **JWT Access Token** | 7-day expiry, signed with strong secret |
| **JWT Refresh Token** | 30-day expiry, separate secret |
| **Token Storage** | Expo SecureStore (encrypted) |
| **Token Rotation** | Automatic refresh via Axios interceptors |
| **HTTPS Only** | All communications encrypted |
| **CORS** | Strict origin whitelist |

### API Security

| Measure | Implementation |
|---------|---------------|
| **Rate Limiting** | Configurable per endpoint (future) |
| **Input Validation** | Mongoose schema validation + express validation |
| **SQL/NoSQL Injection** | Mongoose parameterized queries |
| **XSS Protection** | Input sanitization, Content-Type enforcement |
| **CSRF Protection** | JWT-based stateless authentication |
| **Helmet.js** | Security headers (HSTS, X-Frame-Options, etc.) |
| **File Upload Security** | Type validation, size limits, unique filenames |

### Database Security

| Measure | Implementation |
|---------|---------------|
| **Password Exclusion** | `.select(false)` on password field |
| **Index Security** | No sensitive data in indexes |
| **Connection Security** | TLS/SSL for MongoDB Atlas |
| **IP Whitelist** | MongoDB Atlas network access |
| **Database Auth** | Username/password authentication |
| **Backup** | MongoDB Atlas automated backups |

### Frontend Security

| Measure | Implementation |
|---------|---------------|
| **Secure Storage** | Expo SecureStore for tokens |
| **Environment Variables** | .env in .gitignore |
| **Content Security** | React Native's built-in security model |
| **Keyboard Security** | Secure text entry for passwords |
| **Certificate Pinning** | Supported via Expo (future) |

---

## 🚀 Performance

### Frontend Optimization

| Technique | Impact |
|-----------|--------|
| **TanStack Query Caching** | Eliminates redundant API calls |
| **Infinite Pagination** | Loads only visible content |
| **Optimistic Updates** | Instant UI feedback |
| **Image Lazy Loading** | Reduces initial load time |
| **Debounced Search** | Reduces API calls during typing |
| **Zustand Selectors** | Minimal re-renders |
| **React Native Reanimated** | 60fps animations |
| **FlatList Virtualization** | Efficient large list rendering |

### Backend Optimization

| Technique | Impact |
|-----------|--------|
| **MongoDB Indexing** | Fast queries on all lookup fields |
| **Connection Pooling** | Efficient MongoDB connections |
| **Lean Queries** | Faster reads (no Mongoose overhead) |
| **Pagination** | Limits response size |
| **Socket.io Rooms** | Targeted event delivery |
| **CORS Configuration** | Prevents unnecessary preflight |
| **Static File Serving** | Express static middleware for uploads |
| **Helmet Security** | Minimal overhead |

### Benchmarking

| Metric | Target |
|--------|--------|
| **API Response Time** | < 200ms (p95) |
| **Feed Load Time** | < 1s (initial) |
| **Post Creation** | < 500ms |
| **Search Results** | < 300ms |
| **Real-time Latency** | < 100ms |
| **Bundle Size** | < 5MB (initial) |
| **Cold Start** | < 3s |

### Monitoring

```bash
# Backend monitoring
npm run dev  # Shows request logs via Morgan

# MongoDB monitoring
# MongoDB Atlas: Performance Advisor, Real-time Charts

# Expo monitoring
# Expo Dev Tools: Network inspector, performance profiler
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **`node:sea` mkdir error** | Node.js 24 incompatible with Expo SDK 50 | Patch externals.js (already done) |
| **MongoDB connection fails** | Wrong URI, network issue, IP whitelist | Check .env MONGODB_URI, Atlas network access |
| **CORS errors** | CLIENT_URL mismatch | Verify CLIENT_URL matches frontend origin |
| **401 Unauthorized** | Expired token, no token | App auto-refreshes; if persistent, re-login |
| **TypeScript errors** | Missing types, incompatible versions | Run `npm run typecheck`, fix errors |
| **Expo can't connect** | Both servers not running | Start backend first, then frontend |
| **Module not found** | Dependencies not installed | Run `npm install` in both directories |
| **Image upload fails** | uploads/ dir missing, wrong permissions | Create uploads directory, check file type |
| **Socket.io not connecting** | WSS/HTTPS mismatch, wrong URL | Verify EXPO_PUBLIC_SOCKET_URL |
| **"Cannot find module"** | Node.js version issue | Use Node.js 20 LTS instead of 24 |
| **Slow feed loading** | Too many posts, no pagination | Check infinite scroll implementation |
| **Token not refreshing** | Refresh token expired | Re-authenticate |
| **Android emulator not working** | Missing Android Studio, SDK | Install Android Studio, set ANDROID_HOME |
| **iOS simulator not working** | Xcode not installed (macOS only) | Install Xcode from App Store |

### Debugging Commands

```powershell
# Check server health
curl http://localhost:3000/health

# Check MongoDB connection
cd server && npx tsx src/index.ts
# Look for: ✅ Connected to MongoDB

# View TypeScript errors
npm run typecheck

# Check running processes
netstat -an | findstr :3000   # Check if backend is running
netstat -an | findstr :8081   # Check if frontend is running

# Clear Expo cache
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Error Codes Reference

| Error Code | Meaning | Action |
|------------|---------|--------|
| `ENOENT` | File not found | Check directory structure |
| `ECONNREFUSED` | Connection refused | Start server |
| `EADDRINUSE` | Port already in use | Kill process on port |
| `400` | Bad request | Check request body |
| `401` | Unauthorized | Check token |
| `403` | Forbidden | User not authorized |
| `404` | Not found | Check endpoint URL |
| `500` | Internal server | Check server logs |

---

## 🤝 Contributing

### Development Workflow

1. **Create a feature branch**: `git checkout -b feature/new-feature`
2. **Make changes**: Follow code conventions, add tests
3. **Run type checks**: `npm run typecheck`
4. **Run linter**: `npm run lint`
5. **Test locally**: Start both servers, test manually
6. **Commit**: `git commit -m "feat: add new feature"`
7. **Push**: `git push origin feature/new-feature`
8. **Create PR**: Link to issue, describe changes

### Code Conventions

- **TypeScript**: Strict mode, full type annotations
- **Naming**: camelCase for variables, PascalCase for components/types
- **File structure**: Feature-based organization
- **Comments**: Minimal, code should be self-documenting
- **Imports**: Absolute paths using `@/` alias
- **Styling**: NativeWind (Tailwind) classes
- **State management**: Zustand for client, TanStack Query for server

### Adding a New Feature

1. Add Mongoose model to `server/src/models/`
2. Add API route to `server/src/routes/`
3. Add TypeScript type to `src/types/`
4. Add API layer function to `src/api/`
5. Add TanStack Query hook to `src/hooks/`
6. Add UI component to `src/components/ui/`
7. Add screen to `app/`
8. Add route to navigation layout
9. Test end-to-end

---

## 📄 License

**MIT License**

Copyright (c) 2024 Thoughts App

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 📞 Support

For questions, issues, or feature requests:
- **GitHub Issues**: Create an issue in the repository
- **Documentation**: This file
- **Email**: support@thoughts.app

---

## 🎯 Roadmap

### Upcoming Features

- [ ] **Direct Messaging** - Real-time chat between users
- [ ] **Story Feature** - 24-hour ephemeral posts
- [ ] **Video Support** - Upload and watch videos
- [ ] **Hashtags** - Trending topics and discoverability
- [ ] **Trending Feed** - Algorithm-curated trending posts
- [ ] **Dark Theme Customization** - User-selectable themes
- [ ] **Push Notifications** - Firebase Cloud Integration
- [ ] **Offline Mode** - Cached posts for offline viewing
- [ ] **Admin Panel** - User moderation and analytics
- [ ] **Analytics Dashboard** - Post engagement metrics

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial release |
| | | |

---

## 🙏 Acknowledgments

- **Expo** - For the amazing React Native framework
- **MongoDB** - For the cloud database platform
- **Tailwind CSS** - For the utility-first styling approach
- **TanStack** - For the excellent query library
- **Socket.io** - For real-time communication
- **React Native Community** - For all the libraries and components

---

> **Thoughts** - Where your ideas come to life. 🧠✨

> Built with ❤️ by the Thoughts team using React Native, Expo, Node.js, and MongoDB.