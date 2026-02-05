import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, VideoOff, Mic, MicOff, Video, PhoneOff } from 'lucide-react';
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
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

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
            localVideoRef.current.appendChild(publication.track.attach());
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
    participant.tracks.forEach(publication => {
      if (publication.track) {
        handleTrackUnsubscribed(publication.track as RemoteVideoTrack | RemoteAudioTrack);
      }
    });
  }, []);

  // Handle track subscribed
  const handleTrackSubscribed = useCallback((track: RemoteTrack) => {
    if (track.kind === 'video' && remoteVideoRef.current) {
      remoteVideoRef.current.appendChild((track as RemoteVideoTrack).attach());
    } else if (track.kind === 'audio') {
      document.body.appendChild((track as RemoteAudioTrack).attach());
    }
  }, []);

  // Handle track unsubscribed
  const handleTrackUnsubscribed = useCallback((track: RemoteTrack) => {
    if (track.kind === 'video' || track.kind === 'audio') {
      const attachedElements = (track as RemoteVideoTrack | RemoteAudioTrack).detach();
      attachedElements.forEach(element => element.remove());
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (room) {
      room.localParticipant.audioTracks.forEach(publication => {
        if (publication.track) {
          if (isAudioEnabled) {
            publication.track.disable();
          } else {
            publication.track.enable();
          }
        }
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  }, [room, isAudioEnabled]);

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
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p>Conectando à teleconsulta...</p>
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
        {/* Remote Video (large) */}
        <div
          ref={remoteVideoRef}
          className="absolute inset-0 flex items-center justify-center bg-gray-800"
          style={{ zIndex: 1 }}
        >
          <div className="text-gray-500 text-center">
            <VideoOff className="w-16 h-16 mx-auto mb-2" />
            <p>Aguardando outro participante...</p>
          </div>
        </div>

        {/* Local Video (small, picture-in-picture) */}
        <div
          ref={localVideoRef}
          className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden shadow-lg"
          style={{ zIndex: 10 }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-800">
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full transition-colors ${
            isAudioEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          title={isAudioEnabled ? 'Desativar microfone' : 'Ativar microfone'}
        >
          {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-colors ${
            isVideoEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          title={isVideoEnabled ? 'Desativar câmera' : 'Ativar câmera'}
        >
          {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          title="Encerrar chamada"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>

      {/* Ending overlay */}
      {isEnding && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
            <p className="text-white">Encerrando teleconsulta...</p>
          </div>
        </div>
      )}
    </div>
  );
}
