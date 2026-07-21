import { Router } from 'express';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const data = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(data);
  } catch (e) { next(e); }
});

router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const doc = await Notification.create({ ...req.body, userId: req.userId, read: false });
    res.status(201).json(doc);
  } catch (e) { next(e); }
});

router.patch('/:id/read', authenticateToken, async (req, res, next) => {
  try {
    await Notification.updateOne({ _id: req.params.id, userId: req.userId }, { $set: { read: true } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.patch('/read-all', authenticateToken, async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { $set: { read: true } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    await Notification.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
