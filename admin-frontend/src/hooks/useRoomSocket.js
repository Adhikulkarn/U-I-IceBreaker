import { useEffect } from "react";

export default function useRoomSocket(roomCode, onMessage) {

  useEffect(() => {

    if (!roomCode) return;

    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/game/${roomCode}/`
    );

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    socket.onopen = () => {
      console.log("WebSocket Connected");
    };

    socket.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => {
      socket.close();
    };

  }, [roomCode]);
}