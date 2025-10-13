import { NextRequest, NextResponse } from 'next/server'
import { createPaymentPreference } from '@/lib/mercadopago'
import { getUserById } from '@/lib/database'
import { connectDB } from '@/lib/postgresql'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { userId, amount, description } = body

    // Validações
    if (!userId || !amount) {
      return NextResponse.json(
        { success: false, error: 'User ID e valor são obrigatórios' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valor deve ser maior que zero' },
        { status: 400 }
      )
    }

    // Buscar usuário
    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Criar preferência de pagamento no Mercado Pago
    const preference = await createPaymentPreference(
      amount,
      description || `Depósito de R$ ${amount.toFixed(2)} - Truco Online`,
      user.id,
      user.email
    )

    return NextResponse.json({
      success: true,
      data: {
        preference_id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point
      }
    })

  } catch (error) {
    console.error('Erro ao criar pagamento:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}