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

interface RoomMember {
  peerId: string;
  name: string;
  role: string;
  lastSeen: number;
  micMuted?: boolean;
  camOff?: boolean;
}

// In-memory global state attached to globalThis to survive Next.js dev HMR reloads and worker isolation
const globalSignalBus: Map<string, StoredSignal[]> =
  (globalThis as any).__nexusMeetingSignals || new Map();
(globalThis as any).__nexusMeetingSignals = globalSignalBus;

const globalRoomMembers: Map<string, Map<string, RoomMember>> =
  (globalThis as any).__nexusRoomMembers || new Map();
(globalThis as any).__nexusRoomMembers = globalRoomMembers;

// Helper to clean stale messages older than 45 seconds and members inactive > 15 seconds
function cleanupRoom(roomId: string) {
  const signalCutoff = Date.now() - 45000;
  const messages = globalSignalBus.get(roomId);
  if (messages) {
    const valid = messages.filter((m) => m.timestamp > signalCutoff);
    if (valid.length === 0) {
      globalSignalBus.delete(roomId);
    } else {
      globalSignalBus.set(roomId, valid);
    }
  }

  const memberCutoff = Date.now() - 15000;
  const members = globalRoomMembers.get(roomId);
  if (members) {
    for (const [peerId, member] of members.entries()) {
      if (member.lastSeen < memberCutoff) {
        members.delete(peerId);
      }
    }
    if (members.size === 0) {
      globalRoomMembers.delete(roomId);
    }
  }
}

// POST: Publish a WebRTC signal message (peer-join, sdp-offer, sdp-answer, ice-candidate, peer-state, chat, peer-leave)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, senderPeerId, senderName, type } = body;

    if (!roomId || !senderPeerId || !type) {
      return NextResponse.json({ error: "Missing required signal parameters" }, { status: 400 });
    }

    const now = Date.now();

    // Ensure room members map exists
    if (!globalRoomMembers.has(roomId)) {
      globalRoomMembers.set(roomId, new Map());
    }
    const roomMembers = globalRoomMembers.get(roomId)!;

    // Track active members
    if (type === "peer-join") {
      roomMembers.set(senderPeerId, {
        peerId: senderPeerId,
        name: senderName || "Participant",
        role: body.senderRole || "Participant",
        lastSeen: now,
        micMuted: false,
        camOff: false,
      });
    } else if (type === "peer-state") {
      const existing = roomMembers.get(senderPeerId);
      if (existing) {
        if (body.state?.micMuted !== undefined) existing.micMuted = body.state.micMuted;
        if (body.state?.camOff !== undefined) existing.camOff = body.state.camOff;
        existing.lastSeen = now;
      }
    } else if (type === "peer-leave") {
      roomMembers.delete(senderPeerId);
    } else {
      // Any other signal updates sender's lastSeen heartbeat
      const existing = roomMembers.get(senderPeerId);
      if (existing) {
        existing.lastSeen = now;
      } else {
        roomMembers.set(senderPeerId, {
          peerId: senderPeerId,
          name: senderName || "Participant",
          role: body.senderRole || "Participant",
          lastSeen: now,
        });
      }
    }

    const newSignal: StoredSignal = {
      id: `sig_${now}_${Math.random().toString(36).substring(2, 7)}`,
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
      timestamp: now,
    };

    if (!globalSignalBus.has(roomId)) {
      globalSignalBus.set(roomId, []);
    }

    const roomSignals = globalSignalBus.get(roomId)!;
    roomSignals.push(newSignal);

    // Keep max 150 recent signals per room
    if (roomSignals.length > 150) {
      roomSignals.shift();
    }

    cleanupRoom(roomId);

    return NextResponse.json({
      success: true,
      signalId: newSignal.id,
      activeMembersCount: roomMembers.size,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process signal" }, { status: 500 });
  }
}

// GET: Retrieve signals and active room members for a specific peer in a room
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const peerId = searchParams.get("peerId");
  const since = parseInt(searchParams.get("since") || "0", 10);

  if (!roomId || !peerId) {
    return NextResponse.json({ error: "roomId and peerId are required" }, { status: 400 });
  }

  cleanupRoom(roomId);

  const now = Date.now();
  const roomMembers = globalRoomMembers.get(roomId);

  // Update peer heartbeat if registered
  if (roomMembers && roomMembers.has(peerId)) {
    roomMembers.get(peerId)!.lastSeen = now;
  }

  // Get other members in room
  const otherMembers: RoomMember[] = [];
  if (roomMembers) {
    for (const [id, m] of roomMembers.entries()) {
      if (id !== peerId) {
        otherMembers.push(m);
      }
    }
  }

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
    members: otherMembers,
    totalMembers: (roomMembers ? roomMembers.size : 1),
    serverTime: now,
  });
}
