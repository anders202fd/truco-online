import { NextRequest, NextResponse } from 'next/server'
import { processWebhook } from '@/lib/mercadopago'
import { getUserById, updateUserBalance, createTransaction } from '@/lib/database'
import { connectDB } from '@/lib/postgresql'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    console.log('Webhook recebido:', body)

    // Processar webhook
    const paymentData = await processWebhook(body)
    
    if (!paymentData) {
      return NextResponse.json({ success: true, message: 'Webhook ignorado' })
    }

    // Verificar se o pagamento foi aprovado
    if (paymentData.status === 'approved') {
      // Extrair user ID da referência externa
      const externalRef = paymentData.external_reference
      const userIdMatch = externalRef?.match(/user_(\d+)_/)
      
      if (userIdMatch) {
        const userId = parseInt(userIdMatch[1])
        const user = await getUserById(userId)
        
        if (user) {
          // Atualizar saldo do usuário
          const newBalance = user.balance + (paymentData.amount || 0)
          await updateUserBalance(userId, newBalance)
          
          // Criar transação
          await createTransaction(
            userId,
            'deposit',
            paymentData.amount || 0,
            `Depósito via Mercado Pago - ID: ${paymentData.id}`,
            paymentData.id?.toString()
          )
          
          console.log(`Saldo atualizado para usuário ${userId}: R$ ${newBalance}`)
        }
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}