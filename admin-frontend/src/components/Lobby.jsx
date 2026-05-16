import { useState } from "react";
import api from "../api/axios";
import useRoomSocket from "../hooks/useRoomSocket";
import { challengeTemplates } from "../data/challengeTemplates";

export default function Lobby() {

  const [roomName, setRoomName] = useState("");
  const [roomData, setRoomData] = useState(null);

  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);

  const [teamSize, setTeamSize] = useState(4);

  const [challengeType, setChallengeType] = useState("PHOTO");
  const [activeChallenge, setActiveChallenge] = useState(null);

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

    if (data.event === "ROUND_STARTED") {
      console.log("Round Started", data);
    }

    if (data.event === "LEADERBOARD_UPDATE") {
      console.log("Leaderboard Updated", data);
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

  const generateRandomChallenge = () => {

    const challenges = challengeTemplates[challengeType];

    const randomChallenge =
      challenges[Math.floor(Math.random() * challenges.length)];

    setActiveChallenge({
      ...randomChallenge,
      challenge_type: challengeType,
    });
  };

  const createChallenge = async () => {

    if (!activeChallenge) return;

    try {

      await api.post("/challenges/create/", {
        room_code: roomData.code,
        title: activeChallenge.title,
        description: activeChallenge.description,
        challenge_type: activeChallenge.challenge_type,
        duration: activeChallenge.duration,
      });

    } catch (error) {
      console.error(error);
    }
  };

  const startRound = async () => {

    try {

      await api.post("/rooms/start-round/", {
        room_code: roomData.code,
      });

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-12 flex flex-col items-center">

      <h1 className="text-5xl font-bold mb-8">
        U&I IceBreaker
      </h1>

      {!roomData && (
        <div className="flex flex-col items-center gap-4">

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

        </div>
      )}

      {roomData && (

        <>
          <div className="bg-zinc-900 p-6 rounded-2xl text-center">

            <h2 className="text-2xl font-bold">
              Room Created
            </h2>

            <p className="text-5xl mt-4 font-black tracking-widest">
              {roomData.code}
            </p>

          </div>

          <div className="flex items-center gap-4 mt-6">

            <input
              type="number"
              min="2"
              max="10"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              className="px-4 py-3 rounded-xl bg-zinc-800 w-32 outline-none text-center"
            />

            <button
              onClick={generateTeams}
              className="bg-green-500 text-black px-6 py-3 rounded-xl font-bold"
            >
              Generate Teams
            </button>

          </div>

          <div className="mt-10 w-80">

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

          {teams.length > 0 && (

            <div className="mt-12 w-full max-w-5xl">

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

          <div className="mt-16 w-full max-w-3xl bg-zinc-900 rounded-2xl p-8">

            <h2 className="text-3xl font-bold mb-6">
              Challenge Control
            </h2>

            <div className="flex flex-col gap-4">

              <select
                value={challengeType}
                onChange={(e) => setChallengeType(e.target.value)}
                className="px-4 py-3 rounded-xl bg-zinc-800 outline-none"
              >
                <option value="PHOTO">PHOTO</option>
                <option value="PITCH">PITCH</option>
                <option value="PERFORMANCE">PERFORMANCE</option>
              </select>

              <div className="flex gap-4 flex-wrap">

                <button
                  onClick={generateRandomChallenge}
                  className="bg-blue-500 text-black px-6 py-3 rounded-xl font-bold"
                >
                  Generate Random Challenge
                </button>

                <button
                  onClick={createChallenge}
                  className="bg-green-500 text-black px-6 py-3 rounded-xl font-bold"
                >
                  Push Challenge
                </button>

                <button
                  onClick={startRound}
                  className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold"
                >
                  Start Round
                </button>

              </div>

            </div>

            {activeChallenge && (

              <div className="mt-8 bg-zinc-800 rounded-2xl p-6">

                <h2 className="text-2xl font-bold">
                  Active Challenge
                </h2>

                <h3 className="text-4xl font-black mt-4">
                  {activeChallenge.title}
                </h3>

                <p className="mt-4 text-zinc-300">
                  {activeChallenge.description}
                </p>

                <div className="flex gap-4 mt-6">

                  <div className="bg-zinc-700 px-4 py-2 rounded-xl">
                    {activeChallenge.challenge_type}
                  </div>

                  <div className="bg-zinc-700 px-4 py-2 rounded-xl">
                    {activeChallenge.duration}s
                  </div>

                </div>

              </div>
            )}

          </div>

        </>
      )}

    </div>
  );
}