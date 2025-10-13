import { NextRequest, NextResponse } from 'next/server';
import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN!
});

export async function POST(req: NextRequest) {
  const { amount, userId } = await req.json();

  const preference = {
    items: [{
      title: 'Recarga Truco App',
      quantity: 1,
      currency_id: 'BRL',
      unit_price: amount
    }],
    back_urls: {
      success: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
      failure: `${process.env.NEXTAUTH_URL}/dashboard?payment=failure`
    },
    external_reference: userId
  };

  const response = await mercadopago.preferences.create(preference);
  return NextResponse.json({ init_point: response.body.init_point });
}