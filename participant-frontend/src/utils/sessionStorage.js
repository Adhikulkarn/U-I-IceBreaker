const PLAYER_ID_KEY = "participant_player_id";
const ROOM_CODE_KEY = "participant_room_code";
const PLAYER_NAME_KEY = "participant_player_name";

export function saveParticipantSession({ playerId, roomCode, playerName }) {
  localStorage.setItem(PLAYER_ID_KEY, String(playerId));
  localStorage.setItem(ROOM_CODE_KEY, roomCode);
  localStorage.setItem(PLAYER_NAME_KEY, playerName);
}

export function getParticipantSession() {
  const playerId = localStorage.getItem(PLAYER_ID_KEY);
  const roomCode = localStorage.getItem(ROOM_CODE_KEY);
  const playerName = localStorage.getItem(PLAYER_NAME_KEY);

  if (!playerId || !roomCode || !playerName) {
    return null;
  }

  return {
    playerId: Number(playerId),
    roomCode,
    playerName,
  };
}

export function clearParticipantSession() {
  localStorage.removeItem(PLAYER_ID_KEY);
  localStorage.removeItem(ROOM_CODE_KEY);
  localStorage.removeItem(PLAYER_NAME_KEY);
}
