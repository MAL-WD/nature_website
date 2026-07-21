import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import Document from '../models/Document.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Ensure upload directory exists
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Multer storage configured per fileId
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileId = req.body.fileId || req.query.fileId;
    if (!fileId) return cb(new Error('fileId is required in form data'), '');
    const dest = path.join(process.cwd(), 'uploads', 'documents', fileId);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    // basic allow-list; extend as needed
    const allowed = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Unsupported file type'));
    }
    cb(null, true);
  }
});

// GET /api/documents?fileId=xxx
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { fileId } = req.query;
    if (!fileId) return res.status(400).json({ message: 'fileId is required' });
    const docs = await Document.find({ fileId, uploadedBy: req.userId }).sort({ uploaded_at: -1 });
    res.json(docs);
  } catch (e) { next(e); }
});

// GET /api/documents/:id
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, uploadedBy: req.userId });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (e) { next(e); }
});

// POST /api/documents (multipart/form-data)
router.post('/', authenticateToken, upload.single('file'), async (req, res, next) => {
  try {
    const { fileId, name } = req.body;
    if (!req.file) return res.status(400).json({ message: 'file is required' });
    if (!fileId) return res.status(400).json({ message: 'fileId is required' });

    const relativePath = path.posix.join('/uploads', 'documents', fileId, req.file.filename);

    const payload = {
      fileId,
      name: name && name.trim() ? name.trim() : req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      url: relativePath,
      uploadedBy: req.userId
    };

    const doc = await Document.create(payload);
    res.status(201).json(doc);
  } catch (e) { next(e); }
});

// PUT /api/documents/:id (update metadata only)
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { name } = req.body;
    const updates = {};
    if (typeof name === 'string' && name.trim() !== '') updates.name = name.trim();
    const doc = await Document.findOneAndUpdate({ _id: req.params.id, uploadedBy: req.userId }, updates, { new: true });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (e) { next(e); }
});

// DELETE /api/documents/:id (remove file and record)
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, uploadedBy: req.userId });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    // Remove file if exists
    if (doc.url) {
      const absolutePath = path.join(process.cwd(), doc.url.replace(/^[\/]+/, ''));
      if (fs.existsSync(absolutePath)) {
        try { fs.unlinkSync(absolutePath); } catch (_) {}
      }
    }

    await Document.deleteOne({ _id: doc._id });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// GET /api/documents/:id/download
router.get('/:id/download', authenticateToken, async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, uploadedBy: req.userId });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    const absolutePath = path.join(process.cwd(), doc.url.replace(/^[\/]+/, ''));
    if (!fs.existsSync(absolutePath)) return res.status(404).json({ message: 'File not found' });
    res.download(absolutePath, doc.name);
  } catch (e) { next(e); }
});

export default router;




