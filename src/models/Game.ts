import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deck: [{ type: String }], // cartas como '1_espadas', etc.
  hands: [{ type: [String] }], // array de arrays, uma mão por jogador
  table: [{ type: String }], // cartas na mesa
  score: { type: [Number], default: [0, 0] }, // score das equipes
  currentPlayer: { type: Number, default: 0 },
  bets: [{ player: mongoose.Schema.Types.ObjectId, amount: Number, type: String }], // truco, etc.
  status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

export default mongoose.models.Game || mongoose.model('Game', GameSchema);