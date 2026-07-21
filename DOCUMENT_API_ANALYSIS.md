# Document CRUD API Analysis

## Current State
- ✅ Document Model exists (`server/src/models/Document.js`)
- ❌ No document routes exist
- ❌ No file upload middleware
- ✅ JWT authentication middleware available
- ❌ Document model uses ObjectId for uploadedBy (should be String for Supabase UUID)

## Required APIs for Document CRUD

### 1. **GET /api/documents**
**Purpose**: Get all documents for a specific file
- Query params: `fileId` (required)
- Optional: `limit`, `offset` for pagination
- Response: Array of documents
- Auth: Required (JWT)

### 2. **GET /api/documents/:id**
**Purpose**: Get a single document by ID
- Params: `id` (document ID)
- Response: Single document object
- Auth: Required (JWT)

### 3. **POST /api/documents**
**Purpose**: Upload and create a new document
- Body: FormData with file
- Fields: `file` (file), `fileId` (string), `name` (optional, defaults to filename)
- Response: Created document
- Auth: Required (JWT)
- **Note**: Requires file upload middleware (multer)

### 4. **PUT /api/documents/:id**
**Purpose**: Update document metadata (name, etc.)
- Params: `id` (document ID)
- Body: `{ name?: string }`
- Response: Updated document
- Auth: Required (JWT)
- **Note**: Cannot update file itself, only metadata

### 5. **DELETE /api/documents/:id**
**Purpose**: Delete a document and its file
- Params: `id` (document ID)
- Response: `{ ok: true }`
- Auth: Required (JWT)
- **Note**: Should delete both database record and physical file

### 6. **GET /api/documents/:id/download**
**Purpose**: Download/serve the document file
- Params: `id` (document ID)
- Response: File stream
- Auth: Required (JWT)
- **Note**: Alternative: return signed URL if using cloud storage

## Additional Requirements

### File Storage Options:
1. **Local Storage** (Simple for development):
   - Store files in `server/uploads/documents/`
   - Store URL as `/uploads/documents/{fileId}/{filename}`
   - Serve files via Express static middleware

2. **Cloud Storage** (Production):
   - AWS S3, Google Cloud Storage, or similar
   - Store signed URLs in database
   - Generate presigned URLs for downloads

### Dependencies Needed:
- `multer` - File upload middleware
- `fs` (built-in) - File system operations
- `path` (built-in) - Path utilities

### Model Updates Needed:
- Change `uploadedBy` from ObjectId to String (Supabase UUID)
- Ensure `url` field stores file path or cloud URL

## API Endpoint Summary

| Method | Endpoint | Purpose | Auth | File Upload |
|--------|----------|---------|------|-------------|
| GET | `/api/documents?fileId=xxx` | List documents | ✅ | ❌ |
| GET | `/api/documents/:id` | Get document | ✅ | ❌ |
| POST | `/api/documents` | Create/Upload | ✅ | ✅ |
| PUT | `/api/documents/:id` | Update metadata | ✅ | ❌ |
| DELETE | `/api/documents/:id` | Delete document | ✅ | ❌ |
| GET | `/api/documents/:id/download` | Download file | ✅ | ❌ |

## Implementation Order

1. Update Document model (uploadedBy to String)
2. Install multer dependency
3. Create file upload middleware
4. Create documents route with all CRUD endpoints
5. Add file storage configuration
6. Register route in server
7. Test all endpoints




