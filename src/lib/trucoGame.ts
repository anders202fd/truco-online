export interface GameResult {
  playerWin: boolean;
  message: string;
  cards: string[];
  playerCards: string[];
  opponentCards: string[];
  gameDetails: {
    playerScore: number;
    opponentScore: number;
    rounds: GameRound[];
  };
}

export interface GameRound {
  roundNumber: number;
  playerCard: string;
  opponentCard: string;
  winner: 'player' | 'opponent';
  cardValues: {
    playerValue: number;
    opponentValue: number;
  };
}

// Hierarquia das cartas do Truco (do menor para o maior)
const CARD_HIERARCHY = [
  '4♠️', '4♥️', '4♦️', '4♣️',
  '5♠️', '5♥️', '5♦️', '5♣️',
  '6♠️', '6♥️', '6♦️', '6♣️',
  '7♠️', '7♥️', '7♦️', '7♣️',
  'Q♠️', 'Q♥️', 'Q♦️', 'Q♣️',
  'J♠️', 'J♥️', 'J♦️', 'J♣️',
  'K♠️', 'K♥️', 'K♦️', 'K♣️',
  'A♠️', 'A♥️', 'A♦️', 'A♣️',
  '2♠️', '2♥️', '2♦️', '2♣️',
  '3♠️', '3♥️', '3♦️', '3♣️'
];

export function playTrucoGame(playerId: string, betAmount: number): GameResult {
  try {
    // Probabilidade controlada: 0.4% de chance do jogador ganhar
    const WIN_CHANCE = 0.004;
    const random = Math.random();
    const playerWin = random <= WIN_CHANCE;

    // Gerar cartas para o jogador e oponente
    const playerCards = generateCards(3);
    const opponentCards = generateCards(3);

    // Simular 3 rodadas do truco
    const rounds: GameRound[] = [];
    let playerScore = 0;
    let opponentScore = 0;

    for (let i = 0; i < 3; i++) {
      const playerCard = playerCards[i];
      const opponentCard = opponentCards[i];
      
      const playerValue = getCardValue(playerCard);
      const opponentValue = getCardValue(opponentCard);
      
      let roundWinner: 'player' | 'opponent';
      
      if (playerWin && i === 2 && playerScore === opponentScore) {
        // Se o jogador deve ganhar e é a última rodada empatada, ele ganha
        roundWinner = 'player';
      } else if (!playerWin && i === 2 && playerScore > opponentScore) {
        // Se o jogador não deve ganhar mas está ganhando, o oponente ganha a última
        roundWinner = 'opponent';
      } else {
        // Lógica normal baseada no valor das cartas
        roundWinner = playerValue > opponentValue ? 'player' : 'opponent';
      }
      
      if (roundWinner === 'player') {
        playerScore++;
      } else {
        opponentScore++;
      }

      rounds.push({
        roundNumber: i + 1,
        playerCard,
        opponentCard,
        winner: roundWinner,
        cardValues: {
          playerValue,
          opponentValue
        }
      });
    }

    // Determinar o vencedor final
    const finalPlayerWin = playerScore > opponentScore;
    
    // Ajustar o resultado se necessário para manter a probabilidade
    const actualResult = playerWin ? finalPlayerWin : !finalPlayerWin;

    const message = actualResult
      ? `🎉 Você ganhou! Parabéns! Você ganhou R$ ${(betAmount * 1.8).toFixed(2)}`
      : `😢 Você perdeu! O oponente foi melhor desta vez. Você perdeu R$ ${betAmount.toFixed(2)}`;

    return {
      playerWin: actualResult,
      message,
      cards: [...playerCards, ...opponentCards],
      playerCards,
      opponentCards,
      gameDetails: {
        playerScore: actualResult ? Math.max(playerScore, 2) : Math.min(playerScore, 1),
        opponentScore: actualResult ? Math.min(opponentScore, 1) : Math.max(opponentScore, 2),
        rounds
      }
    };
  } catch (error) {
    console.error('Erro na função playTrucoGame:', error);
    
    // Retornar um resultado padrão em caso de erro
    return {
      playerWin: false,
      message: '😢 Você perdeu! Tente novamente.',
      cards: ['7♠️', 'Q♥️', 'A♦️', '4♣️', 'K♠️', '2♥️'],
      playerCards: ['7♠️', 'Q♥️', 'A♦️'],
      opponentCards: ['4♣️', 'K♠️', '2♥️'],
      gameDetails: {
        playerScore: 1,
        opponentScore: 2,
        rounds: [
          {
            roundNumber: 1,
            playerCard: '7♠️',
            opponentCard: '4♣️',
            winner: 'player',
            cardValues: { playerValue: 3, opponentValue: 0 }
          },
          {
            roundNumber: 2,
            playerCard: 'Q♥️',
            opponentCard: 'K♠️',
            winner: 'opponent',
            cardValues: { playerValue: 4, opponentValue: 6 }
          },
          {
            roundNumber: 3,
            playerCard: 'A♦️',
            opponentCard: '2♥️',
            winner: 'opponent',
            cardValues: { playerValue: 7, opponentValue: 8 }
          }
        ]
      }
    };
  }
}

function generateCards(count: number): string[] {
  try {
    const naipes = ["♠️", "♥️", "♦️", "♣️"];
    const valores = ["4", "5", "6", "7", "Q", "J", "K", "A", "2", "3"];
    const cartas: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const valor = valores[Math.floor(Math.random() * valores.length)];
      const naipe = naipes[Math.floor(Math.random() * naipes.length)];
      cartas.push(`${valor}${naipe}`);
    }
    
    return cartas;
  } catch (error) {
    console.error('Erro ao gerar cartas:', error);
    // Retornar cartas padrão em caso de erro
    return ['7♠️', 'Q♥️', 'A♦️'];
  }
}

function getCardValue(card: string): number {
  try {
    const index = CARD_HIERARCHY.indexOf(card);
    return index >= 0 ? index : 0;
  } catch (error) {
    console.error('Erro ao obter valor da carta:', error);
    return 0;
  }
}

// Função para salvar resultado do jogo (será implementada com banco de dados)
export async function saveGameResult(
  playerId: string, 
  playerWin: boolean, 
  betAmount: number,
  gameDetails: GameResult['gameDetails']
) {
  try {
    // Esta função será implementada para salvar no banco de dados
    console.log('Salvando resultado do jogo:', {
      playerId,
      playerWin,
      betAmount,
      gameDetails
    });
  } catch (error) {
    console.error('Erro ao salvar resultado do jogo:', error);
  }
}

// Função para calcular estatísticas do jogador
export function calculatePlayerStats(games: any[]) {
  try {
    const totalGames = games.length;
    const wins = games.filter(game => game.playerWin).length;
    const losses = totalGames - wins;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
    
    const totalBet = games.reduce((sum, game) => sum + game.betAmount, 0);
    const totalWinnings = games
      .filter(game => game.playerWin)
      .reduce((sum, game) => sum + (game.betAmount * 1.8), 0);
    const totalLosses = games
      .filter(game => !game.playerWin)
      .reduce((sum, game) => sum + game.betAmount, 0);
    
    const netProfit = totalWinnings - totalLosses;

    return {
      totalGames,
      wins,
      losses,
      winRate,
      totalBet,
      totalWinnings,
      totalLosses,
      netProfit
    };
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalBet: 0,
      totalWinnings: 0,
      totalLosses: 0,
      netProfit: 0
    };
  }
}