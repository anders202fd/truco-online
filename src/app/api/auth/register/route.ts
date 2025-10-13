import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/postgresql'
import { createUser, getUserByEmail } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { email, username, password } = body

    // Validações
    if (!email || !username || !password) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar se usuário já existe
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email já está em uso' },
        { status: 400 }
      )
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 12)

    // Criar usuário
    const user = await createUser(email, username, passwordHash)

    // Remover senha do retorno
    const { password_hash, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: userWithoutPassword
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}