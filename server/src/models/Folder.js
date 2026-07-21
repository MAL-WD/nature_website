import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  status: { 
    type: String, 
    enum: ['active', 'archived', 'pending'], 
    default: 'active' 
  },
  category: { type: String, trim: true, default: '' },
  createdBy: { type: String, required: true } // Using Supabase user ID (UUID string)
}, { timestamps: true });

export default mongoose.model('Folder', folderSchema);
