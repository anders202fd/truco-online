import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'

// Configuração do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
})

export const payment = new Payment(client)
export const preference = new Preference(client)

// Função para criar uma preferência de pagamento
export async function createPaymentPreference(
  amount: number,
  description: string,
  userId: number,
  userEmail: string
) {
  try {
    const preferenceData = {
      items: [
        {
          id: `deposit_${userId}_${Date.now()}`,
          title: description,
          quantity: 1,
          unit_price: amount,
          currency_id: 'BRL'
        }
      ],
      payer: {
        email: userEmail
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
      external_reference: `user_${userId}_deposit_${Date.now()}`,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
    }

    const response = await preference.create({ body: preferenceData })
    return response
  } catch (error) {
    console.error('Erro ao criar preferência de pagamento:', error)
    throw error
  }
}

// Função para verificar status de um pagamento
export async function getPaymentStatus(paymentId: string) {
  try {
    const response = await payment.get({ id: paymentId })
    return response
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error)
    throw error
  }
}

// Função para processar webhook do Mercado Pago
export async function processWebhook(data: any) {
  try {
    if (data.type === 'payment') {
      const paymentData = await payment.get({ id: data.data.id })
      
      return {
        id: paymentData.id,
        status: paymentData.status,
        amount: paymentData.transaction_amount,
        external_reference: paymentData.external_reference,
        payer_email: paymentData.payer?.email
      }
    }
    
    return null
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    throw error
  }
}