import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game' }],
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);