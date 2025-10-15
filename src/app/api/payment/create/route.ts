import { NextRequest, NextResponse } from "next/server";
import mercadopago from "mercadopago";

// Configuração segura do SDK Mercado Pago
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN || "",
});

export async function POST(req: NextRequest) {
  try {
    const { amount, userId } = await req.json();

    if (!amount || !userId) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes." },
        { status: 400 }
      );
    }

    const preference = {
      items: [
        {
          title: "Recarga Truco App",
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(amount),
        },
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=failure`,
      },
      auto_return: "approved",
      external_reference: userId,
    };

    const response = await mercadopago.preferences.create(preference);

    return NextResponse.json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar pagamento" },
      { status: 500 }
    );
  }
}
