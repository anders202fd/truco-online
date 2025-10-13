import { NextRequest, NextResponse } from 'next/server';
import { getUserById, getUserTransactions } from '@/lib/database';
import { calculatePlayerStats } from '@/lib/trucoGame';
import { connectDB } from '@/lib/postgresql';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: 'Player ID é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await getUserById(parseInt(playerId));
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar transações do usuário
    const transactions = await getUserTransactions(user.id, 100);

    // Filtrar apenas jogos (apostas)
    const gameTransactions = transactions.filter(t => 
      t.type === 'bet_win' || t.type === 'bet_loss'
    );

    // Simular dados de jogos para calcular estatísticas
    const games = gameTransactions.map(t => ({
      playerWin: t.type === 'bet_win',
      betAmount: Math.abs(t.amount),
      createdAt: t.created_at
    }));

    // Calcular estatísticas
    const stats = calculatePlayerStats(games);

    // Remover senha do usuário
    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        stats,
        recentGames: games.slice(0, 10), // Últimos 10 jogos
        transactions: transactions.slice(0, 20) // Últimas 20 transações
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}