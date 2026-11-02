import { NextRequest, NextResponse } from "next/server";

interface StoredSignal {
  id: string;
  roomId: string;
  senderPeerId: string;
  senderName: string;
  senderRole?: string;
  targetPeerId?: string;
  type: string;
  sdp?: any;
  candidate?: any;
  chat?: any;
  state?: any;
  timestamp: number;
}

// In-memory global signal bus across normal and incognito browser tabs
const globalSignalBus: Map<string, StoredSignal[]> = new Map();

// Helper to clean stale messages older than 45 seconds
function cleanupRoom(roomId: string) {
  const cutoff = Date.now() - 45000;
  const messages = globalSignalBus.get(roomId);
  if (messages) {
    const valid = messages.filter((m) => m.timestamp > cutoff);
    if (valid.length === 0) {
      globalSignalBus.delete(roomId);
    } else {
      globalSignalBus.set(roomId, valid);
    }
  }
}

// POST: Publish a WebRTC signal message (join, offer, answer, ice-candidate, chat, leave)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, senderPeerId, senderName, type } = body;

    if (!roomId || !senderPeerId || !type) {
      return NextResponse.json({ error: "Missing required signal parameters" }, { status: 400 });
    }

    const newSignal: StoredSignal = {
      id: `sig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      roomId,
      senderPeerId,
      senderName: senderName || "Participant",
      senderRole: body.senderRole,
      targetPeerId: body.targetPeerId,
      type,
      sdp: body.sdp,
      candidate: body.candidate,
      chat: body.chat,
      state: body.state,
      timestamp: Date.now(),
    };

    if (!globalSignalBus.has(roomId)) {
      globalSignalBus.set(roomId, []);
    }

    const roomSignals = globalSignalBus.get(roomId)!;
    roomSignals.push(newSignal);

    // Keep max 100 recent signals per room
    if (roomSignals.length > 100) {
      roomSignals.shift();
    }

    cleanupRoom(roomId);

    return NextResponse.json({ success: true, signalId: newSignal.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process signal" }, { status: 500 });
  }
}

// GET: Retrieve signals for a specific peer in a room
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const peerId = searchParams.get("peerId");
  const since = parseInt(searchParams.get("since") || "0", 10);

  if (!roomId || !peerId) {
    return NextResponse.json({ error: "roomId and peerId are required" }, { status: 400 });
  }

  cleanupRoom(roomId);

  const roomSignals = globalSignalBus.get(roomId) || [];

  // Filter signals:
  // 1. Must be newer than `since`
  // 2. Must NOT be sent by this peer
  // 3. Must be either broadcast or targeted specifically to this peer
  const relevant = roomSignals.filter((sig) => {
    if (sig.timestamp <= since) return false;
    if (sig.senderPeerId === peerId) return false;
    if (sig.targetPeerId && sig.targetPeerId !== peerId) return false;
    return true;
  });

  return NextResponse.json({
    signals: relevant,
    serverTime: Date.now(),
  });
}
