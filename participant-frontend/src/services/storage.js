import {
  clearParticipantSession,
  getParticipantSession,
  saveParticipantSession,
} from "../utils/sessionStorage";

export function saveSession({ player, roomCode }) {
  saveParticipantSession({
    playerId: player.id,
    roomCode,
    playerName: player.name,
  });
}

export function getStoredPlayer() {
  const session = getParticipantSession();

  if (!session) {
    return null;
  }

  return {
    id: session.playerId,
    name: session.playerName,
  };
}

export function getStoredRoomCode() {
  return getParticipantSession()?.roomCode ?? null;
}

export function clearSession() {
  clearParticipantSession();
}
