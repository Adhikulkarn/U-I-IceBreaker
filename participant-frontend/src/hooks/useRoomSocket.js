import { useEffect, useRef } from "react";

const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL ?? "ws://127.0.0.1:8000/ws/game";

export default function useRoomSocket(roomCode, onMessage) {
  const onMessageRef = useRef(onMessage);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const closedByEffectRef = useRef(false);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!roomCode) {
      if (socketRef.current && socketRef.current.readyState < WebSocket.CLOSING) {
        socketRef.current.close();
      }

      return undefined;
    }

    let attempts = 0;
    closedByEffectRef.current = false;

    const connect = () => {
      if (socketRef.current && socketRef.current.readyState < WebSocket.CLOSING) {
        return;
      }

      const socket = new WebSocket(`${WS_BASE_URL}/${roomCode}/`);
      socketRef.current = socket;

      socket.onmessage = (event) => {
        attempts = 0;
        const payload = JSON.parse(event.data);
        onMessageRef.current?.(payload);
      };

      socket.onclose = () => {
        if (closedByEffectRef.current) {
          return;
        }

        socketRef.current = null;
        const delay = Math.min(1000 * 2 ** attempts, 6000);
        attempts += 1;
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => {
      closedByEffectRef.current = true;
      window.clearTimeout(reconnectTimerRef.current);

      if (socketRef.current && socketRef.current.readyState < WebSocket.CLOSING) {
        socketRef.current.close();
      }

      socketRef.current = null;
    };
  }, [roomCode]);
}
