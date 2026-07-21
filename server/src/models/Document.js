import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  fileId: { type: String, required: true }, // matching EnvironmentalFile.id
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  uploadedBy: { type: String, required: true }
}, { timestamps: { createdAt: 'uploaded_at', updatedAt: 'updated_at' } });

export default mongoose.model('Document', documentSchema);
