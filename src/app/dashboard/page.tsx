'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Coins, 
  CreditCard, 
  Trophy, 
  Settings, 
  LogOut, 
  Shield, 
  Globe,
  Play,
  Eye,
  EyeOff
} from 'lucide-react';

interface Room {
  _id: string;
  name: string;
  isPrivate: boolean;
  players: string[];
  maxPlayers: number;
  status: string;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [balance, setBalance] = useState(0);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roomForm, setRoomForm] = useState({ 
    name: '', 
    isPrivate: false, 
    password: '',
    maxPlayers: 4 
  });
  const [rechargeAmount, setRechargeAmount] = useState('');

  useEffect(() => {
    fetchRooms();
    fetchBalance();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/user/balance');
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const createRoom = async () => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomForm)
      });
      if (res.ok) {
        setShowCreateRoom(false);
        setRoomForm({ name: '', isPrivate: false, password: '', maxPlayers: 4 });
        fetchRooms();
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const recharge = async () => {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) return;
    
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: parseFloat(rechargeAmount), 
          userId: session?.user?.id 
        })
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.init_point;
      }
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
      });
      if (res.ok) {
        router.push(`/room/${roomId}`);
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const publicRooms = rooms.filter(room => !room.isPrivate);
  const privateRooms = rooms.filter(room => room.isPrivate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600">Bem-vindo, {session?.user?.name}!</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              <Play className="mr-2 h-4 w-4" />
              Voltar ao Jogo
            </Button>
            <Button
              onClick={() => signOut()}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <Coins className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {balance.toFixed(2)}
              </div>
              <Dialog open={showRecharge} onOpenChange={setShowRecharge}>
                <DialogTrigger asChild>
                  <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Recarregar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Recarregar Saldo</DialogTitle>
                    <DialogDescription>
                      Adicione créditos à sua conta usando o Mercado Pago
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Valor (R$)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        min="1"
                        step="0.01"
                      />
                    </div>
                    <Button 
                      onClick={recharge} 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={!rechargeAmount || parseFloat(rechargeAmount) <= 0}
                    >
                      Pagar com Mercado Pago
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salas Ativas</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rooms.length}</div>
              <p className="text-xs text-muted-foreground">
                {publicRooms.length} públicas, {privateRooms.length} privadas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ranking</CardTitle>
              <Trophy className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#-</div>
              <p className="text-xs text-muted-foreground">
                Em breve
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Create Room Button */}
        <div className="mb-8">
          <Dialog open={showCreateRoom} onOpenChange={setShowCreateRoom}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="mr-2 h-5 w-5" />
                Criar Nova Sala
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Sala</DialogTitle>
                <DialogDescription>
                  Configure sua sala de Truco
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roomName">Nome da Sala</Label>
                  <Input
                    id="roomName"
                    placeholder="Ex: Sala do João"
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxPlayers">Máximo de Jogadores</Label>
                  <Input
                    id="maxPlayers"
                    type="number"
                    min="2"
                    max="6"
                    value={roomForm.maxPlayers}
                    onChange={(e) => setRoomForm({ ...roomForm, maxPlayers: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="private"
                    checked={roomForm.isPrivate}
                    onCheckedChange={(checked) => setRoomForm({ ...roomForm, isPrivate: checked })}
                  />
                  <Label htmlFor="private">Sala Privada</Label>
                </div>

                {roomForm.isPrivate && (
                  <div>
                    <Label htmlFor="password">Senha da Sala</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite uma senha"
                        value={roomForm.password}
                        onChange={(e) => setRoomForm({ ...roomForm, password: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={createRoom} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={!roomForm.name || (roomForm.isPrivate && !roomForm.password)}
                >
                  Criar Sala
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rooms Grid */}
        <div className="space-y-8">
          {/* Public Rooms */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Globe className="mr-2 h-6 w-6 text-emerald-600" />
              Salas Públicas
            </h2>
            {publicRooms.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 text-lg">Nenhuma sala pública disponível</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicRooms.map((room) => (
                  <Card key={room._id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{room.name}</CardTitle>
                        <Badge 
                          variant={room.status === 'waiting' ? 'default' : 'secondary'}
                          className={room.status === 'waiting' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {room.status === 'waiting' ? 'Aguardando' : 'Jogando'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          {room.players.length}/{room.maxPlayers}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="h-4 w-4 mr-1" />
                          Pública
                        </div>
                      </div>
                      <Button 
                        onClick={() => joinRoom(room._id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={room.players.length >= room.maxPlayers}
                      >
                        {room.players.length >= room.maxPlayers ? 'Sala Cheia' : 'Entrar'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Private Rooms */}
          {privateRooms.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="mr-2 h-6 w-6 text-purple-600" />
                Salas Privadas
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {privateRooms.map((room) => (
                  <Card key={room._id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{room.name}</CardTitle>
                        <Badge 
                          variant={room.status === 'waiting' ? 'default' : 'secondary'}
                          className={room.status === 'waiting' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {room.status === 'waiting' ? 'Aguardando' : 'Jogando'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          {room.players.length}/{room.maxPlayers}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Shield className="h-4 w-4 mr-1" />
                          Privada
                        </div>
                      </div>
                      <Button 
                        onClick={() => joinRoom(room._id)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={room.players.length >= room.maxPlayers}
                      >
                        {room.players.length >= room.maxPlayers ? 'Sala Cheia' : 'Entrar'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}