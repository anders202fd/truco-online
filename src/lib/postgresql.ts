import { Pool } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('❌ DATABASE_URL não foi definido no arquivo .env.local')
}

// Pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necessário para Render
  },
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Função para conectar ao PostgreSQL
export const connectDB = async () => {
  try {
    const client = await pool.connect()
    console.log('✅ PostgreSQL conectado com sucesso!')
    client.release() // Libera a conexão de volta para o pool
    return pool
  } catch (error) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', error)
    throw error
  }
}

// Função para executar queries
export const query = async (text: string, params?: any[]) => {
  try {
    const result = await pool.query(text, params)
    return result
  } catch (error) {
    console.error('❌ Erro ao executar query:', error)
    throw error
  }
}

// Função para fechar o pool (útil para testes)
export const closePool = async () => {
  await pool.end()
  console.log('🔒 Pool PostgreSQL fechado')
}

export default pool