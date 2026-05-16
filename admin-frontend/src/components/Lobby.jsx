import { useState } from "react";
import api from "../api/axios";
import useRoomSocket from "../hooks/useRoomSocket";

export default function Lobby() {

  const [roomName, setRoomName] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamSize, setTeamSize] = useState(4);

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

  const generateTeams = async () => {

    try {

      const response = await api.post("/teams/generate/", {
        room_code: roomData.code,
        team_size: teamSize,
      });

      setTeams(response.data);

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

      {roomData && (
        <input
          type="number"
          min="2"
          max="10"
          value={teamSize}
          onChange={(e) => setTeamSize(e.target.value)}
          placeholder="Team Size"
          className="px-4 py-3 rounded-xl bg-zinc-800 w-40 outline-none text-center mt-4"
        />
      )}

      {roomData && (
        <div className="flex items-center gap-4 mt-4">

          <input
            type="number"
            min="2"
            max="10"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            placeholder="Team Size"
            className="px-4 py-3 rounded-xl bg-zinc-800 w-32 outline-none text-center"
          />

          <button
            onClick={generateTeams}
            className="bg-green-500 text-black px-6 py-3 rounded-xl font-bold"
          >
            Generate Teams
          </button>

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

          {teams.length > 0 && (

            <div className="mt-10 w-full max-w-5xl">

              <h2 className="text-3xl font-bold mb-6 text-center">
                Teams
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {teams.map((team) => (

                  <div
                    key={team.id}
                    className="bg-zinc-900 rounded-2xl p-6"
                  >

                    <h3 className="text-2xl font-bold mb-4">
                      {team.name}
                    </h3>

                    <div className="flex flex-col gap-3">

                      {team.players.map((player) => (

                        <div
                          key={player.id}
                          className="bg-zinc-800 px-4 py-3 rounded-xl"
                        >
                          {player.name}
                        </div>

                      ))}

                    </div>

                  </div>

                ))}

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}