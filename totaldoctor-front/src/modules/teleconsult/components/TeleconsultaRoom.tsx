import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, VideoOff, Mic, MicOff, Video, PhoneOff, User } from 'lucide-react';
import { Button } from '../../../components/Button';
import { teleconsultService, RoomData } from '../../../services/teleconsultService';
import {
  connect,
  Room,
  LocalVideoTrack,
  LocalAudioTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteVideoTrack,
  RemoteAudioTrack,
} from 'twilio-video';

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
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [hasRemoteParticipant, setHasRemoteParticipant] = useState(false);
  const [remoteParticipantName, setRemoteParticipantName] = useState<string>('');
  const [needsAudioInteraction, setNeedsAudioInteraction] = useState(false);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const localTracksRef = useRef<(LocalVideoTrack | LocalAudioTrack)[]>([]);
  const roomRef = useRef<Room | null>(null);

  // Carregar dados da sala
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        const data = await teleconsultService.getRoom(appointmentId);
        setRoomData(data);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao carregar sala';
        setErrorMessage(message);
        onError?.(message);
        setIsLoading(false);
      }
    };

    loadRoomData();
  }, [appointmentId, onError]);

  // Conectar ao Twilio quando roomData estiver disponível
  useEffect(() => {
    if (!roomData || room) return;

    const connectToRoom = async () => {
      try {
        const twilioRoom = await connect(roomData.accessToken, {
          name: roomData.roomName,
          audio: true,
          video: { width: 640 },
        });

        roomRef.current = twilioRoom;
        setRoom(twilioRoom);
        setIsLoading(false);

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

        // Handle existing participants
        twilioRoom.participants.forEach(handleParticipantConnected);

        // Handle new participants
        twilioRoom.on('participantConnected', handleParticipantConnected);
        twilioRoom.on('participantDisconnected', handleParticipantDisconnected);

      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao conectar à sala';
        setErrorMessage(message);
        onError?.(message);
        setIsLoading(false);
      }
    };

    connectToRoom();

    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, [roomData]);

  // Handle participant connected
  const handleParticipantConnected = useCallback((participant: RemoteParticipant) => {
    setHasRemoteParticipant(true);
    setRemoteParticipantName(participant.identity);

    participant.tracks.forEach(publication => {
      if (publication.isSubscribed && publication.track) {
        handleTrackSubscribed(publication.track as RemoteVideoTrack | RemoteAudioTrack);
      }
    });

    participant.on('trackSubscribed', handleTrackSubscribed);
    participant.on('trackUnsubscribed', handleTrackUnsubscribed);
  }, []);

  // Handle participant disconnected
  const handleParticipantDisconnected = useCallback((participant: RemoteParticipant) => {
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
  }, []);

  // Handle track subscribed
  const handleTrackSubscribed = useCallback((track: RemoteTrack) => {
    if (track.kind === 'video' && remoteVideoRef.current) {
      const videoElement = (track as RemoteVideoTrack).attach();
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'cover';
      remoteVideoRef.current.appendChild(videoElement);
    } else if (track.kind === 'audio') {
      const audioElement = (track as RemoteAudioTrack).attach() as HTMLAudioElement;
      audioElement.autoplay = true;

      document.body.appendChild(audioElement);

      audioElement.play().catch(() => {
        console.warn('[Teleconsulta] Autoplay bloqueado, aguardando interação');
        setNeedsAudioInteraction(true);
      });
    }
  }, []);

  // Handle track unsubscribed
  const handleTrackUnsubscribed = useCallback((track: RemoteTrack) => {
    if (track.kind === 'video' || track.kind === 'audio') {
      const attachedElements = (track as RemoteVideoTrack | RemoteAudioTrack).detach();
      attachedElements.forEach(element => element.remove());
    }
  }, []);

  // Toggle microphone
  const toggleAudio = useCallback(() => {
    if (!room) return;

    room.localParticipant.audioTracks.forEach(publication => {
      if (!publication.track) return;

      if (isMicEnabled) {
        publication.track.disable();
      } else {
        publication.track.enable();
      }
    });

    setIsMicEnabled(!isMicEnabled);
  }, [room, isMicEnabled]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (room) {
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

  // Finalizar teleconsulta
  const handleEndCall = useCallback(async () => {
    if (isEnding) return;

    // Desconectar do Twilio
    if (room) {
      room.disconnect();
      localTracksRef.current.forEach(track => {
        track.stop();
        const attachedElements = track.detach();
        attachedElements.forEach(element => element.remove());
      });
    }

    // Paciente apenas sai
    if (role !== 'doctor') {
      onEnd?.();
      return;
    }

    // Médico finaliza a consulta no backend
    setIsEnding(true);
    try {
      await teleconsultService.endAppointment(appointmentId);
    } catch (error) {
      console.error('Error ending teleconsultation:', error);
    } finally {
      onEnd?.();
    }
  }, [appointmentId, role, onEnd, isEnding, room]);

  // Handle beforeunload para médico
  useEffect(() => {
    if (role !== 'doctor') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (room) {
        room.disconnect();
      }
      teleconsultService.endAppointment(appointmentId).catch(() => {});
      e.preventDefault();
      e.returnValue = 'A teleconsulta será encerrada. Deseja sair?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [role, appointmentId, room]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
      localTracksRef.current.forEach(track => {
        track.stop();
      });
    };
  }, [room]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-cyan-500" />
        <p className="text-lg">Conectando à teleconsulta...</p>
        <p className="text-sm text-gray-400 mt-2">Aguarde enquanto preparamos sua chamada</p>
      </div>
    );
  }

  // Error state
  if (errorMessage) {
    return (
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
    );
  }

  return (
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

        {/* Local Video (picture-in-picture) */}
        <div className="absolute bottom-20 right-4 z-10">
          <div className="relative">
            <div
              ref={localVideoRef}
              className="w-40 h-28 md:w-48 md:h-36 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-800 rounded-xl flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-gray-500" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
              Você
            </div>
          </div>
        </div>

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
              document.querySelectorAll('audio').forEach(el => {
                el.play().catch(() => {});
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

        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 hover:scale-110"
          title="Encerrar chamada"
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
    </div>
  );
}
