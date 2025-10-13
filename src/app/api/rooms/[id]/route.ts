import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/postgresql'
import { joinRoom, getRoomById, getRoomParticipants } from '@/lib/database'

// GET - Obter detalhes da sala
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const roomId = parseInt(params.id)
    
    if (isNaN(roomId)) {
      return NextResponse.json(
        { success: false, error: 'ID da sala inválido' },
        { status: 400 }
      )
    }

    const room = await getRoomById(roomId)
    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Sala não encontrada' },
        { status: 404 }
      )
    }

    const participants = await getRoomParticipants(roomId)
    
    return NextResponse.json({
      success: true,
      data: {
        ...room,
        participants
      }
    })
  } catch (error) {
    console.error('Erro ao buscar sala:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Entrar na sala
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const roomId = parseInt(params.id)
    const body = await request.json()
    const { userId } = body
    
    if (isNaN(roomId) || !userId) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    await joinRoom(roomId, userId)
    
    return NextResponse.json({
      success: true,
      message: 'Entrou na sala com sucesso'
    })
  } catch (error) {
    console.error('Erro ao entrar na sala:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}