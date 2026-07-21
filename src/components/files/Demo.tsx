import React, { useState } from 'react';
import Folders from './Folders';
import FolderPage from './FolderPage';

export default function Demo(): JSX.Element {
  const [currentView, setCurrentView] = useState<'folders' | 'folder'>('folders');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId);
    setCurrentView('folder');
  };

  const handleBack = () => {
    setCurrentView('folders');
    setSelectedFolderId('');
  };

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #F9FFFA 0%, #BDECC7 100%)'
    }}>
      {currentView === 'folders' ? (
        <Folders />
      ) : (
        <FolderPage folderId={selectedFolderId} onBack={handleBack} />
      )}
    </div>
  );
}

