import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/postgresql'
import { createRoom, getRooms } from '@/lib/database'

// GET - Listar salas disponíveis
export async function GET() {
  try {
    await connectDB()
    const rooms = await getRooms(20)
    
    return NextResponse.json({
      success: true,
      data: rooms
    })
  } catch (error) {
    console.error('Erro ao buscar salas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova sala
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { name, creatorId, betAmount, isPrivate } = body

    // Validações
    if (!name || !creatorId || betAmount === undefined) {
      return NextResponse.json(
        { success: false, error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    if (betAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valor da aposta deve ser maior que zero' },
        { status: 400 }
      )
    }

    const room = await createRoom(name, creatorId, betAmount, isPrivate)
    
    return NextResponse.json({
      success: true,
      data: room
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar sala:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}