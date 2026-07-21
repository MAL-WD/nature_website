# File Management Components

This directory contains components for managing files and folders in the environmental permit system.

## Components

### 1. Folders.tsx
A comprehensive folder management component that displays a grid/list of folders with:
- Search and filtering capabilities
- Folder creation (placeholder)
- Folder viewing with detailed modal
- Folder deletion
- Status management (active, pending, archived)
- Category filtering

**Features:**
- Responsive grid layout
- Search by name/description
- Filter by status and category
- View folder details in modal
- Edit and delete actions
- Beautiful UI with consistent styling

### 2. FolderPage.tsx
A detailed view component for individual folders that shows:
- Folder statistics and information
- Sub-folders list
- Files within the folder
- File management actions
- Grid and list view modes
- File upload functionality (placeholder)

**Features:**
- Back navigation
- Folder statistics cards
- Sub-folder navigation
- File grid/list view toggle
- File search and filtering
- File actions (view, edit, delete, download)
- Responsive design

### 3. FileList.tsx
Existing component for displaying files in a table format.

### 4. FileForm.tsx
Existing component for creating and editing files.

### 5. Demo.tsx
A demonstration component showing how to integrate Folders and FolderPage components.

## Usage

### Basic Folder Management
```tsx
import { Folders } from './components/files';

function App() {
  return (
    <div>
      <Folders />
    </div>
  );
}
```

### Folder Detail View
```tsx
import { FolderPage } from './components/files';

function App() {
  const handleBack = () => {
    // Navigate back to folders list
  };

  return (
    <FolderPage 
      folderId="F001" 
      onBack={handleBack} 
    />
  );
}
```

### Complete Demo
```tsx
import { Demo } from './components/files';

function App() {
  return (
    <div>
      <Demo />
    </div>
  );
}
```

## Styling

All components use:
- Tailwind CSS for styling
- Consistent color scheme matching the main application
- Responsive design for mobile and desktop
- Smooth transitions and hover effects
- Arabic RTL support

## Color Scheme
- Primary: #076653 (Dark Green)
- Secondary: #E3EF26 (Lime Green)
- Background: #F9FFFA to #BDECC7 (Light Green Gradient)
- Text: #0C342C (Dark Text)
- Borders: #E3EF26 (Lime Green)

## Features to Implement

1. **File Upload**: Implement actual file upload functionality
2. **Folder Creation**: Add form for creating new folders
3. **File Preview**: Add file preview capabilities
4. **Bulk Operations**: Add bulk file/folder operations
5. **Permissions**: Implement user permission system
6. **Search**: Add advanced search with filters
7. **Sorting**: Add sorting by various criteria
8. **Pagination**: Add pagination for large file lists

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- Lucide React (for icons)
- No external state management required

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- RTL language support

