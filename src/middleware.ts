import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request: NextRequest) {
  // Verificar se é uma rota protegida
  if (request.nextUrl.pathname.startsWith('/api/truco') || 
      request.nextUrl.pathname.startsWith('/api/rooms') ||
      request.nextUrl.pathname.startsWith('/api/transactions')) {
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token de acesso necessário' },
        { status: 401 }
      )
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/truco/:path*',
    '/api/rooms/:path*',
    '/api/transactions/:path*'
  ]
}