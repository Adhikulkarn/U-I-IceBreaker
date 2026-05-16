import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PixelButton from "../components/PixelButton";
import PixelInput from "../components/PixelInput";
import RetroCard from "../components/RetroCard";
import ScreenShell from "../components/ScreenShell";
import { getPlayerState, joinRoom } from "../services/gameService";
import {
  clearSession,
  saveSession,
} from "../services/storage";
import { getParticipantSession } from "../utils/sessionStorage";

export default function JoinPage() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const session = getParticipantSession();

      if (!session || !session.playerId) {
        if (mounted) setRestoring(false);
        return;
      }

      try {
        await getPlayerState(session.playerId);
        if (mounted) {
          navigate("/lobby", { replace: true });
        }
      } catch (err) {
        if (mounted) {
          clearSession();
          setRestoring(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const trimmedName = playerName.trim();
      const normalizedRoomCode = roomCode.trim().toUpperCase();

      const player = await joinRoom({
        name: trimmedName,
        room_code: normalizedRoomCode,
      });

      saveSession({
        player,
        roomCode: normalizedRoomCode,
      });

      navigate("/lobby");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ??
          "Unable to enter room. Check your code and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenShell>
      <div className="flex flex-1 items-center justify-center">
        <RetroCard
          className="mx-auto w-full max-w-2xl animate-pulse-glow px-4 py-6 sm:px-8 sm:py-10 lg:px-10"
          glow="pink"
        >
          <div className="space-y-8">
            <div className="space-y-4 text-center">
              <p className="font-pixel text-[0.52rem] uppercase tracking-[0.22em] text-neonGreen sm:text-[0.62rem] sm:tracking-[0.28em]">
                Multiplayer Arcade Lobby
              </p>
              <h1 className="text-shadow-neon break-words font-pixel text-xl uppercase leading-relaxed text-white sm:text-3xl lg:text-4xl">
                U&amp;I IceBreaker
              </h1>
              <p className="mx-auto max-w-xl text-sm leading-6 text-zinc-300 sm:text-base">
                Drop into the room, sync with the crowd, and wait for the next
                live challenge to go active.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <PixelInput
                label="Player Name"
                placeholder="Type your arcade tag"
                value={playerName}
                onChange={(event) => setPlayerName(event.target.value)}
                maxLength={100}
                required
              />

              <PixelInput
                label="Room Code"
                placeholder="Enter 6-letter code"
                value={roomCode}
                onChange={(event) =>
                  setRoomCode(event.target.value.toUpperCase())
                }
                maxLength={6}
                required
              />

              {error ? (
                <div className="pixel-corners rounded-2xl border-4 border-neonPink bg-neonPink/10 px-4 py-3 text-sm text-neonPink">
                  {error}
                </div>
              ) : null}

              <PixelButton
                type="submit"
                className="w-full animate-float"
                disabled={
                  restoring ||
                  submitting ||
                  !playerName.trim() ||
                  !roomCode.trim()
                }
              >
                {restoring
                  ? "Restoring..."
                  : submitting
                    ? "Joining..."
                    : "Enter Room"}
              </PixelButton>
            </form>
          </div>
        </RetroCard>
      </div>
    </ScreenShell>
  );
}
