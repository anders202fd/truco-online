import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Room from '@/models/Room';
import User from '@/models/User';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Find user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find room
    const room = await Room.findById(params.id);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check if room is full
    if (room.players.length >= room.maxPlayers) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    // Check if user is already in room
    if (room.players.includes(user._id)) {
      return NextResponse.json({ error: 'Already in room' }, { status: 400 });
    }

    // Add user to room
    room.players.push(user._id);
    await room.save();

    await room.populate('players', 'name email');

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}