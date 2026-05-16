import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HUDStat from "../components/HUDStat";
import LeaderboardCard from "../components/LeaderboardCard";
import LoadingBar from "../components/LoadingBar";
import PhotoSubmission from "../components/PhotoSubmission";
import PixelButton from "../components/PixelButton";
import RetroCard from "../components/RetroCard";
import ScreenShell from "../components/ScreenShell";
import TeamStatusCard from "../components/TeamStatusCard";
import useCountdown from "../hooks/useCountdown";
import useGameState from "../hooks/useGameState";
import useRoomSocket from "../hooks/useRoomSocket";
import {
  getPlayerState,
  leaveRoom,
  submitPhotoChallenge,
} from "../services/gameService";
import {
  clearSession,
} from "../services/storage";
import {
  getParticipantSession,
  saveParticipantSession,
} from "../utils/sessionStorage";
import {
  applyLegacyPlayerEvent,
  normalizePlayerState,
} from "../utils/gameState";

export default function LobbyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roomClosed, setRoomClosed] = useState(false);
  const [submittingPhoto, setSubmittingPhoto] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const {
    gameState,
    setGameState,
    resetGameState,
  } = useGameState();

  const player = gameState.player;
  const roomCode = gameState.roomCode;
  const room = gameState.room;
  const players = gameState.players;
  const team = gameState.team;
  const leaderboard = gameState.leaderboard;
  const activeChallenge = gameState.activeChallenge;

  const loadParticipantState = useCallback(async (currentPlayerId, activeRoomCode) => {
    if (!currentPlayerId || !activeRoomCode) return;

    try {
      const playerState = await getPlayerState(currentPlayerId);

      setGameState(prev => {
        const normalizedState = normalizePlayerState(
          playerState,
          activeRoomCode,
          prev.player
        );

        if (normalizedState.player?.id && normalizedState.player?.name) {
          saveParticipantSession({
            playerId: normalizedState.player.id,
            roomCode: normalizedState.roomCode,
            playerName: normalizedState.player.name,
          });
        }
        return normalizedState;
      });
    } catch (requestError) {
      if (requestError.response?.status === 404) {
        clearSession();
        resetGameState();
        navigate("/", { replace: true });
        return;
      }
      throw requestError;
    }
  }, [navigate, resetGameState, setGameState]);

  useEffect(() => {
    const session = getParticipantSession();

    if (!session || !session.playerId || !session.roomCode) {
      navigate("/", { replace: true });
      return;
    }

    setGameState((prev) => ({
      ...prev,
      player: {
        id: session.playerId,
        name: session.playerName,
      },
      roomCode: session.roomCode,
    }));

    let mounted = true;

    const hydrate = async () => {
      setLoading(true);
      setError("");

      try {
        await loadParticipantState(session.playerId, session.roomCode);
      } catch (requestError) {
        if (!mounted) return;
        
        if (requestError.response?.status === 404) {
          return;
        }

        clearSession();
        setError(
          requestError.response?.data?.error ??
            "Unable to reconnect to this room."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    hydrate();

    return () => {
      mounted = false;
    };
  }, [loadParticipantState, navigate]);

  const handleSocketMessage = useCallback(
    async (payload) => {
      if (payload.event === "ROOM_STATE_UPDATED") {
        const session = getParticipantSession();
        
        setGameState(prev => {
          const currentPlayer = prev.player ??
            (session
              ? {
                  id: session.playerId,
                  name: session.playerName,
                }
              : null);

          return normalizePlayerState(
            {
              ...payload.state,
              player: currentPlayer,
            },
            session?.roomCode ?? prev.roomCode,
            currentPlayer
          );
        });
        return;
      }

      if (payload.event === "ROOM_DELETED") {
        clearSession();
        setRoomClosed(true);
        resetGameState();

        window.setTimeout(() => {
          navigate("/", { replace: true });
        }, 1200);

        return;
      }

      if (payload.event === "TEAMS_GENERATED") {
        const session = getParticipantSession();

        if (!session || !session.playerId) {
          return;
        }

        setLoading(true);

        try {
          await loadParticipantState(
            session.playerId,
            session.roomCode
          );
        } catch (requestError) {
          if (requestError.response?.status === 404) return;
          
          setError(
            requestError.response?.data?.error ??
              "Unable to refresh your assigned team."
          );
        } finally {
          setLoading(false);
        }
        return;
      }

      setGameState((prev) => applyLegacyPlayerEvent(prev, payload));
    },
    [loadParticipantState, navigate, resetGameState, setGameState]
  );

  useRoomSocket(roomCode, handleSocketMessage);

  const isRoundActive =
    gameState.gameState === "ROUND_ACTIVE";
  const timer = useCountdown(
    activeChallenge?.duration,
    activeChallenge?.started_at
  );

  const challengeType =
    activeChallenge?.challenge_type?.toUpperCase?.() ?? "";

  const handleLeave = async () => {
    const session = getParticipantSession();

    try {
      if (session?.playerId) {
        await leaveRoom({
          player_id: session.playerId,
        });
      }
    } catch (requestError) {
      if (requestError.response?.status !== 404) {
        console.error(requestError);
      }
    } finally {
      clearSession();
      resetGameState();
      navigate("/", { replace: true });
    }
  };

  const handlePhotoSubmit = async ({ challengeId, teamId, image }) => {
    setSubmittingPhoto(true);
    setSubmissionMessage("");

    try {
      await submitPhotoChallenge({
        challengeId,
        teamId,
        image,
      });
      setSubmissionMessage("Photo submitted successfully.");
      return true;
    } catch (requestError) {
      setSubmissionMessage(
        requestError.response?.data?.error ??
          "Upload failed. Try again with a different image."
      );
      return false;
    } finally {
      setSubmittingPhoto(false);
    }
  };

  const playerCount = useMemo(() => players.length, [players]);

  if (loading) {
    return (
      <ScreenShell>
        <div className="flex flex-1 items-center justify-center">
          <RetroCard className="w-full max-w-lg text-center" glow="green">
            <p className="font-pixel text-xs uppercase tracking-[0.18em] text-neonGreen">
              Recovering Session
            </p>
            <p className="mt-4 text-sm text-zinc-300">
              Restoring your player state and reconnecting to the room.
            </p>
          </RetroCard>
        </div>
      </ScreenShell>
    );
  }

  if (roomClosed) {
    return (
      <ScreenShell>
        <div className="flex flex-1 items-center justify-center">
          <RetroCard className="w-full max-w-lg space-y-5 text-center" glow="pink">
            <p className="font-pixel text-xs uppercase tracking-[0.18em] text-neonPink">
              Room Closed
            </p>
            <p className="text-sm text-zinc-300">
              The host deleted this room. Returning to the join screen.
            </p>
          </RetroCard>
        </div>
      </ScreenShell>
    );
  }

  if (error) {
    return (
      <ScreenShell>
        <div className="flex flex-1 items-center justify-center">
          <RetroCard className="w-full max-w-lg space-y-5 text-center">
            <p className="font-pixel text-xs uppercase tracking-[0.18em] text-neonPink">
              Connection Lost
            </p>
            <p className="text-sm text-zinc-300">{error}</p>
            <PixelButton onClick={handleLeave}>
              Return Home
            </PixelButton>
          </RetroCard>
        </div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-pixel text-[0.58rem] uppercase tracking-[0.22em] text-neonGreen">
            Player Terminal
          </p>
          <h1 className="mt-3 break-words font-pixel text-base uppercase leading-relaxed text-white sm:text-xl lg:text-2xl">
            U&amp;I IceBreaker
          </h1>
        </div>
        <PixelButton
          variant="ghost"
          className="w-full sm:w-auto sm:shrink-0"
          onClick={handleLeave}
        >
          Exit Room
        </PixelButton>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <RetroCard className="space-y-5" glow="pink">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-pixel text-[0.6rem] uppercase tracking-[0.18em] text-neonPink">
                  {isRoundActive ? "Round Active" : "Waiting For Host"}
                </p>
                <h2 className="mt-4 break-words text-lg font-bold text-white sm:text-2xl lg:text-3xl">
                  {isRoundActive
                    ? "Challenge feed is live."
                    : "Stand by in the multiplayer lobby."}
                </h2>
              </div>
              <div className="w-fit rounded-full border-4 border-borderGlow bg-hud px-3 py-2 font-pixel text-[0.52rem] uppercase tracking-[0.14em] text-neonGreen">
                {room?.game_state ?? "LOBBY"}
              </div>
            </div>

            <LoadingBar active={isRoundActive} />

            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              <HUDStat label="Player" value={player?.name ?? "--"} />
              <HUDStat label="Room Code" value={roomCode} accent="green" />
              <HUDStat
                label="Players Joined"
                value={`${playerCount}`}
                accent="green"
              />
              <HUDStat
                label="Team"
                value={team?.name ?? "Assigning..."}
              />
            </div>
          </RetroCard>

          <TeamStatusCard team={team} />

          <RetroCard className="space-y-5" glow="green">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-pixel text-[0.6rem] uppercase tracking-[0.18em] text-neonGreen">
                  Active Challenge
                </p>
                <h2 className="mt-4 break-words text-lg font-bold text-white sm:text-2xl lg:text-3xl">
                  {activeChallenge?.title ?? "Waiting for next challenge..."}
                </h2>
              </div>
              <div className="w-fit rounded-full border-4 border-borderGlow bg-hud px-3 py-2 font-pixel text-[0.52rem] uppercase tracking-[0.14em] text-neonPink">
                {timer}
              </div>
            </div>

            <p className="text-sm leading-6 text-zinc-300 sm:text-base">
              {activeChallenge?.description ??
                "The host will push the next challenge to everyone in the room."}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <HUDStat
                label="Challenge Type"
                value={challengeType || "Pending"}
                accent="green"
              />
              <HUDStat
                label="Team Ready"
                value={team?.name ?? "Waiting"}
              />
            </div>

            {challengeType === "PHOTO" ? (
              <PhotoSubmission
                challengeId={activeChallenge?.id}
                teamId={team?.id}
                onSubmit={handlePhotoSubmit}
                isSubmitting={submittingPhoto}
                disabled={!activeChallenge?.id || !team?.id}
              />
            ) : null}

            {challengeType === "PITCH" ? (
              <div className="pixel-corners rounded-2xl border-4 border-neonPink bg-neonPink/10 px-4 py-5 text-sm leading-6 text-zinc-200 sm:text-base">
                Perform live in front of everyone!
              </div>
            ) : null}

            {challengeType === "PERFORMANCE" ? (
              <div className="pixel-corners rounded-2xl border-4 border-neonGreen bg-neonGreen/10 px-4 py-5 text-sm leading-6 text-zinc-200 sm:text-base">
                Get ready to perform live!
              </div>
            ) : null}

            {submissionMessage ? (
              <div className="pixel-corners break-words rounded-2xl border-4 border-borderGlow bg-hud px-4 py-4 text-sm leading-6 text-zinc-200 sm:text-base">
                {submissionMessage}
              </div>
            ) : null}
          </RetroCard>
        </div>

        <div className="space-y-6">
          <RetroCard className="space-y-5" glow="pink">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-pixel text-[0.6rem] uppercase tracking-[0.18em] text-neonPink">
                  Leaderboard
                </p>
                <h2 className="mt-4 break-words text-lg font-bold text-white sm:text-2xl lg:text-3xl">
                  Team Rankings
                </h2>
              </div>
              <div className="w-fit rounded-full border-4 border-borderGlow bg-hud px-3 py-2 font-pixel text-[0.52rem] uppercase tracking-[0.14em] text-neonGreen">
                Live
              </div>
            </div>

            <div className="space-y-4">
              {leaderboard.length > 0 ? (
                leaderboard.map((team, index) => (
                  <LeaderboardCard
                    key={team.team_id}
                    rank={index + 1}
                    team={team}
                  />
                ))
              ) : (
                <div className="pixel-corners rounded-2xl border-4 border-borderGlow bg-hud px-4 py-5 text-sm text-zinc-400">
                  No scores yet. The leaderboard will light up once points land.
                </div>
              )}
            </div>
          </RetroCard>
        </div>
      </div>
    </ScreenShell>
  );
}
