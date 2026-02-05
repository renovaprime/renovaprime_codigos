import { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { MediaConnection } from 'peerjs';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from 'lucide-react';
import { Button } from '../../../components/Button';
import { teleconsultService, RoomData } from '../../../services/teleconsultService';

interface TeleconsultaRoomProps {
  appointmentId: number;
  role: 'doctor' | 'patient';
  onEnd?: () => void;
  onError?: (error: string) => void;
}

type ConnectionStatus = 'connecting' | 'waiting' | 'connected' | 'disconnected' | 'error';

export function TeleconsultaRoom({
  appointmentId,
  role,
  onEnd,
  onError
}: TeleconsultaRoomProps) {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callRef = useRef<MediaConnection | null>(null);
  const initializedRef = useRef(false);
  const peerCreatedRef = useRef(false); // Guard contra dupla criação de peer

  console.log('[TeleconsultaRoom] render', { appointmentId, role });


  // Cleanup function
  const cleanup = useCallback((destroyPeer = false): void => {
    if (callRef.current) {
      callRef.current.close();
      callRef.current = null;
    }
  
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  
    if (destroyPeer && peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
  }, []);
  

  // Finalizar teleconsulta (apenas medico)
  const handleEndCall = useCallback(async () => {
    if (role !== 'doctor') {
      cleanup(true); // Paciente também destrói peer ao sair
      peerCreatedRef.current = false; // Permite recriação se voltar
      onEnd?.();
      return;
    }

    setIsEnding(true);
    try {
      await teleconsultService.endAppointment(appointmentId);
      cleanup(true); // fecha call e tracks
      peerCreatedRef.current = false; // Reset flag
      onEnd?.();
    } catch (error) {
      console.error('Error ending teleconsultation:', error);
      // Mesmo com erro, limpar e sair
      cleanup(true);
      peerCreatedRef.current = false; // Reset flag
      onEnd?.();
    }
  }, [appointmentId, role, cleanup, onEnd]);

  // Carregar dados da sala
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        const data = await teleconsultService.getRoom(appointmentId);
        setRoomData(data);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao carregar sala';
        setErrorMessage(message);
        setStatus('error');
        onError?.(message);
      }
    };

    loadRoomData();
  }, [appointmentId, onError]);

  // Inicializar WebRTC quando roomData estiver disponível
  useEffect(() => {
    if (!roomData) return;
    if (initializedRef.current) return; // Guard: previne dupla inicialização

    initializedRef.current = true;

    const initializeWebRTC = async () => {
      try {
        // Obter mídia local
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        localStreamRef.current = stream;

        // Exibir vídeo local
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Configurar PeerJS - deixar o PeerJS gerar ID aleatório
        const peerConfig = teleconsultService.getPeerServerConfig();

        console.log('[Peer] Connecting with config:', peerConfig);

        // Guard: se Peer já foi criado, reutilizar
        if (peerRef.current && !peerRef.current.destroyed) {
          console.log('[Peer] Reusing existing peer instance');
          return; // Peer já existe e está vivo
        }

        // Double-check: StrictMode pode chamar isso 2x simultâneas
        if (peerCreatedRef.current) {
          console.log('[Peer] Creation already in progress, skipping');
          return;
        }

        peerCreatedRef.current = true;

        // Criar peer sem ID específico - PeerJS gerará um ID aleatório
        const peer = new Peer({
          host: peerConfig.host,
          port: peerConfig.port,
          path: peerConfig.path,
          secure: peerConfig.secure,
          key: peerConfig.key,
          debug: 3 // Máximo debug
        });

        peerRef.current = peer;

        peer.on('open', async (id) => {
          console.log(`[Peer] Connected with ID: ${id}`);

          if (role === 'doctor') {
            // Médico: registrar peer ID no servidor e aguardar paciente
            try {
              console.log('[Peer] Doctor registering peer ID...');
              await teleconsultService.registerPeerId(appointmentId, id);
              console.log('[Peer] Doctor peer ID registered successfully');
              setStatus('waiting');
            } catch (error) {
              console.error('[Peer] Failed to register peer ID:', error);
              setStatus('error');
              setErrorMessage('Erro ao registrar conexão. Tente novamente.');
              return;
            }
          } else {
            // Paciente conecta no médico
            if (!roomData.doctor_peer_id) {
              console.error('[Peer] Doctor peer ID not available');
              setStatus('error');
              setErrorMessage('O médico ainda não está conectado. Aguarde e tente novamente.');
              return;
            }

            const doctorPeerId = roomData.doctor_peer_id;

            const attemptCall = (retryCount = 0) => {
              if (callRef.current) return;
              setStatus('connecting');
              console.log(`[Peer] Patient attempting to call doctor (attempt ${retryCount + 1}), doctorPeerId: ${doctorPeerId}`);

              const call = peer.call(doctorPeerId, stream);

              if (!call) {
                console.error('[Peer] Call failed to initiate');
                if (retryCount < 3) {
                  setTimeout(() => attemptCall(retryCount + 1), 2000);
                } else {
                  setStatus('error');
                  setErrorMessage('Não foi possível conectar com o médico. Tente novamente.');
                }
                return;
              }

              callRef.current = call;

              call.on('stream', (remoteStream) => {
                console.log('[Peer] Received remote stream', remoteStream);
              
                const video = remoteVideoRef.current;
                if (video) {
                  video.srcObject = remoteStream;
              
                  // CRÍTICO
                  video.onloadedmetadata = () => {
                    video.play().catch(err => {
                      console.warn('Video play failed:', err);
                    });
                  };
                }
              
                setStatus('connected');
              });
              

              call.on('close', () => {
                setStatus('waiting');
              });
             
              call.on('error', (err) => {
                console.error('[Peer] Call error:', err);
                // Se o erro for unavailable-id, significa que o médico não está conectado ainda
                if (err.type === 'unavailable-id' && retryCount < 3) {
                  console.log('[Peer] Doctor not available, retrying...');
                  setTimeout(() => attemptCall(retryCount + 1), 2000);
                } else {
                  setStatus('error');
                  setErrorMessage('Erro na conexão de vídeo. O médico pode ter saído da sala.');
                }
              });
            };

            // Aguardar um pouco antes de tentar conectar (dar tempo do médico estar pronto)
            setTimeout(() => attemptCall(0), 1000);
          }
        });

        // Médico recebe chamada do paciente
        if (role === 'doctor') {
          peer.on('call', (call) => {
            console.log('[Peer] Receiving call');
        
            // 🔴 FECHAR chamada antiga (reentrada)
            if (callRef.current) {
              callRef.current.close();
              callRef.current = null;
            }
        
            call.answer(localStreamRef.current!);
            callRef.current = call;
        
            call.on('stream', (remoteStream) => {
              console.log('[Peer] Received remote stream', remoteStream);
            
              const video = remoteVideoRef.current;
              if (video) {
                video.srcObject = remoteStream;
            
                // CRÍTICO
                video.onloadedmetadata = () => {
                  video.play().catch(err => {
                    console.warn('Video play failed:', err);
                  });
                };
              }
            
              setStatus('connected');
            });
            
        
            call.on('close', () => {
              setStatus('waiting');
            });
        
            call.on('error', (err) => {
              console.error('[Peer] Call error:', err);
            });
          });
        }
        

        peer.on('error', (err) => {
          console.error('[Peer] Error:', err.type, err);

          // Tratar diferentes tipos de erro
          switch (err.type) {
            case 'unavailable-id':
              // Este ID já está sendo usado - pode ser uma reconexão
              setErrorMessage('Sessão anterior ainda ativa. Aguarde alguns segundos e tente novamente.');
              break;
            case 'invalid-id':
              setErrorMessage('ID de conexão inválido.');
              break;
            case 'browser-incompatible':
              setErrorMessage('Seu navegador não suporta videochamadas. Use Chrome, Firefox ou Edge.');
              break;
            case 'disconnected':
              setErrorMessage('Conexão perdida. Recarregue a página.');
              break;
            case 'network':
              setErrorMessage('Erro de rede. Verifique sua conexão com a internet.');
              break;
            case 'server-error':
              setErrorMessage('Erro no servidor de videochamada. Tente novamente.');
              break;
            case 'socket-error':
            case 'socket-closed':
              setErrorMessage('Conexão perdida com o servidor. Recarregue a página.');
              break;
            default:
              setErrorMessage(`Erro de conexão: ${err.type}`);
          }

          setStatus('error');
        });

        peer.on('disconnected', () => {
          console.log('[Peer] Disconnected from signaling server');
          // NÃO usar reconnect() - não é confiável para media calls
          // Se precisar reconectar, criar novo peer
          setStatus('disconnected');
          setErrorMessage('Conexão perdida. Recarregue a página.');
        });

      } catch (error: unknown) {
        console.error('Error initializing WebRTC:', error);
        const message = error instanceof Error
          ? error.message
          : 'Erro ao inicializar câmera/microfone';
        setErrorMessage(message);
        setStatus('error');
        onError?.(message);
      }
    };

    initializeWebRTC();

    // Cleanup ao desmontar
    return () => {
      // CRÍTICO: StrictMode chama cleanup SEM ser unmount real
      // Apenas fecha MediaConnection, NUNCA destrói Peer aqui
      cleanup(false);
    };
  }, [roomData, role]); // cleanup e onError são estáveis, não precisam estar nas deps

  // Handle beforeunload para médico
  useEffect(() => {
    if (role !== 'doctor') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Tentar finalizar ao fechar aba
      teleconsultService.endAppointment(appointmentId).catch(() => {});

      e.preventDefault();
      e.returnValue = 'A teleconsulta será encerrada. Deseja sair?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [role, appointmentId]);

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Renderizar status
  const renderStatus = () => {
    switch (status) {
      case 'connecting':
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Conectando...</span>
          </div>
        );
      case 'waiting':
        return (
          <div className="flex items-center gap-2 text-amber-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Aguardando {role === 'doctor' ? 'paciente' : 'médico'} entrar...</span>
          </div>
        );
      case 'connected':
        return (
          <div className="flex items-center gap-2 text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Conectado</span>
          </div>
        );
      case 'disconnected':
        return (
          <div className="flex items-center gap-2 text-amber-600">
            <span>Conexão perdida</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <span>{errorMessage || 'Erro na conexão'}</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (status === 'error' && !roomData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-red-500 mb-4">
          <VideoOff className="w-16 h-16 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Erro ao carregar teleconsulta
        </h2>
        <p className="text-muted-foreground mb-4">{errorMessage}</p>
        <Button onClick={onEnd}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-gray-900">
      {/* Videos */}
      <div className="flex-1 relative min-h-0">
        {/* Video remoto (grande) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain bg-black"
        />

        {/* Overlay de status quando não conectado */}
        {status !== 'connected' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            {renderStatus()}
          </div>
        )}

        {/* Video local (pequeno, canto) */}
        <div className="absolute bottom-4 right-4 w-32 h-24 sm:w-48 sm:h-36 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
          />
          {isVideoOff && (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-gray-500" />
            </div>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="relative flex items-center justify-center gap-4 p-4 bg-gray-800 flex-shrink-0">
        {/* Status */}
        <div className="absolute left-4 hidden sm:block">
          {renderStatus()}
        </div>

        {/* Botões de controle */}
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-colors ${
            isMuted
              ? 'bg-red-500 text-white'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
          title={isMuted ? 'Ativar microfone' : 'Desativar microfone'}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-colors ${
            isVideoOff
              ? 'bg-red-500 text-white'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
          title={isVideoOff ? 'Ativar câmera' : 'Desativar câmera'}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>

        <button
          onClick={handleEndCall}
          disabled={isEnding}
          className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          title={role === 'doctor' ? 'Encerrar consulta' : 'Sair da sala'}
        >
          {isEnding ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <PhoneOff className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
}
