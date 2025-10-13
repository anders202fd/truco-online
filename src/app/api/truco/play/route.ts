import { NextRequest, NextResponse } from 'next/server';
import { playTrucoGame } from '@/lib/trucoGame';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, betAmount } = body;

    // Validações básicas
    if (!playerId || !betAmount) {
      return NextResponse.json(
        { success: false, error: 'Player ID e valor da aposta são obrigatórios' },
        { status: 400 }
      );
    }

    if (betAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valor da aposta deve ser maior que zero' },
        { status: 400 }
      );
    }

    // Para demonstração, vamos simular um usuário com saldo suficiente
    const mockUser = {
      id: parseInt(playerId),
      balance: 1000 // Saldo simulado suficiente
    };

    // Verificar saldo simulado
    if (mockUser.balance < betAmount) {
      return NextResponse.json(
        { success: false, error: 'Saldo insuficiente' },
        { status: 400 }
      );
    }

    // Jogar o jogo
    const gameResult = playTrucoGame(playerId, betAmount);

    // Calcular novo saldo
    let newBalance = mockUser.balance;
    let winnings = 0;

    if (gameResult.playerWin) {
      // Jogador ganhou: recebe 1.8x o valor apostado
      winnings = betAmount * 1.8;
      newBalance = mockUser.balance - betAmount + winnings;
    } else {
      // Jogador perdeu: perde o valor apostado
      newBalance = mockUser.balance - betAmount;
      winnings = 0;
    }

    // Log para debug
    console.log('Jogo executado com sucesso:', {
      playerId,
      betAmount,
      playerWin: gameResult.playerWin,
      newBalance,
      winnings
    });

    return NextResponse.json({
      success: true,
      data: {
        ...gameResult,
        newBalance,
        betAmount,
        winnings
      }
    });

  } catch (error) {
    console.error('Erro detalhado na API do Truco:', error);
    
    // Retornar erro mais específico
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}