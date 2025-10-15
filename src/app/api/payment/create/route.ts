import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export async function POST(req: NextRequest) {
  try {
    const { amount, userId } = await req.json();

    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            title: "Recarga Truco App",
            quantity: 1,
            currency_id: "BRL",
            unit_price: amount,
          },
        ],
        back_urls: {
          success: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
          failure: `${process.env.NEXTAUTH_URL}/dashboard?payment=failure`,
        },
        external_reference: userId,
      },
    });

    return NextResponse.json({ init_point: preference.init_point });
  } catch (error) {
    console.error("❌ Erro ao criar pagamento:", error);
    return NextResponse.json({ error: "Erro ao criar pagamento" }, { status: 500 });
  }
}
