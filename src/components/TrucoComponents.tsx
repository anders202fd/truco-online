'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spade, Heart, Diamond, Club } from 'lucide-react'

interface TrucoCardProps {
  card: string
  isRevealed?: boolean
  isWinner?: boolean
  className?: string
}

export function TrucoCard({ card, isRevealed = true, isWinner = false, className = '' }: TrucoCardProps) {
  const getCardIcon = (cardStr: string) => {
    if (cardStr.includes('♠️')) return <Spade className="w-6 h-6 text-black" />
    if (cardStr.includes('♥️')) return <Heart className="w-6 h-6 text-red-500" />
    if (cardStr.includes('♦️')) return <Diamond className="w-6 h-6 text-red-500" />
    if (cardStr.includes('♣️')) return <Club className="w-6 h-6 text-black" />
    return null
  }

  const getCardValue = (cardStr: string) => {
    return cardStr.replace(/[♠️♥️♦️♣️]/g, '')
  }

  return (
    <div className={`relative ${className}`}>
      <Card className={`
        w-20 h-28 flex items-center justify-center transition-all duration-300 transform hover:scale-105
        ${isWinner ? 'ring-2 ring-yellow-400 shadow-lg' : ''}
        ${isRevealed ? 'bg-white' : 'bg-gradient-to-br from-blue-600 to-blue-800'}
      `}>
        <CardContent className="p-2 flex flex-col items-center justify-center">
          {isRevealed ? (
            <>
              <div className="text-lg font-bold text-center">
                {getCardValue(card)}
              </div>
              {getCardIcon(card)}
            </>
          ) : (
            <div className="text-white text-xs">🃏</div>
          )}
        </CardContent>
      </Card>
      {isWinner && (
        <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs">
          Venceu
        </Badge>
      )}
    </div>
  )
}

interface GameTableProps {
  playerCards: string[]
  opponentCards: string[]
  gameResult?: any
  onPlayAgain?: () => void
}

export function GameTable({ playerCards, opponentCards, gameResult, onPlayAgain }: GameTableProps) {
  const [showCards, setShowCards] = useState(false)

  useEffect(() => {
    if (gameResult) {
      const timer = setTimeout(() => setShowCards(true), 500)
      return () => clearTimeout(timer)
    }
  }, [gameResult])

  return (
    <div className="relative">
      {/* Mesa de Truco */}
      <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-2xl p-8 shadow-2xl">
        <div className="text-center text-white mb-6">
          <h3 className="text-2xl font-bold mb-2">Mesa de Truco</h3>
          <div className="w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
        </div>

        {/* Cartas do Oponente */}
        <div className="mb-8">
          <p className="text-white/80 text-sm mb-3 text-center">Oponente</p>
          <div className="flex justify-center space-x-3">
            {opponentCards.map((card, index) => (
              <TrucoCard
                key={index}
                card={card}
                isRevealed={showCards}
                isWinner={gameResult?.gameDetails.rounds[index]?.winner === 'opponent'}
              />
            ))}
          </div>
        </div>

        {/* Área Central - Resultado */}
        {gameResult && (
          <div className="text-center mb-8">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex justify-center space-x-8 mb-4">
                <div className="text-center">
                  <p className="text-white/80 text-sm">Você</p>
                  <p className="text-3xl font-bold text-white">{gameResult.gameDetails.playerScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/80 text-sm">Oponente</p>
                  <p className="text-3xl font-bold text-white">{gameResult.gameDetails.opponentScore}</p>
                </div>
              </div>
              <p className="text-white text-lg font-semibold">
                {gameResult.playerWin ? '🎉 Você Ganhou!' : '😢 Você Perdeu!'}
              </p>
            </div>
          </div>
        )}

        {/* Cartas do Jogador */}
        <div>
          <p className="text-white/80 text-sm mb-3 text-center">Suas Cartas</p>
          <div className="flex justify-center space-x-3">
            {playerCards.map((card, index) => (
              <TrucoCard
                key={index}
                card={card}
                isRevealed={true}
                isWinner={gameResult?.gameDetails.rounds[index]?.winner === 'player'}
              />
            ))}
          </div>
        </div>

        {/* Botão Jogar Novamente */}
        {gameResult && onPlayAgain && (
          <div className="text-center mt-8">
            <Button
              onClick={onPlayAgain}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-8 py-3"
            >
              Jogar Novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
}

export function StatsCard({ title, value, subtitle, trend = 'neutral', icon }: StatsCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${getTrendColor()}`}>{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="text-gray-400">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}