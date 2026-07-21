import { Router } from 'express';
import Folder from '../models/Folder.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { parentId = null } = req.query;
    const q = { createdBy: req.userId };
    if (parentId === 'root' || parentId === null) {
      q.parentId = null;
    } else if (parentId) {
      q.parentId = parentId;
    }
    const folders = await Folder.find(q).sort({ createdAt: -1 });
    
    // Import EnvironmentalFile model to count files
    const EnvironmentalFile = (await import('../models/EnvironmentalFile.js')).default;
    
    // Add file counts to each folder
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        const fileCount = await EnvironmentalFile.countDocuments({ folder_id: folder._id });
        const subfolderCount = await Folder.countDocuments({ parentId: folder._id, createdBy: req.userId });
        
        return {
          ...folder.toObject(),
          fileCount,
          subfolderCount
        };
      })
    );
    
    res.json(foldersWithCounts);
  } catch (e) { next(e); }
});

router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { name, description, parentId, status, category } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    const folderData = {
      name: name.trim(),
      description: description?.trim() || '',
      parentId: parentId || null,
      status: status || 'active',
      category: category?.trim() || '',
      createdBy: req.userId
    };

    const doc = await Folder.create(folderData);
    res.status(201).json(doc);
  } catch (e) { next(e); }
});

router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { name, description, parentId, status, category } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (status !== undefined) updateData.status = status;
    if (category !== undefined) updateData.category = category.trim();

    const updated = await Folder.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      updateData,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await Folder.deleteOne({ _id: req.params.id, createdBy: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Get folder by ID with counts
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Import EnvironmentalFile model to count files
    const EnvironmentalFile = (await import('../models/EnvironmentalFile.js')).default;
    
    // Count files in this folder
    const fileCount = await EnvironmentalFile.countDocuments({ folder_id: req.params.id });
    
    // Count subfolders
    const subfolderCount = await Folder.countDocuments({ parentId: req.params.id, createdBy: req.userId });

    res.json({
      ...folder.toObject(),
      fileCount,
      subfolderCount
    });
  } catch (e) { next(e); }
});

// Get subfolders for a parent folder
router.get('/:id/subfolders', authenticateToken, async (req, res, next) => {
  try {
    const subfolders = await Folder.find({ 
      parentId: req.params.id, 
      createdBy: req.userId 
    }).sort({ createdAt: -1 });
    
    res.json(subfolders);
  } catch (e) { next(e); }
});

// Get files in a folder
router.get('/:id/files', authenticateToken, async (req, res, next) => {
  try {
    const EnvironmentalFile = (await import('../models/EnvironmentalFile.js')).default;
    const { status, type, search } = req.query;
    
    const query = { folder_id: req.params.id, userId: req.userId };
    
    // Apply filters
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { id: { $regex: search, $options: 'i' } },
        { institutionName: { $regex: search, $options: 'i' } },
        { fileContent: { $regex: search, $options: 'i' } }
      ];
    }
    
    const files = await EnvironmentalFile.find(query).sort({ createdAt: -1 });
    res.json(files);
  } catch (e) { next(e); }
});

export default router;
