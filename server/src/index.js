import express from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import connectDB from './config/database.js';
import User from './models/User.js';
import notificationsRouter from './routes/notifications.js';
import settingsRouter from './routes/settings.js';
import filesRouter from './routes/files.js';
import foldersRouter from './routes/folders.js';
import authRouter from './routes/auth.js';
import documentsRouter from './routes/documents.js';
import environmentalFilesRouter from './routes/environmentalFiles.js';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;

const ensureDefaultAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@natureapp.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const adminName = process.env.ADMIN_NAME || 'System Admin';

  try {
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
      }

      console.log(`✅ Admin account ready: ${adminEmail}`);
      return;
    }

    const adminUser = new User({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      role: 'admin'
    });

    await adminUser.save();
    console.log(`✅ Created default admin account: ${adminEmail}`);
  } catch (error) {
    console.error('❌ Failed to ensure default admin account:', error.message);
  }
};

// Static serving for uploaded files
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    service: 'nature-app-server',
    database: process.env.MONGODB_ATLAS_URI ? 'cloud' : 'local',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/files', filesRouter);
app.use('/api/folders', foldersRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/environmental-files', environmentalFilesRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const startServer = async () => {
  await connectDB();
  await ensureDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
