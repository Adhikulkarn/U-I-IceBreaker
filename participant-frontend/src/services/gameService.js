import api from "./api";

export async function joinRoom(payload) {
  const response = await api.post("/players/join/", payload);
  return response.data;
}

export async function leaveRoom(payload) {
  const response = await api.post("/players/leave/", payload);
  return response.data;
}

export async function getPlayerState(playerId) {
  const response = await api.get(`/players/state/${playerId}/`);
  return response.data;
}

export async function getRoomState(roomCode) {
  const response = await api.get(`/rooms/state/${roomCode}/`);
  return response.data;
}

export async function getActiveChallenge(roomCode) {
  const response = await api.get(`/challenges/active/${roomCode}/`);
  return response.data;
}

export async function submitPhotoChallenge({ challengeId, teamId, image }) {
  const formData = new FormData();
  formData.append("challenge_id", challengeId);
  formData.append("team_id", teamId);
  formData.append("image", image);

  const response = await api.post("/challenges/submit/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
