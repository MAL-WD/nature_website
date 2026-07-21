import { Router } from 'express';
import EnvironmentalFile from '../models/EnvironmentalFile.js';

const router = Router();

function requireUser(req, res, next) {
  const userId = req.header('X-User-Id');
  if (!userId) return res.status(401).json({ message: 'Missing X-User-Id' });
  req.userId = userId;
  next();
}

router.get('/', requireUser, async (req, res, next) => {
  try {
    const { status, search, limit = 20, offset = 0 } = req.query;
    const q = {};
    if (status && status !== 'all') q.status = status;
    if (search) {
      q.$or = [
        { id: new RegExp(search, 'i') },
        { institution_name: new RegExp(search, 'i') }
      ];
    }
    const data = await EnvironmentalFile.find(q)
      .sort({ created_at: -1 })
      .skip(Number(offset))
      .limit(Number(limit));
    res.json(data);
  } catch (e) { next(e); }
});

router.get('/:id', requireUser, async (req, res, next) => {
  try {
    const doc = await EnvironmentalFile.findOne({ id: req.params.id });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (e) { next(e); }
});

router.post('/', requireUser, async (req, res, next) => {
  try {
    const payload = { ...req.body, createdBy: req.userId };
    const doc = await EnvironmentalFile.create(payload);
    res.status(201).json(doc);
  } catch (e) { next(e); }
});

router.put('/:id', requireUser, async (req, res, next) => {
  try {
    const doc = await EnvironmentalFile.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (e) { next(e); }
});

router.delete('/:id', requireUser, async (req, res, next) => {
  try {
    await EnvironmentalFile.deleteOne({ id: req.params.id });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
