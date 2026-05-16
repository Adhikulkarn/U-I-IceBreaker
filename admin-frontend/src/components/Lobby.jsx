import { useEffect, useState } from "react";
import api from "../api/axios";
import useGameState from "../hooks/useGameState";
import useRoomSocket from "../hooks/useRoomSocket";
import { challengeTemplates } from "../data/challengeTemplates";
import {
  applyLegacyRoomEvent,
  normalizeRoomState,
} from "../utils/gameState";

export default function Lobby() {

  const [roomName, setRoomName] = useState("");
  const [teamSize, setTeamSize] = useState(4);
  const [challengeType, setChallengeType] = useState("PHOTO");
  const [rooms, setRooms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [customScores, setCustomScores] = useState({});
  const [loading, setLoading] = useState(false);
  const {
    gameState,
    setGameState,
    resetGameState,
  } = useGameState();

  const roomData = gameState.room;
  const players = gameState.players;
  const teams = gameState.teams;
  const activeChallenge = gameState.activeChallenge;
  const leaderboard = gameState.leaderboard;

  const createRoom = async () => {

    setLoading(true);

    try {

      const response = await api.post("/rooms/create/", {
        name: roomName,
      });

      setGameState((prev) => ({
        ...prev,
        room: response.data,
        gameState: response.data.game_state ?? "LOBBY",
        currentRound: response.data.current_round ?? 0,
      }));

      localStorage.setItem(
        "admin_room_code",
        response.data.code
      );

      await fetchRooms();

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {

    setLoading(true);

    try {

      const response = await api.get("/rooms/");

      setRooms(response.data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const restoreRoom = async (roomCode) => {

    setLoading(true);

    try {

      const response = await api.get(
        `/rooms/state/${roomCode}/`
      );

      const data = response.data;

      setGameState(normalizeRoomState(data));

    } catch (error) {

      console.error(error);

      localStorage.removeItem("admin_room_code");
    } finally {
      setLoading(false);
    }
  };

  const reconnectRoom = async (roomCode) => {

    localStorage.setItem(
      "admin_room_code",
      roomCode
    );

    await restoreRoom(roomCode);
  };

  const resetActiveRoom = () => {

    resetGameState();
    setSubmissions([]);
    setCustomScores({});

    localStorage.removeItem("admin_room_code");
  };

  useEffect(() => {

    fetchRooms();

    const savedRoomCode =
      localStorage.getItem("admin_room_code");

    if (savedRoomCode) {
      restoreRoom(savedRoomCode);
    }

  }, []);

  useRoomSocket(roomData?.code, (data) => {

    if (data.event === "ROOM_DELETED") {

      setRooms((prev) => (
        prev.filter((room) => room.code !== data.room_code)
      ));

      if (roomData?.code === data.room_code) {
        resetActiveRoom();
      }

      return;
    }

    if (data.event === "ROOM_STATE_UPDATED") {

      setGameState(normalizeRoomState(data.state));
      return;
    }

    setGameState((prev) => applyLegacyRoomEvent(prev, data));
  });

  const handleDeleteRoom = async (roomCode) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this room?"
    );

    if (!confirmed) return;

    setLoading(true);

    try {

      await api.delete(`/rooms/delete/${roomCode}/`);

      setRooms((prev) => (
        prev.filter((room) => room.code !== roomCode)
      ));

      if (roomData?.code === roomCode) {
        resetActiveRoom();
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateTeams = async () => {

    setLoading(true);

    try {

      const response = await api.post("/teams/generate/", {
        room_code: roomData.code,
        team_size: teamSize,
      });

      setGameState((prev) => ({
        ...prev,
        teams: response.data,
      }));

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomChallenge = () => {

    const challenges = challengeTemplates[challengeType];

    const randomChallenge =
      challenges[Math.floor(Math.random() * challenges.length)];

    setGameState((prev) => ({
      ...prev,
      activeChallenge: {
        ...randomChallenge,
        challenge_type: challengeType,
      },
    }));
  };

  const createChallenge = async () => {

    if (!activeChallenge) return;

    setLoading(true);

    try {

      const response = await api.post("/challenges/create/", {
        room_code: roomData.code,
        title: activeChallenge.title,
        description: activeChallenge.description,
        challenge_type: activeChallenge.challenge_type,
        duration: activeChallenge.duration,
      });

      setGameState((prev) => ({
        ...prev,
        activeChallenge: response.data,
      }));

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startRound = async () => {

    setLoading(true);

    try {

      await api.post("/rooms/start-round/", {
        room_code: roomData.code,
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {

    if (!activeChallenge?.id) return;

    setLoading(true);

    try {

      const response = await api.get(
        `/challenges/submissions/${activeChallenge.id}/`
      );

      setSubmissions(response.data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const awardPoints = async (teamId, points) => {

    setLoading(true);

    try {

      await api.post("/teams/score/", {
        team_id: teamId,
        points: points,
      });

      return true;

    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomScore = (teamId, value) => {

    if (value === "") {

      setCustomScores((prev) => ({
        ...prev,
        [teamId]: "",
      }));

      return;
    }

    const parsedValue = Number.parseInt(value, 10);

    if (Number.isNaN(parsedValue)) {
      return;
    }

    const boundedValue = Math.min(10, Math.max(1, parsedValue));

    setCustomScores((prev) => ({
      ...prev,
      [teamId]: String(boundedValue),
    }));
  };

  const handleCustomAward = async (teamId) => {

    const value = customScores[teamId];
    const parsedValue = Number.parseInt(value, 10);

    if (
      !value ||
      Number.isNaN(parsedValue) ||
      parsedValue < 1 ||
      parsedValue > 10
    ) {
      return;
    }

    const awarded = await awardPoints(teamId, parsedValue);

    if (awarded) {
      setCustomScores((prev) => ({
        ...prev,
        [teamId]: "",
      }));
    }
  };

  const leaveRoom = () => {

    localStorage.removeItem("admin_room_code");

    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-12 flex flex-col items-center">

      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-zinc-800 z-[100] overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse w-full"></div>
        </div>
      )}

      <h1 className="text-5xl font-bold mb-8">
        U&I IceBreaker
      </h1>

      {rooms.length > 0 && !roomData && (

        <div className="w-full max-w-6xl mb-12">

          <h2 className="text-3xl font-bold mb-6 text-center">
            Existing Rooms
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {rooms.map((room) => (

              <div
                key={room.id}
                className="bg-zinc-900 rounded-2xl p-6"
              >

                <h3 className="text-2xl font-bold">
                  {room.name}
                </h3>

                <p className="text-4xl font-black mt-4 tracking-widest">
                  {room.code}
                </p>

                <div className="mt-4 flex flex-col gap-2 text-zinc-300">

                  <p>
                    Players: {room.player_count}
                  </p>

                  <p>
                    State: {room.game_state}
                  </p>

                  <p>
                    Round: {room.current_round}
                  </p>

                </div>

                <button
                  onClick={() => reconnectRoom(room.code)}
                  disabled={loading}
                  className="mt-6 bg-blue-500 text-black px-5 py-3 rounded-xl font-bold w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reconnect Room
                </button>

                <button
                  onClick={() => handleDeleteRoom(room.code)}
                  disabled={loading}
                  className="mt-3 bg-red-500 text-black px-5 py-3 rounded-xl font-bold w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Room
                </button>

              </div>

            ))}

          </div>

        </div>
      )}

      {!roomData && (

        <div className="flex flex-col items-center gap-4">

          <input
            type="text"
            placeholder="Enter Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            disabled={loading}
            className="px-4 py-3 rounded-xl bg-zinc-800 w-80 outline-none disabled:opacity-50"
          />

          <button
            onClick={createRoom}
            disabled={loading || !roomName.trim()}
            className="bg-white text-black px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Room"}
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

            <button
              onClick={leaveRoom}
              disabled={loading}
              className="mt-6 bg-red-500 text-black px-5 py-2 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Leave Room
            </button>

            <button
              onClick={() => handleDeleteRoom(roomData.code)}
              disabled={loading}
              className="mt-3 bg-red-700 text-white px-5 py-2 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Room
            </button>

          </div>

          <div className="flex items-center gap-4 mt-6">

            <input
              type="number"
              min="2"
              max="10"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              disabled={loading}
              className="px-4 py-3 rounded-xl bg-zinc-800 w-32 outline-none text-center disabled:opacity-50"
            />

            <button
              onClick={generateTeams}
              disabled={loading}
              className="bg-green-500 text-black px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate Teams"}
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

          {teams.length > 0 && (

            <div className="mt-12 w-full max-w-5xl">

              <h2 className="text-3xl font-bold mb-6 text-center">
                Manual Team Scoring
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {teams.map((team) => (

                  <div
                    key={team.id}
                    className="bg-zinc-900 rounded-2xl p-6 flex flex-col gap-5"
                  >

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                      <h3 className="text-2xl font-bold">
                        {team.name}
                      </h3>

                      <p className="text-3xl font-black text-yellow-400">
                        {team.score ?? 0}
                      </p>

                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">

                      {[1, 5, 10].map((points) => (

                        <button
                          key={points}
                          onClick={() => awardPoints(team.id, points)}
                          disabled={loading}
                          className="bg-yellow-400 text-black px-5 py-3 rounded-2xl font-bold flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +{points}
                        </button>

                      ))}

                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">

                      <input
                        type="number"
                        min="1"
                        max="10"
                        step="1"
                        inputMode="numeric"
                        value={customScores[team.id] ?? ""}
                        onChange={(e) =>
                          updateCustomScore(team.id, e.target.value)
                        }
                        disabled={loading}
                        placeholder="1-10"
                        className="bg-zinc-800 text-white px-4 py-3 rounded-2xl outline-none border border-zinc-700 flex-1 disabled:opacity-50"
                      />

                      <button
                        onClick={() => handleCustomAward(team.id)}
                        disabled={loading || !customScores[team.id]}
                        className="bg-yellow-400 text-black px-5 py-3 rounded-2xl font-bold sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Award
                      </button>

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
                disabled={loading}
                className="px-4 py-3 rounded-xl bg-zinc-800 outline-none disabled:opacity-50"
              >
                <option value="PHOTO">PHOTO</option>
                <option value="PITCH">PITCH</option>
                <option value="PERFORMANCE">PERFORMANCE</option>
              </select>

              <div className="flex gap-4 flex-wrap">

                <button
                  onClick={generateRandomChallenge}
                  disabled={loading}
                  className="bg-blue-500 text-black px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Random Challenge
                </button>

                <button
                  onClick={createChallenge}
                  disabled={loading || !activeChallenge}
                  className="bg-green-500 text-black px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Pushing..." : "Push Challenge"}
                </button>

                <button
                  onClick={startRound}
                  disabled={loading || !activeChallenge?.id}
                  className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Starting..." : "Start Round"}
                </button>

                <button
                  onClick={fetchSubmissions}
                  disabled={loading || !activeChallenge?.id}
                  className="bg-purple-500 text-black px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Load Submissions"}
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

              </div>
            )}

          </div>

          {submissions.length > 0 && (

            <div className="mt-16 w-full max-w-6xl">

              <h2 className="text-4xl font-bold mb-8 text-center">
                Submission Review
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {submissions.map((submission) => (

                  <div
                    key={submission.id}
                    className="bg-zinc-900 rounded-2xl overflow-hidden"
                  >

                    <img
                      src={submission.image_url}
                      alt="submission"
                      className="w-full h-80 object-cover"
                    />

                    <div className="p-6">

                      <h3 className="text-3xl font-bold">
                        {submission.team.name}
                      </h3>

                      <div className="flex gap-3 mt-6">

                        {[1, 5, 10].map((points) => (

                          <button
                            key={points}
                            onClick={() =>
                              awardPoints(submission.team.id, points)
                            }
                            disabled={loading}
                            className="bg-yellow-400 text-black px-5 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +{points}
                          </button>

                        ))}

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>
          )}

          {leaderboard.length > 0 && (

            <div className="mt-16 w-full max-w-3xl">

              <h2 className="text-4xl font-bold mb-8 text-center">
                Leaderboard
              </h2>

              <div className="flex flex-col gap-4">

                {leaderboard.map((team, index) => (

                  <div
                    key={team.team_id}
                    className="bg-zinc-900 px-6 py-5 rounded-2xl flex justify-between items-center"
                  >

                    <div>

                      <p className="text-zinc-400">
                        #{index + 1}
                      </p>

                      <h3 className="text-2xl font-bold">
                        {team.team_name}
                      </h3>

                    </div>

                    <p className="text-4xl font-black">
                      {team.score}
                    </p>

                  </div>

                ))}

              </div>

            </div>
          )}

        </>
      )}

    </div>
  );
}
