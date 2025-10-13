import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isPrivate: { type: Boolean, default: false },
  password: { type: String, required: function() { return this.isPrivate; } },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxPlayers: { type: Number, default: 4 },
  currentGame: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', default: null },
  status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
}, { timestamps: true });

export default mongoose.models.Room || mongoose.model('Room', RoomSchema);