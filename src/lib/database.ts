import { query } from '@/lib/postgresql'

// Tipos TypeScript para as tabelas
export interface User {
  id: number
  email: string
  username: string
  password_hash: string
  balance: number
  created_at: Date
  updated_at: Date
}

export interface Room {
  id: number
  name: string
  creator_id: number
  max_players: number
  current_players: number
  bet_amount: number
  is_private: boolean
  room_code: string | null
  status: 'waiting' | 'playing' | 'finished'
  created_at: Date
  updated_at: Date
}

export interface RoomParticipant {
  id: number
  room_id: number
  user_id: number
  joined_at: Date
  position: number | null
}

export interface Transaction {
  id: number
  user_id: number
  type: 'deposit' | 'withdrawal' | 'bet_win' | 'bet_loss'
  amount: number
  description: string | null
  mercadopago_payment_id: string | null
  status: 'pending' | 'completed' | 'failed'
  created_at: Date
}

export interface GameHistory {
  id: number
  room_id: number
  winner_team: 'team_1' | 'team_2' | null
  player1_id: number | null
  player2_id: number | null
  player3_id: number | null
  player4_id: number | null
  bet_amount: number | null
  duration_minutes: number | null
  created_at: Date
}

// Funções para interagir com o banco de dados

// Usuários
export const createUser = async (email: string, username: string, passwordHash: string) => {
  const result = await query(
    'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING *',
    [email, username, passwordHash]
  )
  return result.rows[0] as User
}

export const getUserByEmail = async (email: string) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email])
  return result.rows[0] as User | undefined
}

export const getUserById = async (id: number) => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id])
  return result.rows[0] as User | undefined
}

export const updateUserBalance = async (userId: number, newBalance: number) => {
  const result = await query(
    'UPDATE users SET balance = $1 WHERE id = $2 RETURNING *',
    [newBalance, userId]
  )
  return result.rows[0] as User
}

// Salas
export const createRoom = async (name: string, creatorId: number, betAmount: number, isPrivate: boolean = false) => {
  const roomCode = isPrivate ? Math.random().toString(36).substring(2, 8).toUpperCase() : null
  const result = await query(
    'INSERT INTO rooms (name, creator_id, bet_amount, is_private, room_code) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, creatorId, betAmount, isPrivate, roomCode]
  )
  return result.rows[0] as Room
}

export const getRooms = async (limit: number = 20) => {
  const result = await query(
    'SELECT r.*, u.username as creator_username FROM rooms r JOIN users u ON r.creator_id = u.id WHERE r.status = $1 ORDER BY r.created_at DESC LIMIT $2',
    ['waiting', limit]
  )
  return result.rows as (Room & { creator_username: string })[]
}

export const getRoomById = async (id: number) => {
  const result = await query('SELECT * FROM rooms WHERE id = $1', [id])
  return result.rows[0] as Room | undefined
}

export const joinRoom = async (roomId: number, userId: number) => {
  // Verificar se a sala existe e tem espaço
  const room = await getRoomById(roomId)
  if (!room || room.current_players >= room.max_players) {
    throw new Error('Sala não encontrada ou lotada')
  }

  // Adicionar participante
  await query(
    'INSERT INTO room_participants (room_id, user_id, position) VALUES ($1, $2, $3)',
    [roomId, userId, room.current_players + 1]
  )

  // Atualizar contador de jogadores
  await query(
    'UPDATE rooms SET current_players = current_players + 1 WHERE id = $1',
    [roomId]
  )

  return true
}

export const getRoomParticipants = async (roomId: number) => {
  const result = await query(
    'SELECT rp.*, u.username FROM room_participants rp JOIN users u ON rp.user_id = u.id WHERE rp.room_id = $1 ORDER BY rp.position',
    [roomId]
  )
  return result.rows as (RoomParticipant & { username: string })[]
}

// Transações
export const createTransaction = async (
  userId: number,
  type: Transaction['type'],
  amount: number,
  description?: string,
  mercadopagoPaymentId?: string
) => {
  const result = await query(
    'INSERT INTO transactions (user_id, type, amount, description, mercadopago_payment_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, type, amount, description || null, mercadopagoPaymentId || null]
  )
  return result.rows[0] as Transaction
}

export const getUserTransactions = async (userId: number, limit: number = 50) => {
  const result = await query(
    'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
    [userId, limit]
  )
  return result.rows as Transaction[]
}

// Histórico de jogos
export const createGameHistory = async (
  roomId: number,
  winnerTeam: 'team_1' | 'team_2',
  players: number[],
  betAmount: number,
  durationMinutes: number
) => {
  const result = await query(
    'INSERT INTO game_history (room_id, winner_team, player1_id, player2_id, player3_id, player4_id, bet_amount, duration_minutes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [roomId, winnerTeam, players[0] || null, players[1] || null, players[2] || null, players[3] || null, betAmount, durationMinutes]
  )
  return result.rows[0] as GameHistory
}