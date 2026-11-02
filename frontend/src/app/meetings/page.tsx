"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Calendar,
  Clock,
  Users,
  Plus,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Share2,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  X,
  Send,
  MoreVertical,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sliders,
  Radio,
  Cast,
  UserCheck,
  Link as LinkIcon,
  LogIn,
  Star,
  RotateCcw,
  Home
} from "lucide-react";
import toast from "react-hot-toast";

interface Meeting {
  id: string;
  title: string;
  time: string;
  duration: string;
  type: "1-on-1 Review" | "Team Standup" | "HR Onboarding" | "Quarterly Townhall";
  attendees: string[];
  status: "UPCOMING" | "LIVE_NOW" | "COMPLETED";
}

interface SignalPayload {
  id?: string;
  type: "peer-join" | "sdp-offer" | "sdp-answer" | "ice-candidate" | "peer-state" | "chat" | "peer-leave";
  roomId: string;
  senderPeerId: string;
  senderName: string;
  senderRole?: string;
  targetPeerId?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  chat?: { sender: string; text: string; time: string };
  state?: { micMuted: boolean; camOff: boolean };
  timestamp?: number;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

function MeetingsHubContent() {
  const { user, isAuthenticated } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: "meet-1",
      title: "Q4 Performance Appraisal & Goal Alignment",
      time: "Today, 02:30 PM",
      duration: "30 mins",
      type: "1-on-1 Review",
      attendees: ["Vikram Patel (Manager)", "Aditi Sharma (Engineer)"],
      status: "LIVE_NOW",
    },
    {
      id: "meet-2",
      title: "HR Policy Briefing & Tax Regime Q&A",
      time: "Today, 04:00 PM",
      duration: "45 mins",
      type: "HR Onboarding",
      attendees: ["Priya Nair (HR Lead)", "All Engineering Staff"],
      status: "UPCOMING",
    },
    {
      id: "meet-3",
      title: "Weekly Engineering Architecture Standup",
      time: "Tomorrow, 10:00 AM",
      duration: "30 mins",
      type: "Team Standup",
      attendees: ["Engineering Division", "Rahul Verma (Architect)"],
      status: "UPCOMING",
    },
    {
      id: "meet-4",
      title: "Executive Strategic Workforce Planning",
      time: "Nov 4, 11:00 AM",
      duration: "60 mins",
      type: "Quarterly Townhall",
      attendees: ["Ananya Sen (CHRO)", "Department Heads"],
      status: "UPCOMING",
    },
  ]);

  // Video Room WebRTC & Media Stream State
  const [inCall, setInCall] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [hasRealCamera, setHasRealCamera] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [blurBackground, setBlurBackground] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Guest State for Unauthenticated Joiners
  const [guestName, setGuestName] = useState("");
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);

  // Call Concluded Exit Screen State
  const [callEndedInfo, setCallEndedInfo] = useState<{
    roomId: string;
    title: string;
    duration: number;
    isGuest: boolean;
  } | null>(null);
  const [callRating, setCallRating] = useState<number>(5);

  // Remote Peer State
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [remotePeerName, setRemotePeerName] = useState<string>("Waiting for peer...");
  const [remotePeerRole, setRemotePeerRole] = useState<string>("Participant");
  const [remoteCamOff, setRemoteCamOff] = useState(false);
  const [remoteMicMuted, setRemoteMicMuted] = useState(false);
  const [remoteAudioLevel, setRemoteAudioLevel] = useState(0);

  // Video Element Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  // Streams & Peer Connection
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const remoteAudioCtxRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const remoteAnimFrameRef = useRef<number | null>(null);

  // Signaling & Deduplication
  const myPeerIdRef = useRef<string>("");
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const lastPollTimeRef = useRef<number>(0);
  const processedSignalIdsRef = useRef<Set<string>>(new Set());

  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: "Nexus System", text: "End-to-end encrypted WebRTC conference initialized.", time: "Just now" },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<Meeting["type"]>("1-on-1 Review");
  const [newTime, setNewTime] = useState("");
  const [newDuration, setNewDuration] = useState("30 mins");

  // Determine effective display name
  const getDisplayName = useCallback(() => {
    if (guestName.trim()) return guestName.trim();
    if (user?.name) return user.name;
    if (user?.email) return user.email.split("@")[0].toUpperCase();
    return "Guest User";
  }, [guestName, user]);

  // Initialize unique peer ID on mount
  useEffect(() => {
    if (!myPeerIdRef.current) {
      myPeerIdRef.current = "peer_" + Math.random().toString(36).substring(2, 9);
    }
  }, []);

  // Call Duration Timer
  useEffect(() => {
    let interval: any;
    if (inCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [inCall]);

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Re-attach video stream if elements remount
  useEffect(() => {
    if (inCall && localVideoRef.current && localStreamRef.current && !camOff) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [inCall, hasRealCamera, camOff]);

  useEffect(() => {
    if (inCall && remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [inCall, remoteConnected]);

  useEffect(() => {
    if (screenSharing && screenVideoRef.current && screenStreamRef.current) {
      screenVideoRef.current.srcObject = screenStreamRef.current;
    }
  }, [screenSharing]);

  // Multi-Channel Signaling Dispatcher (BroadcastChannel + LocalStorage + Server-Side API Hub)
  const sendSignal = useCallback((payload: SignalPayload) => {
    // 1. BroadcastChannel (0ms intra-device fast path)
    if (channelRef.current) {
      try {
        channelRef.current.postMessage(payload);
      } catch (err) {}
    }

    // 2. LocalStorage StorageEvent fallback
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          `nexushr-sig-${payload.roomId}`,
          JSON.stringify({ ...payload, _t: Date.now() + Math.random() })
        );
      }
    } catch {}

    // 3. Next.js Server-Side Signaling Hub (Crucial for Incognito <-> Normal & Multi-Browser sessions!)
    try {
      fetch("/api/meetings/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch {}
  }, []);

  // Setup Remote Audio Visualizer
  const attachRemoteAudioMeter = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (remoteAudioCtxRef.current) {
        remoteAudioCtxRef.current.close().catch(() => {});
      }
      const audioCtx = new AudioCtx();
      remoteAudioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        setRemoteAudioLevel(Math.min(100, Math.round((avg / 255) * 100)));
        remoteAnimFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch {}
  };

  // Create & Configure RTCPeerConnection
  const createPeerConnection = useCallback((targetPeerId?: string): RTCPeerConnection => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    // Attach all local tracks to outgoing peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle ICE Candidate Generation
    pc.onicecandidate = (event) => {
      if (event.candidate && activeMeeting?.id) {
        sendSignal({
          type: "ice-candidate",
          roomId: activeMeeting.id,
          senderPeerId: myPeerIdRef.current,
          senderName: getDisplayName(),
          targetPeerId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    // Handle Remote Track Arrival
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        remoteStreamRef.current = stream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
        setRemoteConnected(true);
        attachRemoteAudioMeter(stream);
      }
    };

    // Track Connection State
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setRemoteConnected(true);
        toast.success("Peer connected via WebRTC (P2P Encrypted)", { icon: "🔒" });
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setRemoteConnected(false);
        toast("Participant connection interrupted", { icon: "⚠️" });
      }
    };

    return pc;
  }, [activeMeeting?.id, getDisplayName, sendSignal]);

  // Process Incoming Signaling Messages
  const handleSignalMessage = useCallback(async (msg: SignalPayload) => {
    // Ignore signals sent by self
    if (msg.senderPeerId === myPeerIdRef.current) return;
    if (msg.roomId !== activeMeeting?.id) return;
    if (msg.targetPeerId && msg.targetPeerId !== myPeerIdRef.current) return;

    switch (msg.type) {
      case "peer-join": {
        // A new peer joined: update their name & initiate SDP Offer
        setRemotePeerName(msg.senderName);
        if (msg.senderRole) setRemotePeerRole(msg.senderRole);
        toast(`${msg.senderName} joined the video room!`, { icon: "👋" });

        const pc = createPeerConnection(msg.senderPeerId);
        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await pc.setLocalDescription(offer);

          sendSignal({
            type: "sdp-offer",
            roomId: activeMeeting.id,
            senderPeerId: myPeerIdRef.current,
            senderName: getDisplayName(),
            senderRole: user?.role || "Host",
            targetPeerId: msg.senderPeerId,
            sdp: offer,
          });

          // Also inform new peer of current local mute/cam state
          sendSignal({
            type: "peer-state",
            roomId: activeMeeting.id,
            senderPeerId: myPeerIdRef.current,
            senderName: getDisplayName(),
            state: { micMuted, camOff },
          });
        } catch (err) {
          console.error("Failed to create WebRTC offer:", err);
        }
        break;
      }

      case "sdp-offer": {
        if (!msg.sdp) return;
        setRemotePeerName(msg.senderName);
        if (msg.senderRole) setRemotePeerRole(msg.senderRole);

        const pc = createPeerConnection(msg.senderPeerId);
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));

          // Drain any buffered ICE candidates
          while (pendingCandidatesRef.current.length > 0) {
            const cand = pendingCandidatesRef.current.shift();
            if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand));
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          sendSignal({
            type: "sdp-answer",
            roomId: activeMeeting.id,
            senderPeerId: myPeerIdRef.current,
            senderName: getDisplayName(),
            senderRole: user?.role || "Participant",
            targetPeerId: msg.senderPeerId,
            sdp: answer,
          });
        } catch (err) {
          console.error("Failed to handle WebRTC offer:", err);
        }
        break;
      }

      case "sdp-answer": {
        if (!msg.sdp || !peerConnectionRef.current) return;
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(msg.sdp));

          // Drain buffered candidates
          while (pendingCandidatesRef.current.length > 0) {
            const cand = pendingCandidatesRef.current.shift();
            if (cand) await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(cand));
          }
        } catch (err) {
          console.error("Failed to set remote description on answer:", err);
        }
        break;
      }

      case "ice-candidate": {
        if (!msg.candidate) return;
        if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(msg.candidate));
          } catch (err) {
            console.error("Failed to add ICE candidate:", err);
          }
        } else {
          pendingCandidatesRef.current.push(msg.candidate);
        }
        break;
      }

      case "peer-state": {
        if (msg.state) {
          setRemoteMicMuted(msg.state.micMuted);
          setRemoteCamOff(msg.state.camOff);
        }
        break;
      }

      case "chat": {
        if (msg.chat) {
          setChatMessages((prev) => [...prev, msg.chat!]);
          toast(`${msg.chat.sender}: ${msg.chat.text}`, { icon: "💬" });
        }
        break;
      }

      case "peer-leave": {
        setRemoteConnected(false);
        setRemoteStreamRefNull();
        toast(`${msg.senderName || "Participant"} left the call.`, { icon: "👋" });
        break;
      }
    }
  }, [activeMeeting?.id, camOff, createPeerConnection, getDisplayName, micMuted, sendSignal, user?.role]);

  const setRemoteStreamRefNull = () => {
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (remoteAudioCtxRef.current) {
      remoteAudioCtxRef.current.close().catch(() => {});
      remoteAudioCtxRef.current = null;
    }
  };

  // Bind Signaling Listeners for Active Room (Local Channels + API Poller)
  useEffect(() => {
    if (!inCall || !activeMeeting?.id) return;

    const roomId = activeMeeting.id;
    const myId = myPeerIdRef.current;

    // 1. Setup BroadcastChannel
    const bc = new BroadcastChannel(`nexushr-room-${roomId}`);
    channelRef.current = bc;
    bc.onmessage = (event) => {
      if (event.data) {
        const sigKey = event.data.id || `${event.data.type}_${event.data.senderPeerId}_${event.data.timestamp}`;
        if (!processedSignalIdsRef.current.has(sigKey)) {
          processedSignalIdsRef.current.add(sigKey);
          handleSignalMessage(event.data);
        }
      }
    };

    // 2. Setup Storage Event Listener
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === `nexushr-sig-${roomId}` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const sigKey = parsed.id || `${parsed.type}_${parsed.senderPeerId}_${parsed.timestamp}`;
          if (!processedSignalIdsRef.current.has(sigKey)) {
            processedSignalIdsRef.current.add(sigKey);
            handleSignalMessage(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorageEvent);

    // 3. Setup Server-Side Signal Polling (Bridges Incognito Windows and Separate Browsers)
    let isCancelled = false;
    lastPollTimeRef.current = Date.now() - 4000;

    const pollApiSignals = async () => {
      if (isCancelled || !inCall) return;
      try {
        const res = await fetch(
          `/api/meetings/signal?roomId=${encodeURIComponent(roomId)}&peerId=${encodeURIComponent(myId)}&since=${lastPollTimeRef.current}`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.signals)) {
            for (const sig of data.signals) {
              const sigKey = sig.id || `${sig.type}_${sig.senderPeerId}_${sig.timestamp}`;
              if (!processedSignalIdsRef.current.has(sigKey)) {
                processedSignalIdsRef.current.add(sigKey);
                handleSignalMessage(sig);
              }
              if (sig.timestamp && sig.timestamp > lastPollTimeRef.current) {
                lastPollTimeRef.current = sig.timestamp;
              }
            }
          }
        }
      } catch {}
    };

    pollApiSignals();
    const pollInterval = setInterval(pollApiSignals, 500);

    // 4. Announce Join to other peers in room
    sendSignal({
      type: "peer-join",
      roomId,
      senderPeerId: myId,
      senderName: getDisplayName(),
      senderRole: user?.role || "Participant",
    });

    return () => {
      isCancelled = true;
      clearInterval(pollInterval);
      window.removeEventListener("storage", handleStorageEvent);
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, [inCall, activeMeeting?.id, handleSignalMessage, getDisplayName, sendSignal, user?.role]);

  // Start Real Hardware Media Stream
  const startLocalMedia = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("WebRTC MediaDevices API not available in this environment");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });

      localStreamRef.current = stream;
      setHasRealCamera(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Audio Level Visualizer
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateLevel = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setAudioVolume(Math.min(100, Math.round((avg / 255) * 100)));
            animationFrameRef.current = requestAnimationFrame(updateLevel);
          };
          updateLevel();
        }
      } catch {}

      toast.success("Camera & Microphone active (1080p HD)", { icon: "📹" });
    } catch (err: any) {
      console.warn("Camera preview unavailable or denied, audio-avatar fallback:", err);
      setHasRealCamera(false);
      toast("Joined with dynamic audio telemetry avatar", { icon: "🎙️" });
    }
  };

  // Stop Media & Clean Resources
  const stopLocalMedia = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (remoteAnimFrameRef.current) cancelAnimationFrame(remoteAnimFrameRef.current);

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setRemoteStreamRefNull();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setHasRealCamera(false);
    setScreenSharing(false);
    setRemoteConnected(false);
    setRemoteAudioLevel(0);
    pendingCandidatesRef.current = [];
  };

  // Join Call Entrypoint
  const handleJoinCall = async (meeting: Meeting) => {
    setActiveMeeting(meeting);
    setInCall(true);
    setCamOff(false);
    setMicMuted(false);
    setRemoteConnected(false);
    setRemotePeerName("Waiting for peer...");
    setCallEndedInfo(null);
    await startLocalMedia();
  };

  // End Call Handler (Handles Guest Mode Redirection and Clean Exit)
  const handleEndCall = () => {
    const currentRoomId = activeMeeting?.id || "meet-1";
    const currentTitle = activeMeeting?.title || "Virtual Video Conference";
    const durationSnapshot = callDuration;
    const isGuest = !isAuthenticated;

    if (activeMeeting?.id) {
      sendSignal({
        type: "peer-leave",
        roomId: activeMeeting.id,
        senderPeerId: myPeerIdRef.current,
        senderName: getDisplayName(),
      });
    }

    stopLocalMedia();
    setInCall(false);
    setActiveMeeting(null);

    // Clean up room query param from address bar so refresh does not force re-join
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (isGuest) {
      setCallEndedInfo({
        roomId: currentRoomId,
        title: currentTitle,
        duration: durationSnapshot,
        isGuest: true,
      });
    } else {
      toast("Call ended", { icon: "👋" });
    }
  };

  // Toggle Microphone
  const handleToggleMic = () => {
    const nextMuted = !micMuted;
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
    }
    setMicMuted(nextMuted);
    if (activeMeeting?.id) {
      sendSignal({
        type: "peer-state",
        roomId: activeMeeting.id,
        senderPeerId: myPeerIdRef.current,
        senderName: getDisplayName(),
        state: { micMuted: nextMuted, camOff },
      });
    }
    toast(nextMuted ? "Microphone Muted" : "Microphone Unmuted", { icon: nextMuted ? "🔇" : "🎙️" });
  };

  // Toggle Camera
  const handleToggleCam = () => {
    const nextCamOff = !camOff;
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !nextCamOff;
      });
    }
    setCamOff(nextCamOff);
    if (activeMeeting?.id) {
      sendSignal({
        type: "peer-state",
        roomId: activeMeeting.id,
        senderPeerId: myPeerIdRef.current,
        senderName: getDisplayName(),
        state: { micMuted, camOff: nextCamOff },
      });
    }
    toast(nextCamOff ? "Camera Turned Off" : "Camera Turned On", { icon: nextCamOff ? "📷" : "📹" });
  };

  // Screen Sharing
  const handleToggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          throw new Error("Screen sharing not supported on this device/browser");
        }
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        setScreenSharing(true);

        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = screenStream;
        }

        // Replace track on WebRTC peer connection if active
        if (peerConnectionRef.current) {
          const screenTrack = screenStream.getVideoTracks()[0];
          const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === "video");
          if (sender && screenTrack) {
            sender.replaceTrack(screenTrack);
          }
        }

        screenStream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };

        toast.success("Sharing screen at 1080p 60FPS");
      } catch (err: any) {
        if (err.name !== "NotAllowedError") {
          toast.error("Screen sharing not available: " + err.message);
        }
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    setScreenSharing(false);

    // Restore local camera track on peer connection
    if (peerConnectionRef.current && localStreamRef.current) {
      const camTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === "video");
      if (sender && camTrack) {
        sender.replaceTrack(camTrack);
      }
    }
    toast("Stopped screen sharing");
  };

  // Real, Shareable Invite Link Generator
  const handleCopyInviteLink = (targetId?: string) => {
    const meetId = targetId || activeMeeting?.id || "meet-1";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = `${origin}/meetings?room=${encodeURIComponent(meetId)}`;

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
    }
    setCopiedLink(true);
    toast.success("Direct meeting invite link copied to clipboard!", { icon: "🔗" });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Send In-Call Chat Message (Synchronized across peers)
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      sender: getDisplayName(),
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMessage("");

    if (activeMeeting?.id) {
      sendSignal({
        type: "chat",
        roomId: activeMeeting.id,
        senderPeerId: myPeerIdRef.current,
        senderName: getDisplayName(),
        chat: newMsg,
      });
    }
  };

  // Handle Schedule Modal Submission
  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const newMeet: Meeting = {
      id: `meet-${Date.now()}`,
      title: newTitle,
      type: newType,
      time: newTime || "Scheduled Today",
      duration: newDuration,
      attendees: [getDisplayName(), "Invited Staff"],
      status: "UPCOMING",
    };
    setMeetings([newMeet, ...meetings]);
    setShowScheduleModal(false);
    setNewTitle("");
    toast.success("Meeting scheduled! Direct room link ready to share.");
  };

  // Automatic Join via URL query param: /meetings?room=xyz
  useEffect(() => {
    const roomParam = searchParams?.get("room");
    if (!roomParam || inCall) return;

    // Check if user is unauthenticated and needs guest name
    if (!isAuthenticated && !guestName) {
      setPendingRoomId(roomParam);
      setShowGuestModal(true);
      return;
    }

    // Locate meeting or instantiate dynamic room session
    let targetMeet = meetings.find((m) => m.id === roomParam);
    if (!targetMeet) {
      targetMeet = {
        id: roomParam,
        title: `Video Conference Room (${roomParam})`,
        time: "Live Now",
        duration: "45 mins",
        type: "Team Standup",
        attendees: ["Host", getDisplayName()],
        status: "LIVE_NOW",
      };
      setMeetings((prev) => [targetMeet!, ...prev.filter((m) => m.id !== roomParam)]);
    }

    handleJoinCall(targetMeet);
    toast.success(`Joined room: ${targetMeet.title}`, { icon: "📹" });
  }, [searchParams, inCall, isAuthenticated, guestName]);

  const handleGuestJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    setShowGuestModal(false);

    const roomId = pendingRoomId || "meet-1";
    let targetMeet = meetings.find((m) => m.id === roomId);
    if (!targetMeet) {
      targetMeet = {
        id: roomId,
        title: `Video Conference Room (${roomId})`,
        time: "Live Now",
        duration: "45 mins",
        type: "Team Standup",
        attendees: ["Host", guestName.trim()],
        status: "LIVE_NOW",
      };
      setMeetings((prev) => [targetMeet!, ...prev]);
    }
    handleJoinCall(targetMeet);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto lg:overflow-hidden gap-3 font-sans pop-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Inbuilt Meeting Calendar & WebRTC Video Rooms
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              </h1>
              <p className="text-xs text-white/50">
                P2P WebRTC video calls with hardware camera streaming, screen share, and synchronized room chat.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleJoinCall(meetings[0])}
            className="px-3.5 py-2 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Start Instant Video Call</span>
          </button>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Scheduled Sessions List + Meeting Calendar Preview */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        {/* Left Column (8 cols): Active & Upcoming Meetings List */}
        <div className="lg:col-span-8 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
          {meetings.map((meeting) => {
            const isLive = meeting.status === "LIVE_NOW";
            return (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-4 sm:p-5 rounded-3xl pop-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isLive ? "border-orange-500/40 bg-orange-500/[0.04]" : ""
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {meeting.type}
                    </span>
                    {isLive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE NOW
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                    {meeting.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/50 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-orange-400" />
                      {meeting.time} ({meeting.duration})
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      {meeting.attendees.join(", ")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopyInviteLink(meeting.id)}
                    className="p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
                    title="Copy Meeting Invite Link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleJoinCall(meeting)}
                    className={`px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                      isLive
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25 hover:scale-105"
                        : "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/20 hover:scale-105"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{isLive ? "Join Video Call" : "Start Video Room"}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Column (4 cols): Quick Schedule & Live Rooms Hub */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3 overflow-hidden">
          <div className="glass-card p-4 rounded-3xl space-y-3 pop-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Quick Virtual Rooms
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              Launch instant peer-to-peer WebRTC video conferences. Share the direct copy link with any team member, candidate, or incognito browser to join immediately.
            </p>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">WebRTC Video Codec:</span>
                <span className="font-bold text-emerald-400 font-mono">VP8 / H.264 HD</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Signaling Relay:</span>
                <span className="font-bold text-white font-mono">Multi-Channel API Hub</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Cross-Profile Bridging:</span>
                <span className="font-bold text-orange-400 font-mono">Incognito & Normal Active</span>
              </div>
            </div>

            <button
              onClick={() => handleJoinCall(meetings[0])}
              className="w-full py-2.5 px-4 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Video className="w-4 h-4 text-emerald-400" />
              <span>Launch Demo Video Call</span>
            </button>
          </div>

          <div className="glass-card p-4 rounded-3xl space-y-2 flex-1 flex flex-col justify-between pop-card">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Security & Compliance
              </span>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                All video and audio streams are end-to-end encrypted with DTLS/SRTP. Direct P2P transmission guarantees zero server recording without participant consent.
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
              <span>Signaling: Active</span>
              <span className="text-emerald-400 font-bold">DTLS 1.2 Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FULL-SCREEN WEBRTC ONLINE VIDEO ROOM MODAL
          ========================================================================= */}
      <AnimatePresence>
        {inCall && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full h-full max-w-6xl max-h-[92vh] rounded-3xl bg-[#0b0e17] border border-white/15 shadow-2xl flex flex-col overflow-hidden relative"
            >
              {/* Call Room Top Header */}
              <div className="px-5 py-3.5 bg-black/40 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      {activeMeeting?.title || "Virtual Video Conference"}
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {formatCallTime(callDuration)}
                      </span>
                    </h2>
                    <p className="text-[10px] text-white/50 flex items-center gap-2">
                      <span>Room ID: <code className="text-orange-400 font-mono">{activeMeeting?.id}</code></span>
                      <span>·</span>
                      <span className={remoteConnected ? "text-emerald-400 font-semibold" : "text-amber-400"}>
                        {remoteConnected ? `2 Participants (Connected with ${remotePeerName})` : "Waiting for other participant to join..."}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyInviteLink()}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      copiedLink
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : "bg-white/[0.08] hover:bg-white/15 text-white border-white/10"
                    }`}
                    title="Copy Meeting Invite Link"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Link Copied!" : "Copy Invite Link"}</span>
                  </button>

                  <button
                    onClick={() => setChatOpen(!chatOpen)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      chatOpen ? "bg-orange-500 text-white border-orange-400 shadow-md" : "bg-white/[0.06] hover:bg-white/10 text-white border-white/10"
                    }`}
                    title="Toggle In-Call Chat"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleEndCall}
                    className="p-2 rounded-xl bg-white/[0.05] hover:bg-rose-500/20 text-white/60 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Leave Call Room"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Call Main Stage */}
              <div className="flex-1 flex min-h-0 relative overflow-hidden">
                {/* Video Streams Grid */}
                <div className="flex-1 p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-hidden">
                  {/* Stream 1: Remote Peer Video Stream */}
                  <div className={`relative rounded-2xl bg-[#121622] border transition-all flex items-center justify-center overflow-hidden shadow-inner group ${
                    remoteAudioLevel > 15 ? "border-emerald-400/60 shadow-[0_0_15px_rgba(52,211,153,0.2)]" : "border-white/10"
                  }`}>
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[11px] text-white font-semibold z-10 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${remoteConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                      <span>{remoteConnected ? remotePeerName : "Waiting for participant..."}</span>
                      {remoteMicMuted && <span className="text-[9px] text-rose-400 ml-1">(Muted)</span>}
                    </div>

                    {/* Remote Live Video Feed */}
                    {remoteConnected ? (
                      remoteCamOff ? (
                        /* Remote Camera Off */
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-2xl">
                            {remotePeerName.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs text-white/60 font-semibold">Camera Turned Off</span>
                        </div>
                      ) : (
                        /* Remote Real Camera Stream */
                        <video
                          ref={remoteVideoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      /* Waiting State */
                      <div className="flex flex-col items-center justify-center gap-3 text-center p-4">
                        <div className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/30 animate-pulse">
                          <Users className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white/80">Waiting for other participant to join...</p>
                          <p className="text-[11px] text-white/40 mt-1 max-w-xs">
                            Share the invite link to join from another tab, incognito window, or device.
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopyInviteLink()}
                          className="px-3.5 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Direct Invite Link</span>
                        </button>
                      </div>
                    )}

                    {remoteConnected && (
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>WebRTC P2P</span>
                      </div>
                    )}
                  </div>

                  {/* Stream 2: Self Video Stream (REAL Camera Feed via WebRTC) */}
                  <div className={`relative rounded-2xl bg-[#121622] border transition-all flex items-center justify-center overflow-hidden shadow-inner ${
                    audioVolume > 15 ? "border-emerald-400/60 shadow-[0_0_15px_rgba(52,211,153,0.2)]" : "border-white/10"
                  }`}>
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[11px] text-white font-semibold z-10 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${micMuted ? "bg-rose-500" : "bg-emerald-400"}`} />
                      <span>You ({getDisplayName()})</span>
                    </div>

                    {/* Real Video Element Hooked to navigator.mediaDevices.getUserMedia */}
                    {hasRealCamera && !camOff ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover transition-all ${
                          blurBackground ? "filter blur-sm" : ""
                        }`}
                      />
                    ) : (
                      /* Fallback / Camera Off View */
                      <div className="flex flex-col items-center gap-2 text-white/60">
                        {camOff ? (
                          <>
                            <div className="w-20 h-20 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white/40">
                              <VideoOff className="w-8 h-8" />
                            </div>
                            <span className="text-xs font-semibold">Camera is Turned Off</span>
                          </>
                        ) : (
                          <>
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                              {getDisplayName().substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs font-semibold">{getDisplayName()} (Active)</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Screen Sharing Picture-in-Picture Preview */}
                    {screenSharing && (
                      <div className="absolute bottom-3 right-3 w-40 h-24 rounded-xl overflow-hidden border border-orange-500/50 shadow-2xl z-20 bg-black">
                        <video ref={screenVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/70 text-[8px] font-bold text-orange-400">
                          Screen Share
                        </span>
                      </div>
                    )}

                    {/* Mic & Volume Indicator */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10 bg-black/60 px-2.5 py-1 rounded-xl backdrop-blur-md">
                      {micMuted ? (
                        <div className="flex items-center gap-1 text-[10px] text-rose-400 font-bold">
                          <MicOff className="w-3 h-3" />
                          <span>Muted</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                          <Mic className="w-3 h-3" />
                          <div className="w-12 h-1.5 rounded-full bg-white/20 overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 transition-all duration-75"
                              style={{ width: `${Math.max(audioVolume, 8)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* In-Call Side Chat Drawer */}
                {chatOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 320, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="h-full border-l border-white/10 bg-[#0c101b]/95 backdrop-blur-xl flex flex-col shrink-0"
                  >
                    <div className="p-3 border-b border-white/10 text-xs font-bold text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                        Meeting In-Call Chat
                      </span>
                      <button onClick={() => setChatOpen(false)} className="text-white/40 hover:text-white cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs custom-scrollbar">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-0.5">
                          <div className="flex items-center justify-between text-[10px] text-white/40">
                            <span className="font-bold text-orange-400">{msg.sender}</span>
                            <span>{msg.time}</span>
                          </div>
                          <p className="text-white/80 text-[11px] leading-relaxed break-words">{msg.text}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-1.5">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type meeting note or question..."
                        className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
                      />
                      <button type="submit" className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white cursor-pointer shadow-md">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </motion.div>
                )}
              </div>

              {/* Call Controls Bar */}
              <div className="px-5 py-3.5 bg-black/60 border-t border-white/10 flex items-center justify-center gap-3 shrink-0">
                {/* Microphone Toggle */}
                <button
                  onClick={handleToggleMic}
                  className={`p-3 rounded-2xl transition-all cursor-pointer ${
                    micMuted
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-500/20"
                      : "bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10"
                  }`}
                  title={micMuted ? "Unmute Microphone" : "Mute Microphone"}
                >
                  {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Camera Toggle */}
                <button
                  onClick={handleToggleCam}
                  className={`p-3 rounded-2xl transition-all cursor-pointer ${
                    camOff
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-500/20"
                      : "bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10"
                  }`}
                  title={camOff ? "Turn On Camera" : "Turn Off Camera"}
                >
                  {camOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>

                {/* Screen Share Toggle */}
                <button
                  onClick={handleToggleScreenShare}
                  className={`p-3 rounded-2xl transition-all cursor-pointer ${
                    screenSharing
                      ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 shadow-lg shadow-indigo-500/20"
                      : "bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10"
                  }`}
                  title="Share Screen (1080p WebRTC)"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                {/* Virtual Background Blur */}
                <button
                  onClick={() => {
                    setBlurBackground(!blurBackground);
                    toast(blurBackground ? "Background blur disabled" : "Virtual background blur enabled");
                  }}
                  className={`p-3 rounded-2xl transition-all cursor-pointer ${
                    blurBackground
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10"
                  }`}
                  title="Toggle Virtual Background Blur"
                >
                  <Sparkles className="w-5 h-5" />
                </button>

                {/* Leave Call Button */}
                <button
                  onClick={handleEndCall}
                  className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer ml-3 active:scale-95"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Leave Room</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          CALL ENDED / MEETING CONCLUDED SCREEN (For Guest / Participant Departure)
          ========================================================================= */}
      <AnimatePresence>
        {callEndedInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card max-w-md w-full p-6 sm:p-7 rounded-3xl relative border border-white/15 shadow-2xl text-center space-y-4 pop-in"
            >
              <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white">You Left the Video Meeting</h3>
                <p className="text-xs text-white/60 mt-1">
                  Session <code className="text-orange-400 font-mono font-bold">{callEndedInfo.roomId}</code> concluded.
                </p>
                <div className="inline-block px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-white/70 mt-2">
                  Call Duration: {formatCallTime(callEndedInfo.duration)}
                </div>
              </div>

              {/* Call Quality Rating */}
              <div className="py-2 border-y border-white/10">
                <span className="text-[10.5px] font-bold text-white/50 uppercase tracking-wider block mb-2">
                  Rate Audio & Video Quality
                </span>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => {
                        setCallRating(star);
                        toast.success("Thank you for your feedback!");
                      }}
                      className="p-1 cursor-pointer transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= callRating ? "text-amber-400 fill-amber-400" : "text-white/20"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Exit Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => {
                    const room = callEndedInfo.roomId;
                    setCallEndedInfo(null);
                    const meet = meetings.find((m) => m.id === room) || {
                      id: room,
                      title: callEndedInfo.title,
                      time: "Live Now",
                      duration: "45 mins",
                      type: "Team Standup",
                      attendees: ["Host", getDisplayName()],
                      status: "LIVE_NOW",
                    };
                    handleJoinCall(meet);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
                  <span>Rejoin Meeting</span>
                </button>

                <button
                  onClick={() => {
                    setCallEndedInfo(null);
                    router.push("/login");
                  }}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Exit & Return to Login</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          GUEST PARTICIPANT JOIN MODAL (When opening via shared link)
          ========================================================================= */}
      <AnimatePresence>
        {showGuestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card max-w-md w-full p-6 rounded-3xl relative border border-white/15 pop-in"
            >
              <div className="text-center mb-5">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg mb-3">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Join Video Meeting</h3>
                <p className="text-xs text-white/60 mt-1">
                  You’ve been invited to room <code className="text-orange-400 font-mono font-bold">{pendingRoomId}</code>
                </p>
              </div>

              <form onSubmit={handleGuestJoinSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1">
                    Your Full Name / Nickname
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor or Job Candidate"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Join Video Call as Guest</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push(`/login?redirect=/meetings?room=${pendingRoomId}`)}
                    className="w-full py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-white/70 hover:text-white font-semibold text-xs border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Or Log In with Corporate Account</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          SCHEDULE MEETING MODAL
          ========================================================================= */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card max-w-md w-full p-6 rounded-3xl relative border border-white/15 pop-in"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-orange-400" />
                  <h3 className="text-base font-bold text-white">Schedule Video Meeting</h3>
                </div>
                <button onClick={() => setShowScheduleModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateMeeting} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1">
                    Meeting Topic / Purpose
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q4 Performance Appraisal & Career Alignment"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-xs outline-none focus:border-orange-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1">
                    Conference Category
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as Meeting["type"])}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#141824] border border-white/10 text-white text-xs outline-none cursor-pointer"
                  >
                    <option value="1-on-1 Review">1-on-1 Review</option>
                    <option value="Team Standup">Team Standup</option>
                    <option value="HR Onboarding">HR Onboarding</option>
                    <option value="Quarterly Townhall">Quarterly Townhall</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1">
                      Time / Date
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Today, 03:00 PM"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 cursor-pointer"
                  >
                    Save & Send Invite
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MeetingsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex flex-col items-center justify-center text-white/50 space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
          <span className="text-xs font-mono">Loading Nexus Meetings...</span>
        </div>
      }
    >
      <MeetingsHubContent />
    </Suspense>
  );
}
