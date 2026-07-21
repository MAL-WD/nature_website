import mongoose from 'mongoose';

const agencySchema = new mongoose.Schema({
  reference: { type: String },
  status: { type: String, default: 'انتظار' },
  date: { type: String }
}, { _id: false });

const operatingLicenseSchema = new mongoose.Schema({
  ministerSignature: { type: Boolean, default: false },
  governorSignature: { type: Boolean, default: false },
  mayorSignature: { type: Boolean, default: false },
  reference: { type: String },
  date: { type: String }
}, { _id: false });

const environmentalFileSchema = new mongoose.Schema({
  depositDate: { type: String },
  sendDate: { type: String },
  sendTime: { type: String },
  status: { type: String, default: 'انتظار' },
  fileContent: { type: String, default: 'دراسة تأثير' },
  category: { type: String },
  studyOffice: { type: String },
  facilityCode: { type: String },
  activityType: { type: String },
  classification: { type: String },
  activity: { type: String },
  address: { type: String },
  municipality: { type: String },
  district: { type: String },
  institutionType: { type: String, default: 'public' },
  privateType: { type: String },
  phone: { type: String },
  institutionName: { type: String },
  operator: { type: String },
  civilProtection: { type: agencySchema, default: () => ({}) },
  nationalGendarmerie: { type: agencySchema, default: () => ({}) },
  nationalSecurity: { type: agencySchema, default: () => ({}) },
  publicServices: { type: agencySchema, default: () => ({}) },
  irrigation: { type: agencySchema, default: () => ({}) },
  energyMines: { type: agencySchema, default: () => ({}) },
  industry: { type: agencySchema, default: () => ({}) },
  urbanization: { type: agencySchema, default: () => ({}) },
  municipalServices: { type: agencySchema, default: () => ({}) },
  nationalAgency: { type: agencySchema, default: () => ({}) },
  healthPopulation: { type: agencySchema, default: () => ({}) },
  insurance: { type: agencySchema, default: () => ({}) },
  publicInsurance: {
    reference: { type: String },
    date: { type: String }
  },
  approval: {
    reference: { type: String },
    date: { type: String },
    status: { type: String, default: 'انتظار' }
  },
  establishment: {
    reference: { type: String },
    date: { type: String }
  },
  operatingLicense: { type: operatingLicenseSchema, default: () => ({}) },
  id: { type: String, required: true, unique: true },
  folder_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('EnvironmentalFile', environmentalFileSchema);
