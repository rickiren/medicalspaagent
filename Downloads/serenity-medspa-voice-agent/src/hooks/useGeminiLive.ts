import { useState, useCallback } from 'react';
import { ConnectionStatus } from '../../types';

interface UseGeminiLiveOptions {
  apiKey?: string;
  systemInstruction?: string;
  onTranscript?: (text: string, isUser: boolean) => void;
}

export const useGeminiLive = (options: UseGeminiLiveOptions = {}) => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);

  const connect = useCallback(() => {
    setStatus(ConnectionStatus.CONNECTING);
    // Stub implementation - in a real app, this would connect to Gemini Live API
    setTimeout(() => {
      setStatus(ConnectionStatus.CONNECTED);
    }, 1000);
  }, []);

  const disconnect = useCallback(() => {
    setStatus(ConnectionStatus.DISCONNECTED);
    setIsSpeaking(false);
    setAudioVolume(0);
  }, []);

  return {
    status,
    connect,
    disconnect,
    isSpeaking,
    audioVolume,
  };
};

