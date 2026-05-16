import { useState } from "react";
import api from "../api/axios";

export default function Lobby() {

  const [roomName, setRoomName] = useState("");
  const [roomData, setRoomData] = useState(null);

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
    </div>
  );
}