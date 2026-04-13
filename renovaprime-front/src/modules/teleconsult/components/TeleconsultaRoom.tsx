import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Loader2, VideoOff, Mic, MicOff, Video, PhoneOff, User, CheckCircle } from 'lucide-react';
import { Button } from '../../../components/Button';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { teleconsultService, RoomData } from '../../../services/teleconsultService';
import {
  connect,
  Room,
  LocalVideoTrack,
  LocalAudioTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteVideoTrack,
  RemoteAudioTrack,
} from 'twilio-video';

/** Set `VITE_TELECONSULT_SIMPLE=true` in `.env` to use a minimal Twilio connect/attach path for debugging. */
const USE_SIMPLE_TWILIO = true;

const log = (...args: unknown[]) => console.log('[Teleconsult]', ...args);

/** Logs focados em áudio — filtre o console por `audio:` */
const logAudio = (event: string, data?: Record<string, unknown>) =>
  log(`audio:${event}`, data ?? {});

/** Silêncio mínimo (WAV) para `play()` no gesto do usuário liberar autoplay na origem. */
const SILENT_AUDIO_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

function simpleLocalRoleLabel(apiRole: 'doctor' | 'patient'): string {
  return apiRole === 'doctor' ? 'Profissional' : 'Beneficiário';
}

function simpleRemoteRoleLabel(localApiRole: 'doctor' | 'patient'): string {
  return localApiRole === 'doctor' ? 'Beneficiário' : 'Profissional';
}

export type SimpleTwilioRoomHandle = {
  toggleVideo: () => void;
};

type SimpleTwilioRoomProps = {
  token: string;
  roomName: string;
  localRole: 'doctor' | 'patient';
  doctorDisplayName: string;
  beneficiaryDisplayName: string;
  onVideoEnabledChange?: (enabled: boolean) => void;
};

export const SimpleTwilioRoom = forwardRef<SimpleTwilioRoomHandle, SimpleTwilioRoomProps>(
  function SimpleTwilioRoom(
    {
      token,
      roomName,
      localRole,
      doctorDisplayName,
      beneficiaryDisplayName,
      onVideoEnabledChange,
    },
    ref,
  ) {
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<Room | null>(null);
  const onVideoEnabledChangeRef = useRef(onVideoEnabledChange);
  onVideoEnabledChangeRef.current = onVideoEnabledChange;

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [hasRemoteParticipant, setHasRemoteParticipant] = useState(false);

  const toggleVideo = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;

    setIsVideoEnabled((prev) => {
      const next = !prev;
      room.localParticipant.videoTracks.forEach((pub) => {
        if (!pub.track) return;
        if (next) {
          pub.track.enable();
        } else {
          pub.track.disable();
        }
      });
      onVideoEnabledChangeRef.current?.(next);
      return next;
    });
  }, []);

  useImperativeHandle(ref, () => ({ toggleVideo }), [toggleVideo]);

  const videoOverlayClass =
    'pointer-events-none absolute inset-x-0 top-0 z-20 bg-[#1A4B84]/80 px-3 py-2 text-white shadow-md';

  useEffect(() => {
    let room: Room | undefined;
    let cancelled = false;

    const detachTrack = (track: RemoteTrack) => {
      if (track.kind === 'video' || track.kind === 'audio') {
        const attached = (track as RemoteVideoTrack | RemoteAudioTrack).detach();
        attached.forEach((el) => el.remove());
      }
    };

    const attachTrack = (track: RemoteTrack) => {
      log('simple:track', track.kind);

      if (track.kind === 'video') {
        const container = remoteVideoRef.current;
        if (!container) return;
        container.innerHTML = '';
        const el = track.attach();
        container.appendChild(el);
      }

      if (track.kind === 'audio') {
        const audio = document.createElement('audio');
        audio.autoplay = true;
        audio.setAttribute('playsinline', '');

        track.attach(audio);
        audioContainerRef.current?.appendChild(audio);

        void audio.play().catch((err: unknown) => {
          log('simple:audio play blocked', err);
        });
      }
    };

    const handlePublication = (publication: RemoteTrackPublication) => {
      if (publication.isSubscribed && publication.track) {
        attachTrack(publication.track);
      }

      publication.on('subscribed', (track) => {
        attachTrack(track);
      });

      publication.on('unsubscribed', (track) => {
        detachTrack(track);
      });
    };

    const handleParticipant = (participant: RemoteParticipant) => {
      log('simple:participant connected', participant.identity);
      setHasRemoteParticipant(true);

      participant.tracks.forEach(handlePublication);

      participant.on('trackPublished', handlePublication);
    };

    const init = async () => {
      try {
        room = await connect(token, {
          name: roomName,
          audio: true,
          video: true,
        });

        if (cancelled) {
          room.disconnect();
          return;
        }

        log('simple:connected', { roomName: room.name, sid: room.sid });

        roomRef.current = room;
        setIsVideoEnabled(true);
        setHasRemoteParticipant(room.participants.size > 0);
        onVideoEnabledChangeRef.current?.(true);

        room.localParticipant.videoTracks.forEach((pub) => {
          if (pub.track && localVideoRef.current) {
            const el = pub.track.attach();
            localVideoRef.current.appendChild(el);
          }
        });

        room.participants.forEach(handleParticipant);
        room.on('participantConnected', handleParticipant);
        room.on('participantDisconnected', () => {
          setHasRemoteParticipant(room ? room.participants.size > 0 : false);
          const container = remoteVideoRef.current;
          if (container && room && room.participants.size === 0) {
            container.innerHTML = '';
          }
        });
      } catch (e: unknown) {
        log('simple:connect error', e);
      }
    };

    void init();

    return () => {
      cancelled = true;
      roomRef.current = null;
      room?.disconnect();
    };
  }, [token, roomName]);

  const localOverlayName = localRole === 'doctor' ? doctorDisplayName : beneficiaryDisplayName;
  const remoteOverlayName = localRole === 'doctor' ? beneficiaryDisplayName : doctorDisplayName;

  const tileShellClass =
    'relative box-border flex min-h-0 min-w-0 flex-col border-2 border-[#1A4B84]';
  const videoAreaClass =
    'relative min-h-0 flex-1 overflow-hidden bg-black [&_video]:absolute [&_video]:inset-0 [&_video]:h-full [&_video]:w-full [&_video]:max-h-none [&_video]:max-w-none [&_video]:object-cover';

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col">
      <div className="grid h-full min-h-0 w-full grid-cols-1 grid-rows-2 gap-0 lg:grid-cols-2 lg:grid-rows-1">
        <div className={tileShellClass}>
          <div className={videoOverlayClass}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/90">
              {simpleLocalRoleLabel(localRole)}
            </p>
            <p className="truncate text-sm font-medium leading-tight">{localOverlayName}</p>
          </div>
          {!isVideoEnabled && (
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85 pt-10 text-white">
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                <VideoOff className="h-10 w-10 text-white/70" />
              </div>
              <p className="text-sm font-medium text-white/90">Câmera desativada</p>
            </div>
          )}
          <div
            ref={localVideoRef}
            className={`${videoAreaClass} [&_video]:scale-x-[-1]`}
          />
        </div>
        <div className={tileShellClass}>
          <div className={videoOverlayClass}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/90">
              {simpleRemoteRoleLabel(localRole)}
            </p>
            <p className="truncate text-sm font-medium leading-tight">{remoteOverlayName}</p>
          </div>
          {!hasRemoteParticipant && (
            <div className="animate-pulse pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85 pt-10 text-white">
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                <User className="h-10 w-10 text-white/70" />
              </div>
              <p className="text-sm font-medium text-white/90">Aguardando participante...</p>
            </div>
          )}
          <div ref={remoteVideoRef} className={videoAreaClass} />
        </div>
      </div>
      <div
        ref={audioContainerRef}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
        }}
        aria-hidden
      />
    </div>
  );
});

interface TeleconsultaRoomProps {
  appointmentId: number;
  role: 'doctor' | 'patient';
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function TeleconsultaRoom({
  appointmentId,
  role,
  onEnd,
  onError
}: TeleconsultaRoomProps) {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isEnding, setIsEnding] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [hasRemoteParticipant, setHasRemoteParticipant] = useState(false);
  const [remoteParticipantName, setRemoteParticipantName] = useState<string>('');
  const [needsAudioInteraction, setNeedsAudioInteraction] = useState(false);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const remoteAudioRef = useRef<HTMLDivElement>(null);
  const simpleTwilioRef = useRef<SimpleTwilioRoomHandle>(null);
  const [simpleVideoOn, setSimpleVideoOn] = useState(true);
  const localTracksRef = useRef<(LocalVideoTrack | LocalAudioTrack)[]>([]);
  const roomRef = useRef<Room | null>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    log('TeleconsultaRoom mount', { appointmentId, role });
    return () => log('TeleconsultaRoom unmount', { appointmentId, role });
  }, [appointmentId, role]);

  // Primeiro clique na página: “aquece” a política de autoplay para áudio da mesma origem.
  useEffect(() => {
    logAudio('autoplay-unlock listener registered', { appointmentId });

    const unlockAudio = () => {
      logAudio('autoplay-unlock gesture (first window click)', { appointmentId });
      const audio = new Audio(SILENT_AUDIO_DATA_URI);
      audio.muted = false;
      audio.volume = 0.0001;
      void audio
        .play()
        .then(() => {
          logAudio('autoplay-unlock silent play OK', {
            appointmentId,
            paused: audio.paused,
            muted: audio.muted,
          });
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          logAudio('autoplay-unlock silent play FAILED', { appointmentId, message });
        });
    };

    window.addEventListener('click', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
    };
  }, [appointmentId]);

  // Carregar dados da sala
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        log('loadRoomData start', { appointmentId, role });
        const data = await teleconsultService.getRoom(appointmentId);
        setRoomData(data);
        log('loadRoomData state updated', { appointmentId, roomName: data.roomName });
        if (USE_SIMPLE_TWILIO) {
          setIsLoading(false);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao carregar sala';
        log('loadRoomData error', { appointmentId, message });
        setErrorMessage(message);
        onErrorRef.current?.(message);
        setIsLoading(false);
      }
    };

    loadRoomData();
  }, [appointmentId, role]);

  // Conectar ao Twilio quando roomData estiver disponível
  useEffect(() => {
    if (USE_SIMPLE_TWILIO) return;
    if (!roomData || room) return;

    const connectToRoom = async () => {
      try {
        log('Twilio connect start', {
          appointmentId,
          role,
          roomName: roomData.roomName,
          localIdentity: roomData.displayName
        });
        const twilioRoom = await connect(roomData.accessToken, {
          name: roomData.roomName,
          audio: true,
          video: { width: 640 },
        });

        roomRef.current = twilioRoom;
        setRoom(twilioRoom);
        setIsLoading(false);

        log('Twilio connect success', {
          appointmentId,
          sid: twilioRoom.sid,
          name: twilioRoom.name,
          localParticipantIdentity: twilioRoom.localParticipant.identity,
          participantCount: twilioRoom.participants.size
        });

        twilioRoom.on('disconnected', (disconnectedRoom, error) => {
          log('Twilio room disconnected', {
            appointmentId,
            sid: disconnectedRoom.sid,
            error: error?.message
          });
        });

        // Attach local tracks
        twilioRoom.localParticipant.videoTracks.forEach(publication => {
          if (publication.track && localVideoRef.current) {
            const videoElement = publication.track.attach();
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
            videoElement.style.objectFit = 'cover';
            videoElement.style.transform = 'scaleX(-1)';
            localVideoRef.current.appendChild(videoElement);
            localTracksRef.current.push(publication.track);
          }
        });

        twilioRoom.localParticipant.audioTracks.forEach(publication => {
          if (publication.track) {
            localTracksRef.current.push(publication.track);
          }
        });

        const localAudioPubs = [...twilioRoom.localParticipant.audioTracks.values()];
        logAudio('local after connect', {
          appointmentId,
          publicationCount: localAudioPubs.length,
          tracks: localAudioPubs.map(p => ({
            trackSid: p.trackSid,
            publicationIsTrackEnabled: p.isTrackEnabled,
            mediaIsEnabled: p.track?.isEnabled ?? null,
            mediaIsStarted: p.track?.isStarted ?? null,
          })),
        });

        // Handle existing participants
        twilioRoom.participants.forEach(handleParticipantConnected);

        // Handle new participants
        twilioRoom.on('participantConnected', handleParticipantConnected);
        twilioRoom.on('participantDisconnected', handleParticipantDisconnected);

      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao conectar à sala';
        log('Twilio connect error', { appointmentId, message });
        setErrorMessage(message);
        onErrorRef.current?.(message);
        setIsLoading(false);
      }
    };

    connectToRoom();

    return () => {
      if (roomRef.current) {
        log('Twilio cleanup disconnect (effect)', { appointmentId });
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, [roomData, appointmentId, role]);

  // Handle track subscribed
  const handleTrackSubscribed = useCallback((track: RemoteTrack) => {
    log('trackSubscribed', { kind: track.kind });

    if (track.kind === 'video') {
      if (!remoteVideoRef.current) return;

      const videoElement = (track as RemoteVideoTrack).attach();
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'cover';
      remoteVideoRef.current.appendChild(videoElement);
      return;
    }

    if (track.kind === 'audio') {
      const remote = track as RemoteAudioTrack;
      const container = remoteAudioRef.current;
      if (!container) return;

      logAudio('remote track attach', {
        trackSid: remote.sid,
        trackName: remote.name,
        isEnabled: remote.isEnabled,
        isStarted: remote.isStarted,
        isSwitchedOff: remote.isSwitchedOff,
      });

      // remove anterior do mesmo track
      container.querySelectorAll(`audio[data-track-sid="${remote.sid}"]`).forEach(el => el.remove());

      const audioElement = document.createElement('audio');
      audioElement.setAttribute('data-track-sid', remote.sid);
      audioElement.autoplay = true;
      audioElement.setAttribute('playsinline', '');
      audioElement.muted = false;
      audioElement.volume = 1;

      container.appendChild(audioElement);
      remote.attach(audioElement);

      const tryPlay = () => {
        void audioElement.play()
          .then(() => {
            logAudio('remote play() OK', {
              trackSid: remote.sid,
              paused: audioElement.paused,
              readyState: audioElement.readyState,
              isEnabled: remote.isEnabled,
            });
            setNeedsAudioInteraction(false);
          })
          .catch((err: unknown) => {
            const message = err instanceof Error ? err.message : String(err);
            logAudio('remote play() FAILED', {
              trackSid: remote.sid,
              message,
              isEnabled: remote.isEnabled,
              isStarted: remote.isStarted,
            });
            setNeedsAudioInteraction(true);
          });
      };

      remote.on('started', () => {
        logAudio('remote started', { trackSid: remote.sid });
        tryPlay();
      });

      remote.on('enabled', () => {
        logAudio('remote enabled', { trackSid: remote.sid });
      });

      remote.on('disabled', () => {
        logAudio('remote disabled', { trackSid: remote.sid });
      });

      tryPlay();
    }
  }, []);

  // Handle track unsubscribed
  const handleTrackUnsubscribed = useCallback((track: RemoteTrack) => {
    log('trackUnsubscribed', { kind: track.kind });
    if (track.kind === 'audio') {
      logAudio('remote track unsubscribed', { trackSid: track.sid, trackName: track.name });
    }
    if (track.kind === 'video' || track.kind === 'audio') {
      const attachedElements = (track as RemoteVideoTrack | RemoteAudioTrack).detach();
      attachedElements.forEach(element => element.remove());
    }
  }, []);

  // Handle participant connected
  const handleParticipantConnected = useCallback((participant: RemoteParticipant) => {
    log('participantConnected', { identity: participant.identity });
    logAudio('remote participant connected', {
      identity: participant.identity,
      audioTrackPublications: participant.audioTracks.size,
      videoTrackPublications: participant.videoTracks.size,
    });
    setHasRemoteParticipant(true);
    setRemoteParticipantName(participant.identity);

    const wireRemotePublication = (publication: RemoteTrackPublication) => {
      logAudio('publication wire', {
        identity: participant.identity,
        trackSid: publication.trackSid,
        kind: publication.kind,
        isSubscribed: publication.isSubscribed,
        hasTrack: !!publication.track,
      });

      if (publication.isSubscribed && publication.track) {
        handleTrackSubscribed(publication.track);
      }

      publication.on('subscribed', track => {
        logAudio('publication subscribed event', {
          identity: participant.identity,
          trackSid: publication.trackSid,
          kind: track.kind,
        });
        handleTrackSubscribed(track);
      });

      publication.on('unsubscribed', track => {
        logAudio('publication unsubscribed event', {
          identity: participant.identity,
          trackSid: publication.trackSid,
          kind: track.kind,
        });
        handleTrackUnsubscribed(track);
      });
    };

    participant.tracks.forEach(publication => {
      wireRemotePublication(publication);
    });

    participant.on('trackPublished', publication => {
      logAudio('trackPublished (late)', {
        identity: participant.identity,
        trackSid: publication.trackSid,
        kind: publication.kind,
      });
      wireRemotePublication(publication);
    });
  }, [handleTrackSubscribed, handleTrackUnsubscribed]);

  // Handle participant disconnected
  const handleParticipantDisconnected = useCallback((participant: RemoteParticipant) => {
    log('participantDisconnected', { identity: participant.identity });
    setHasRemoteParticipant(false);
    setRemoteParticipantName('');

    participant.tracks.forEach(publication => {
      if (publication.track) {
        handleTrackUnsubscribed(publication.track as RemoteVideoTrack | RemoteAudioTrack);
      }
    });

    // Clear remote video container
    if (remoteVideoRef.current) {
      remoteVideoRef.current.innerHTML = '';
    }
  }, [handleTrackUnsubscribed]);

  // Toggle microphone
  const toggleAudio = useCallback(() => {
    if (!room) return;

    const nextEnabled = !isMicEnabled;
    logAudio('mic toggle', {
      previousUiMicOn: isMicEnabled,
      nextUiMicOn: nextEnabled,
      action: isMicEnabled ? 'disable local track' : 'enable local track',
    });

    room.localParticipant.audioTracks.forEach(publication => {
      if (!publication.track) return;

      if (isMicEnabled) {
        publication.track.disable();
      } else {
        publication.track.enable();
      }
    });

    setIsMicEnabled(nextEnabled);

    const after = [...room.localParticipant.audioTracks.values()].map(p => ({
      trackSid: p.trackSid,
      isEnabled: p.track?.isEnabled ?? null,
    }));
    logAudio('mic state after toggle', { tracks: after });
  }, [room, isMicEnabled]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (room) {
      log('toggleVideo', { nextEnabled: !isVideoEnabled });
      room.localParticipant.videoTracks.forEach(publication => {
        if (publication.track) {
          if (isVideoEnabled) {
            publication.track.disable();
          } else {
            publication.track.enable();
          }
        }
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  }, [room, isVideoEnabled]);

  // Sair da chamada (sem finalizar a consulta)
  const handleEndCall = useCallback(() => {
    log('handleEndCall (leave without finishing)', { appointmentId, role });
    // Desconectar do Twilio
    if (room) {
      room.disconnect();
      localTracksRef.current.forEach(track => {
        track.stop();
        const attachedElements = track.detach();
        attachedElements.forEach(element => element.remove());
      });
    }

    onEnd?.();
  }, [onEnd, room]);

  // Finalizar consulta e encerrar chamada (apenas médico)
  const handleFinishConsultation = useCallback(async () => {
    if (role !== 'doctor' || isEnding) return;

    log('handleFinishConsultation start', { appointmentId });
    setIsEnding(true);

    // Desconectar do Twilio
    if (room) {
      room.disconnect();
      localTracksRef.current.forEach(track => {
        track.stop();
        const attachedElements = track.detach();
        attachedElements.forEach(element => element.remove());
      });
    }

    // Finalizar a consulta no backend
    try {
      await teleconsultService.endAppointment(appointmentId);
      log('handleFinishConsultation API OK', { appointmentId });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      log('handleFinishConsultation API error', { appointmentId, message: errMsg });
    } finally {
      onEnd?.();
    }
  }, [appointmentId, role, isEnding, room, onEnd]);

  // Handle beforeunload - apenas desconecta da chamada
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (room) {
        room.disconnect();
      }
      e.preventDefault();
      e.returnValue = 'Você sairá da chamada. Deseja continuar?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [room]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
      localTracksRef.current.forEach(track => {
        track.stop();
      });
      // Remover elementos de áudio remoto do DOM
      if (remoteAudioRef.current) {
        remoteAudioRef.current.innerHTML = '';
      }
    };
  }, [room]);

  return (
    <>
      {/* Sempre renderizado — container de áudio remoto precisa existir antes do Twilio conectar */}
      <div
        ref={remoteAudioRef}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
          <Loader2 className="w-12 h-12 animate-spin mb-4 text-cyan-500" />
          <p className="text-lg">Conectando à teleconsulta...</p>
          <p className="text-sm text-gray-400 mt-2">Aguarde enquanto preparamos sua chamada</p>
        </div>
      ) : errorMessage ? (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-900">
          <div className="text-red-500 mb-4">
            <VideoOff className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Erro ao carregar teleconsulta
          </h2>
          <p className="text-gray-400 mb-4">{errorMessage}</p>
          <Button onClick={onEnd}>Voltar</Button>
        </div>
      ) : USE_SIMPLE_TWILIO && roomData ? (
        <div className="relative flex flex-col h-screen max-h-screen overflow-hidden bg-gray-900">
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            <SimpleTwilioRoom
              ref={simpleTwilioRef}
              token={roomData.accessToken}
              roomName={roomData.roomName}
              localRole={roomData.role}
              doctorDisplayName={roomData.doctorDisplayName ?? roomData.displayName}
              beneficiaryDisplayName={
                roomData.beneficiaryDisplayName ?? roomData.displayName
              }
              onVideoEnabledChange={setSimpleVideoOn}
            />
          </div>

          <div className="flex items-center justify-center gap-4 p-6 bg-gray-800/95 backdrop-blur shrink-0">
            <button
              type="button"
              onClick={() => simpleTwilioRef.current?.toggleVideo()}
              className={`p-4 rounded-full transition-all duration-200 ${
                simpleVideoOn
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white scale-110'
              }`}
              title={simpleVideoOn ? 'Desativar câmera' : 'Ativar câmera'}
            >
              {simpleVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>

            {role === 'doctor' && (
              <button
                type="button"
                onClick={() => setShowFinishModal(true)}
                disabled={isEnding}
                className={`p-4 rounded-full transition-all duration-200 ${
                  isEnding
                    ? 'bg-green-600 text-white cursor-not-allowed opacity-75'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-white hover:scale-110'
                }`}
                title="Finalizar consulta"
              >
                <CheckCircle className="w-6 h-6" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowLeaveModal(true)}
              className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 hover:scale-110"
              title="Sair da chamada"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>

          {isEnding && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-2xl p-8 text-center shadow-2xl">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-cyan-500" />
                <p className="text-white text-lg">Encerrando teleconsulta...</p>
              </div>
            </div>
          )}

          <ConfirmModal
            isOpen={showLeaveModal}
            onClose={() => setShowLeaveModal(false)}
            onConfirm={handleEndCall}
            title="Sair da chamada"
            description="Deseja sair da chamada? A consulta não será finalizada e você poderá retornar depois."
            confirmText="Sim, sair"
            cancelText="Cancelar"
            variant="warning"
          />

          <ConfirmModal
            isOpen={showFinishModal}
            onClose={() => setShowFinishModal(false)}
            onConfirm={handleFinishConsultation}
            title="Finalizar consulta"
            description="Deseja finalizar a consulta? Esta ação encerrará a chamada e marcará a consulta como concluída."
            confirmText="Sim, finalizar"
            cancelText="Cancelar"
            variant="default"
            isLoading={isEnding}
          />
        </div>
      ) : (
        <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-gray-900">
          {/* Video Container */}
          <div className="flex-1 relative min-h-0">
            {/* Placeholder quando não há participante remoto */}
            {!hasRemoteParticipant && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 z-0">
                <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center mb-6">
                  <User className="w-16 h-16 text-gray-500" />
                </div>
                <p className="text-white text-xl font-medium mb-2">Aguardando participante</p>
                <p className="text-gray-400 text-sm">
                  {role === 'doctor'
                    ? 'O paciente entrará em breve...'
                    : 'O médico entrará em breve...'}
                </p>
                <div className="mt-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                  <span className="text-gray-400 text-sm">Sala ativa</span>
                </div>
              </div>
            )}

            {/* Remote video container - sempre presente para anexar o vídeo */}
            <div
              ref={remoteVideoRef}
              className={`absolute inset-0 bg-black ${hasRemoteParticipant ? 'z-1' : 'hidden'}`}
            />

            {/* Remote participant name badge */}
            {hasRemoteParticipant && remoteParticipantName && (
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-black/60 px-3 py-2 rounded-lg">
                  <span className="text-white text-sm font-medium">
                    {remoteParticipantName.includes('doctor') ? 'Médico' : 'Paciente'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Audio Interaction Button - Required for autoplay bypass */}
          {needsAudioInteraction && (
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50">
              <button
                onClick={() => {
                  const nodes = remoteAudioRef.current?.querySelectorAll('audio') ?? [];
                  logAudio('Ativar som clicked', { audioElementCount: nodes.length });

                  nodes.forEach((node, index) => {
                    const el = node as HTMLAudioElement;
                    el.muted = false;

                    void el.play()
                      .then(() => {
                        logAudio('Ativar som play OK', {
                          index,
                          paused: el.paused,
                          muted: el.muted,
                          readyState: el.readyState,
                        });
                      })
                      .catch((err: unknown) => {
                        const message = err instanceof Error ? err.message : String(err);
                        logAudio('Ativar som play FAILED', { index, message });
                      });
                  });
                  setNeedsAudioInteraction(false);
                }}
                className="px-6 py-3 bg-cyan-500 text-black rounded-full font-semibold shadow-lg hover:bg-cyan-400 transition-all duration-200"
              >
                Ativar som 🔊
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 p-6 bg-gray-800/95 backdrop-blur">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-all duration-200 ${
                isMicEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white scale-110'
              }`}
              title={isMicEnabled ? 'Desativar microfone' : 'Ativar microfone'}
            >
              {isMicEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-all duration-200 ${
                isVideoEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white scale-110'
              }`}
              title={isVideoEnabled ? 'Desativar câmera' : 'Ativar câmera'}
            >
              {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>

            {role === 'doctor' && (
              <button
                onClick={() => setShowFinishModal(true)}
                disabled={isEnding}
                className={`p-4 rounded-full transition-all duration-200 ${
                  isEnding
                    ? 'bg-green-600 text-white cursor-not-allowed opacity-75'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-white hover:scale-110'
                }`}
                title="Finalizar consulta"
              >
                <CheckCircle className="w-6 h-6" />
              </button>
            )}

            <button
              onClick={() => setShowLeaveModal(true)}
              className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 hover:scale-110"
              title="Sair da chamada"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>

          {/* Ending overlay */}
          {isEnding && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-2xl p-8 text-center shadow-2xl">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-cyan-500" />
                <p className="text-white text-lg">Encerrando teleconsulta...</p>
              </div>
            </div>
          )}

          {/* Modal de confirmação - Sair da chamada */}
          <ConfirmModal
            isOpen={showLeaveModal}
            onClose={() => setShowLeaveModal(false)}
            onConfirm={handleEndCall}
            title="Sair da chamada"
            description="Deseja sair da chamada? A consulta não será finalizada e você poderá retornar depois."
            confirmText="Sim, sair"
            cancelText="Cancelar"
            variant="warning"
          />

          {/* Modal de confirmação - Finalizar consulta */}
          <ConfirmModal
            isOpen={showFinishModal}
            onClose={() => setShowFinishModal(false)}
            onConfirm={handleFinishConsultation}
            title="Finalizar consulta"
            description="Deseja finalizar a consulta? Esta ação encerrará a chamada e marcará a consulta como concluída."
            confirmText="Sim, finalizar"
            cancelText="Cancelar"
            variant="default"
            isLoading={isEnding}
          />
        </div>
      )}
    </>
  );
}
