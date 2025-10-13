import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/postgresql'
import { createTransaction, getUserById, updateUserBalance } from '@/lib/database'

// POST - Processar depósito via Mercado Pago
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { userId, amount, paymentId } = body

    // Validações
    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    // Verificar se usuário existe
    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Simular verificação do pagamento no Mercado Pago
    // Em produção, aqui você faria a verificação real com a API do MP
    const paymentVerified = true

    if (!paymentVerified) {
      return NextResponse.json(
        { success: false, error: 'Pagamento não verificado' },
        { status: 400 }
      )
    }

    // Criar transação
    const transaction = await createTransaction(
      userId,
      'deposit',
      amount,
      'Depósito via Mercado Pago',
      paymentId
    )

    // Atualizar saldo do usuário
    const newBalance = user.balance + amount
    await updateUserBalance(userId, newBalance)

    return NextResponse.json({
      success: true,
      data: {
        transaction,
        newBalance
      }
    })
  } catch (error) {
    console.error('Erro ao processar depósito:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Obter histórico de transações do usuário
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    const transactions = await getUserTransactions(parseInt(userId))
    
    return NextResponse.json({
      success: true,
      data: transactions
    })
  } catch (error) {
    console.error('Erro ao buscar transações:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}