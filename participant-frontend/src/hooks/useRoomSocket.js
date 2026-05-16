import { useEffect, useRef } from "react";

const WS_BASE_URL = `${import.meta.env.VITE_WS_URL}/ws/game`;

export default function useRoomSocket(roomCode, onMessage) {
  const onMessageRef = useRef(onMessage);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const closedByEffectRef = useRef(false);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    // Safety guard: do not connect without roomCode
    if (!roomCode) {
      if (socketRef.current) {
        closedByEffectRef.current = true;
        socketRef.current.close();
        socketRef.current = null;
      }
      return undefined;
    }

    let attempts = 0;
    closedByEffectRef.current = false;

    const connect = () => {
      // Prevent multiple simultaneous connections
      if (socketRef.current && socketRef.current.readyState < WebSocket.CLOSING) {
        return;
      }

      // Cleanup any dangling timers
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }

      try {
        const socket = new WebSocket(`${WS_BASE_URL}/${roomCode}/`);
        socketRef.current = socket;

        socket.onmessage = (event) => {
          attempts = 0;
          try {
            const payload = JSON.parse(event.data);
            onMessageRef.current?.(payload);
          } catch (e) {
            console.error("Failed to parse socket message", e);
          }
        };

        socket.onclose = (event) => {
          // If closed by the effect cleanup, do not reconnect
          if (closedByEffectRef.current) {
            return;
          }

          socketRef.current = null;
          
          // Exponential backoff for reconnections (max 10s)
          const delay = Math.min(1000 * 2 ** attempts, 10000);
          attempts += 1;
          
          reconnectTimerRef.current = window.setTimeout(() => {
            if (!closedByEffectRef.current) {
              connect();
            }
          }, delay);
        };

        socket.onerror = () => {
          // socket.onclose will handle the reconnection logic
          socket.close();
        };
      } catch (err) {
        console.error("WebSocket connection error", err);
        // Retry even if the constructor fails (e.g. network down)
        const delay = Math.min(1000 * 2 ** attempts, 10000);
        attempts += 1;
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      }
    };

    connect();

    return () => {
      closedByEffectRef.current = true;
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [roomCode]);
}
