import { Router } from 'express';
import UserSettings from '../models/UserSettings.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

async function ensureDefaults(userId) {
  const existing = await UserSettings.findOne({ userId });
  if (existing) return existing;
  return await UserSettings.create({ userId });
}

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const doc = await ensureDefaults(req.userId);
    res.json(doc);
  } catch (e) { next(e); }
});

router.put('/', authenticateToken, async (req, res, next) => {
  try {
    const updated = await UserSettings.findOneAndUpdate(
      { userId: req.userId },
      req.body,
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (e) { next(e); }
});

router.patch('/:section', authenticateToken, async (req, res, next) => {
  try {
    const section = req.params.section; // profile, notifications, security, appearance
    const update = { $set: {} };
    update.$set[section] = req.body;
    const updated = await UserSettings.findOneAndUpdate(
      { userId: req.userId },
      update,
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (e) { next(e); }
});

export default router;
