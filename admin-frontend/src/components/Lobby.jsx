import { useState } from "react";
import api from "../api/axios";
import useRoomSocket from "../hooks/useRoomSocket";

export default function Lobby() {

  const [roomName, setRoomName] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [players, setPlayers] = useState([]);

  const createRoom = async () => {

    try {

      const response = await api.post("/rooms/create/", {
        name: roomName,
      });

      setRoomData(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  useRoomSocket(roomData?.code, (data) => {

    if (data.event === "PLAYER_JOINED") {

      setPlayers((prev) => [
        ...prev,
        data.player
      ]);
    }
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-6">

      <h1 className="text-5xl font-bold">
        U&I IceBreaker
      </h1>

      <input
        type="text"
        placeholder="Enter Room Name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        className="px-4 py-3 rounded-xl bg-zinc-800 w-80 outline-none"
      />

      <button
        onClick={createRoom}
        className="bg-white text-black px-6 py-3 rounded-xl font-semibold"
      >
        Create Room
      </button>

      {roomData && (
        <div className="bg-zinc-900 p-6 rounded-2xl text-center">

          <h2 className="text-2xl font-bold">
            Room Created
          </h2>

          <p className="text-5xl mt-4 font-black tracking-widest">
            {roomData.code}
          </p>

        </div>
      )}

      <div className="mt-6 w-80">

        <h3 className="text-xl font-bold mb-3">
          Joined Players
        </h3>

        <div className="flex flex-col gap-2">

          {players.map((player) => (
            <div
              key={player.id}
              className="bg-zinc-800 px-4 py-3 rounded-xl"
            >
              {player.name}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}