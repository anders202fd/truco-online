import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['deposit', 'withdraw', 'bet_win', 'bet_lose'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  externalId: { type: String }, // para Mercado Pago
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);