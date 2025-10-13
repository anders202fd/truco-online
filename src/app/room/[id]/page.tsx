'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, 
  ArrowLeft, 
  Play, 
  Pause, 
  Trophy, 
  Coins,
  MessageCircle,
  Send,
  Crown,
  Zap
} from 'lucide-react';

interface Room {
  _id: string;
  name: string;
  isPrivate: boolean;
  players: any[];
  maxPlayers: number;
  status: string;
}

interface GameState {
  currentPlayer: number;
  round: number;
  scores: number[];
  cards: string[][];
  playedCards: string[];
  trucoLevel: number;
  canTruco: boolean;
}

export default function RoomPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  
  const [room, setRoom] = useState<Room | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showBetDialog, setShowBetDialog] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [playerIndex, setPlayerIndex] = useState(-1);

  useEffect(() => {
    if (roomId) {
      fetchRoom();
      // Simular WebSocket para atualizações em tempo real
      const interval = setInterval(fetchRoom, 2000);
      return () => clearInterval(interval);
    }
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      if (res.ok) {
        const data = await res.json();
        setRoom(data);
        
        // Encontrar índice do jogador atual
        const currentPlayerIndex = data.players.findIndex(
          (p: any) => p._id === session?.user?.id
        );
        setPlayerIndex(currentPlayerIndex);
        
        // Simular estado do jogo
        if (data.status === 'playing') {
          setGameState({
            currentPlayer: 0,
            round: 1,
            scores: [0, 0],
            cards: [
              ['4_copas', '7_espadas', '1_ouros'],
              ['2_paus', '11_copas', '5_espadas'],
              ['3_ouros', '12_paus', '6_copas'],
              ['10_espadas', '1_paus', '7_ouros']
            ],
            playedCards: [],
            trucoLevel: 1,
            canTruco: true
          });
        }
      }
    } catch (error) {
      console.error('Error fetching room:', error);
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/start`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchRoom();
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const playCard = (cardIndex: number) => {
    if (!gameState || gameState.currentPlayer !== playerIndex) return;
    
    // Simular jogada
    const newPlayedCards = [...gameState.playedCards, gameState.cards[playerIndex][cardIndex]];
    const newCards = [...gameState.cards];
    newCards[playerIndex].splice(cardIndex, 1);
    
    setGameState({
      ...gameState,
      playedCards: newPlayedCards,
      cards: newCards,
      currentPlayer: (gameState.currentPlayer + 1) % room!.players.length
    });
  };

  const callTruco = () => {
    if (!gameState || !gameState.canTruco) return;
    
    setGameState({
      ...gameState,
      trucoLevel: gameState.trucoLevel + 1,
      canTruco: false
    });
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      user: session?.user?.name,
      text: newMessage,
      timestamp: new Date()
    };
    
    setChatMessages([...chatMessages, message]);
    setNewMessage('');
  };

  const leaveRoom = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">Sala não encontrada</p>
            <Button onClick={() => router.push('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTrucoText = (level: number) => {
    const levels = ['', 'Truco!', 'Seis!', 'Nove!', 'Doze!'];
    return levels[level] || 'Truco!';
  };

  const getCardDisplay = (card: string) => {
    const [rank, suit] = card.split('_');
    const suitSymbols: { [key: string]: string } = {
      'copas': '♥️',
      'ouros': '♦️',
      'espadas': '♠️',
      'paus': '♣️'
    };
    return `${rank} ${suitSymbols[suit]}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={leaveRoom}
              variant="outline"
              size="sm"
              className="border-gray-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Sair da Sala
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
              <p className="text-gray-600">
                {room.players.length}/{room.maxPlayers} jogadores
              </p>
            </div>
          </div>
          <Badge 
            variant={room.status === 'waiting' ? 'default' : 'secondary'}
            className={`text-lg px-4 py-2 ${
              room.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' : 
              room.status === 'playing' ? 'bg-green-100 text-green-800' : ''
            }`}
          >
            {room.status === 'waiting' ? 'Aguardando Jogadores' : 
             room.status === 'playing' ? 'Jogando' : 'Finalizado'}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Players */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Jogadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: room.maxPlayers }).map((_, index) => {
                    const player = room.players[index];
                    const isCurrentPlayer = gameState?.currentPlayer === index;
                    const isMe = player?._id === session?.user?.id;
                    
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isCurrentPlayer ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                        } ${isMe ? 'ring-2 ring-blue-300' : ''}`}
                      >
                        {player ? (
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              {isMe && <Crown className="h-4 w-4 text-yellow-500 mr-1" />}
                              <span className="font-medium">{player.name}</span>
                            </div>
                            {gameState && (
                              <div className="text-sm text-gray-600">
                                {gameState.cards[index]?.length || 0} cartas
                              </div>
                            )}
                            {isCurrentPlayer && (
                              <Badge className="mt-2 bg-emerald-100 text-emerald-800">
                                Sua vez
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-gray-400">
                            <Users className="h-8 w-8 mx-auto mb-2" />
                            <span className="text-sm">Aguardando...</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Game Controls */}
            {room.status === 'waiting' && room.players.length >= 2 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="text-center py-8">
                  <Button
                    onClick={startGame}
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Iniciar Jogo
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Game Board */}
            {gameState && (
              <div className="space-y-6">
                {/* Played Cards */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Mesa</CardTitle>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-blue-100 text-blue-800">
                          Rodada {gameState.round}
                        </Badge>
                        {gameState.trucoLevel > 1 && (
                          <Badge className="bg-red-100 text-red-800">
                            {getTrucoText(gameState.trucoLevel)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-h-[120px]">
                      {gameState.playedCards.map((card, index) => (
                        <div
                          key={index}
                          className="bg-white border-2 border-gray-300 rounded-lg p-4 text-center shadow-md"
                        >
                          <div className="text-2xl font-bold">
                            {getCardDisplay(card)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Player's Hand */}
                {playerIndex >= 0 && gameState.cards[playerIndex] && (
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Suas Cartas</CardTitle>
                        <div className="flex gap-2">
                          {gameState.canTruco && gameState.currentPlayer === playerIndex && (
                            <Button
                              onClick={callTruco}
                              variant="outline"
                              className="border-red-500 text-red-600 hover:bg-red-50"
                            >
                              <Zap className="mr-2 h-4 w-4" />
                              {getTrucoText(gameState.trucoLevel + 1)}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center gap-4">
                        {gameState.cards[playerIndex].map((card, index) => (
                          <button
                            key={index}
                            onClick={() => playCard(index)}
                            disabled={gameState.currentPlayer !== playerIndex}
                            className={`bg-white border-2 rounded-lg p-6 text-center shadow-md transition-all hover:shadow-lg ${
                              gameState.currentPlayer === playerIndex
                                ? 'border-emerald-500 hover:bg-emerald-50 cursor-pointer'
                                : 'border-gray-300 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <div className="text-3xl font-bold">
                              {getCardDisplay(card)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Score */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="mr-2 h-5 w-5" />
                      Placar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {gameState.scores[0]}
                        </div>
                        <div className="text-sm text-gray-600">Nós</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600">
                          {gameState.scores[1]}
                        </div>
                        <div className="text-sm text-gray-600">Eles</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="p-2 bg-gray-50 rounded">
                      <div className="font-medium text-sm">{message.user}</div>
                      <div className="text-sm text-gray-600">{message.text}</div>
                    </div>
                  ))}
                  {chatMessages.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      Nenhuma mensagem ainda
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite uma mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bet Dialog */}
      <Dialog open={showBetDialog} onOpenChange={setShowBetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fazer Aposta</DialogTitle>
            <DialogDescription>
              Defina o valor da sua aposta para esta partida
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Valor da Aposta (R$)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min="0.01"
                step="0.01"
              />
            </div>
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={!betAmount || parseFloat(betAmount) <= 0}
            >
              <Coins className="mr-2 h-4 w-4" />
              Confirmar Aposta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}