# Admin Panel Guide - नवभारत संवाद

## Overview
This is a comprehensive admin panel for managing a professional Marathi newspaper website with real-time updates via WebSocket.

## Features

### 1. **Dashboard** (`/admin`)
- Real-time statistics (articles, views, categories, authors)
- Quick actions for common tasks
- Recent articles list
- Real-time connection indicator

### 2. **Articles Management** (`/admin/articles`)
- **List View**: View all articles with filters (category, status, search)
- **Create Article** (`/admin/articles/create`): Rich text editor with TinyMCE
- **Edit Article** (`/admin/articles/edit/:id`): Edit existing articles
- Features:
  - Marathi and English titles
  - Rich text content editor
  - Featured image upload
  - Category and subcategory selection
  - Author assignment
  - Breaking news and featured flags
  - SEO settings (meta keywords, description)
  - Draft, Pending, Published status

### 3. **Categories Management** (`/admin/categories`)
- Hierarchical category structure (parent-child)
- Create, edit, delete categories
- Display order management
- Active/inactive status
- Tree view with expand/collapse

### 4. **Authors Management** (`/admin/authors`)
- Create and manage authors
- Profile image upload
- Bio and designation
- Active/inactive status

### 5. **Media Library** (`/admin/media`)
- Upload images and PDFs
- Search and filter media
- Copy URL to clipboard
- Delete media files
- Grid view with preview

### 6. **E-Paper Management** (`/admin/epaper`)
- Already implemented
- PDF upload and mapping interface

### 7. **Settings** (`/admin/settings`)
- Site information (name, description)
- Contact information (email, phone, address)
- Newspaper information (PRGI Reg No, Chief Editor)
- Social media links (Facebook, Twitter, Instagram, YouTube, LinkedIn, WhatsApp)
- SEO settings (meta keywords, description)

## Real-Time Features

### WebSocket Integration
- Real-time article updates (create, update, publish, delete)
- Live statistics updates
- View count updates
- Connection status indicator

### WebSocket Events
- `article:created` - New article created
- `article:updated` - Article updated
- `article:published` - Article published
- `article:deleted` - Article deleted
- `stats:updated` - Statistics updated
- `views:updated` - View counts updated

## API Endpoints Expected

### Articles
- `GET /api/admin/articles` - List articles
- `GET /api/admin/articles/:id` - Get article
- `POST /api/admin/articles` - Create article
- `PUT /api/admin/articles/:id` - Update article
- `DELETE /api/admin/articles/:id` - Delete article
- `POST /api/admin/articles/bulk` - Bulk actions

### Categories
- `GET /api/admin/categories` - List categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category

### Authors
- `GET /api/admin/authors` - List authors
- `POST /api/admin/authors` - Create author
- `PUT /api/admin/authors/:id` - Update author
- `DELETE /api/admin/authors/:id` - Delete author

### Media
- `GET /api/admin/media` - List media
- `POST /api/admin/upload` - Upload files
- `POST /api/admin/upload/image` - Upload single image
- `DELETE /api/admin/media/:id` - Delete media

### Settings
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings

### Stats
- `GET /api/admin/stats` - Get dashboard statistics

## Database Schema Recommendations

### Articles Table
```sql
- id (UUID/INT)
- title (VARCHAR)
- titleEn (VARCHAR)
- summary (TEXT)
- content (TEXT/LONGTEXT)
- categoryId (FK)
- subCategoryId (FK, nullable)
- authorId (FK, nullable)
- featuredImage (VARCHAR/URL)
- imageGallery (JSON/ARRAY)
- isBreaking (BOOLEAN)
- isFeatured (BOOLEAN)
- status (ENUM: draft, pending, published)
- views (INT, default 0)
- metaKeywords (TEXT)
- metaDescription (TEXT)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
- publishedAt (TIMESTAMP, nullable)
```

### Categories Table
```sql
- id (UUID/INT)
- name (VARCHAR)
- nameEn (VARCHAR, nullable)
- parentId (FK, nullable)
- displayOrder (INT)
- isActive (BOOLEAN)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Authors Table
```sql
- id (UUID/INT)
- name (VARCHAR)
- nameEn (VARCHAR, nullable)
- email (VARCHAR, nullable)
- bio (TEXT, nullable)
- designation (VARCHAR, nullable)
- profileImage (VARCHAR/URL, nullable)
- isActive (BOOLEAN)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### Media Table
```sql
- id (UUID/INT)
- name (VARCHAR)
- url (VARCHAR/URL)
- type (VARCHAR) - MIME type
- size (BIGINT)
- createdAt (TIMESTAMP)
```

### Settings Table
```sql
- id (INT, primary key)
- key (VARCHAR, unique)
- value (TEXT/JSON)
- updatedAt (TIMESTAMP)
```

## File Storage Recommendations

### Cloudinary (Recommended)
- **Pros**: 
  - Excellent image optimization
  - Automatic format conversion
  - CDN delivery
  - Video support
  - PDF support
  - Transformation API
- **Best for**: Images, videos, PDFs

### ImageKit (Alternative)
- **Pros**:
  - Good image optimization
  - CDN delivery
  - URL-based transformations
- **Best for**: Images primarily

### Recommendation: **Cloudinary**
For a newspaper website with:
- High image volume
- PDF e-paper pages
- Video content
- Need for automatic optimization
- CDN for fast delivery

## Backend Architecture Recommendations

### Technology Stack
- **Node.js + Express** (or NestJS for better structure)
- **PostgreSQL** (or MongoDB if preferred)
- **Socket.io** for WebSocket
- **Cloudinary SDK** for file uploads
- **JWT** for authentication

### Real-Time Updates Flow
1. Admin creates/updates article in admin panel
2. Backend saves to database
3. Backend emits WebSocket event
4. All connected admin clients receive update
5. Frontend can also receive updates for live stats

### Database Considerations
- Use **PostgreSQL** for relational data (articles, categories, authors)
- Use **Redis** for caching and session management
- Index frequently queried fields (categoryId, status, createdAt)
- Use database triggers or application logic to update view counts

## Security Considerations
- JWT token authentication
- Role-based access control (RBAC) for future multi-user support
- File upload validation (type, size)
- SQL injection prevention (use parameterized queries)
- XSS prevention (sanitize user input)
- Rate limiting on API endpoints

## Deployment
- Admin panel can be deployed separately from frontend
- Use environment variables for API URLs
- Configure CORS properly
- Use HTTPS in production
- Set up proper logging and error tracking

## Next Steps
1. Set up backend API with all endpoints
2. Configure database schema
3. Set up Cloudinary account and configure
4. Configure WebSocket server
5. Test all CRUD operations
6. Test real-time updates
7. Deploy and configure production environment




















