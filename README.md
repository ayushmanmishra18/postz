# Thoughts - Social Thought Sharing Platform

A modern, full-stack social media application built with React Native (Expo), TypeScript, MongoDB, and Node.js.

## Features

- 🎨 **Beautiful UI** - NativeWind (Tailwind CSS) + NativeBase components
- 📱 **Cross-platform** - iOS, Android, and Web support
- 🔐 **Authentication** - JWT-based auth with refresh tokens
- 📝 **Posts** - Create, like, save, comment, repost
- 👥 **Social** - Follow/unfollow, user profiles, search
- 🔔 **Notifications** - Real-time notifications
- 🖼️ **Media** - Image upload support
- 🌙 **Dark Mode** - System-aware theming
- ⚡ **Real-time** - Socket.io for live updates
- 📱 **Offline-first** - TanStack Query for caching

## Tech Stack

### Frontend
- **Expo Router** - File-based navigation
- **NativeWind** - Tailwind CSS for React Native
- **NativeBase** - Accessible UI components
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Form handling
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js + Express** - REST API
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Socket.io** - Real-time events
- **Multer** - File uploads

## Project Structure

```
thoughts-app/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home feed
│   │   ├── search.tsx     # Search users
│   │   ├── notifications.tsx
│   │   └── profile.tsx    # User profile
│   └── (auth)/            # Auth screens
│       ├── login.tsx
│       └── signup.tsx
├── src/
│   ├── api/               # API layer
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities & configs
│   ├── models/            # TypeScript types
│   ├── store/             # Zustand stores
│   └── types/             # Shared types
└── server/                # Backend API
    └── src/
        ├── models/        # Mongoose models
        ├── routes/        # API routes
        ├── middleware/    # Express middleware
        └── lib/           # Utilities
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. **Clone and install dependencies**
```bash
# Frontend
npm install

# Backend
cd server && npm install
```

2. **Configure environment variables**
```bash
# Frontend
cp .env.example .env

# Backend
cd server && cp .env.example .env
```

3. **Set your MongoDB URI** in both `.env` files

4. **Start development servers**
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
npm start
```

## Environment Variables

### Frontend (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/thoughts
```

### Backend (server/.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/thoughts
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CLIENT_URL=http://localhost:8081
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/me` - Get current user profile
- `GET /api/users/:username` - Get user by username
- `PATCH /api/users/me` - Update profile
- `POST /api/users/:userId/follow` - Follow user
- `DELETE /api/users/:userId/follow` - Unfollow user
- `GET /api/users/search` - Search users
- `GET /api/users/suggestions` - Get suggested users

### Posts
- `GET /api/posts/feed` - Get home feed
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post
- `PATCH /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like post
- `DELETE /api/posts/:id/like` - Unlike post
- `POST /api/posts/:id/save` - Save post
- `DELETE /api/posts/:id/save` - Unsave post
- `POST /api/posts/:id/repost` - Repost
- `GET /api/posts/user/:userId` - Get user posts
- `GET /api/posts/saved` - Get saved posts

### Comments
- `GET /api/comments/post/:postId` - Get post comments
- `POST /api/comments/post/:postId` - Create comment
- `PATCH /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Like comment

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

### Upload
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images
- `POST /api/upload/avatar` - Upload avatar
- `POST /api/upload/cover` - Upload cover image

## Real-time Events (Socket.io)

- `post:created` - New post created
- `post:updated` - Post updated
- `post:deleted` - Post deleted
- `post:liked` - Post liked
- `post:unliked` - Post unliked
- `post:saved` - Post saved
- `post:unsaved` - Post unsaved
- `comment:created` - New comment
- `comment:updated` - Comment updated
- `comment:deleted` - Comment deleted
- `user:followed` - User followed
- `user:unfollowed` - User unfollowed
- `notification:created` - New notification

## Scripts

```bash
# Frontend
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on Web
npm run lint       # Lint code
npm run typecheck  # Type check

# Backend
npm run dev        # Start with hot reload
npm run build      # Build for production
npm run start      # Start production server
```

## Deployment

### Frontend (Expo)
```bash
eas build --platform all
eas submit
```

### Backend
```bash
cd server
npm run build
npm start
```

## License

MIT