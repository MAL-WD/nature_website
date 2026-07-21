# Nature App Server (MERN Backend)

Express.js server with MongoDB for the Nature App environmental permit system.

## Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp env.example .env
```

Edit `.env` with your configuration:

#### For Local Development (Default)
```env
NODE_ENV=development
MONGODB_LOCAL_URI=mongodb://127.0.0.1:27017/nature_app
```

#### For Cloud/Production (MongoDB Atlas)
```env
NODE_ENV=production
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/nature_app?retryWrites=true&w=majority
```

### 3. Local MongoDB Setup

#### Option A: MongoDB Community Server
1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Create database: `nature_app`

#### Option B: Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. MongoDB Atlas Setup (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create database user with read/write permissions
4. Get connection string from "Connect" button
5. Add your IP to whitelist (or use 0.0.0.0/0 for all IPs)

### 5. Run Server

#### Development (with auto-restart)
```bash
npm run dev
```

#### Production
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server status and database connection info

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update all settings
- `PATCH /api/settings/:section` - Update specific section

### Files
- `GET /api/files` - List environmental files
- `GET /api/files/:id` - Get specific file
- `POST /api/files` - Create new file
- `PUT /api/files/:id` - Update file
- `DELETE /api/files/:id` - Delete file

### Folders
- `GET /api/folders` - List folders (supports parentId query)
- `POST /api/folders` - Create folder
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder

## Authentication

Currently uses `X-User-Id` header for temporary authentication. 
JWT authentication will be implemented next.

## Database Models

- **UserSettings** - User preferences and configuration
- **Notification** - User notifications
- **EnvironmentalFile** - Environmental permit files
- **Folder** - File organization folders
- **Document** - File attachments

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_LOCAL_URI` | Local MongoDB URI | `mongodb://127.0.0.1:27017/nature_app` |
| `MONGODB_ATLAS_URI` | Cloud MongoDB URI | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |
