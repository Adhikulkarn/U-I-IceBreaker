export function createEmptyGameState() {
  return {
    room: null,
    players: [],
    teams: [],
    activeChallenge: null,
    leaderboard: [],
    gameState: "LOBBY",
    currentRound: 0,
  };
}

export function normalizeChallenge(challenge) {
  if (!challenge) {
    return null;
  }

  return {
    ...challenge,
    challenge_type: challenge.challenge_type ?? challenge.type ?? "",
  };
}

export function normalizeRoomState(state) {
  const room = state?.room ?? null;

  return {
    room,
    players: state?.players ?? [],
    teams: state?.teams ?? [],
    activeChallenge: normalizeChallenge(state?.active_challenge),
    leaderboard: state?.leaderboard ?? [],
    gameState:
      state?.game_state ??
      room?.game_state ??
      "LOBBY",
    currentRound:
      state?.current_round ??
      room?.current_round ??
      0,
  };
}

export function applyLegacyRoomEvent(gameState, payload) {
  if (payload.event === "PLAYER_JOINED") {
    if (gameState.players.some((player) => player.id === payload.player.id)) {
      return gameState;
    }

    return {
      ...gameState,
      players: [
        ...gameState.players,
        payload.player,
      ],
    };
  }

  if (payload.event === "PLAYER_LEFT") {
    return {
      ...gameState,
      players: gameState.players.filter(
        (player) => player.id !== payload.player_id
      ),
      teams: gameState.teams.map((team) => ({
        ...team,
        players: team.players.filter(
          (player) => player.id !== payload.player_id
        ),
      })),
    };
  }

  if (payload.event === "ROUND_STARTED") {
    return {
      ...gameState,
      room: gameState.room
        ? {
            ...gameState.room,
            current_round:
              payload.current_round ??
              gameState.room.current_round,
            game_state:
              payload.game_state ??
              gameState.room.game_state,
          }
        : gameState.room,
      gameState:
        payload.game_state ??
        gameState.gameState,
      currentRound:
        payload.current_round ??
        gameState.currentRound,
    };
  }

  if (payload.event === "CHALLENGE_UPDATED") {
    return {
      ...gameState,
      activeChallenge: normalizeChallenge(payload.challenge),
    };
  }

  if (payload.event === "LEADERBOARD_UPDATE") {
    const scoreByTeamId = new Map(
      (payload.leaderboard ?? []).map((team) => [team.team_id, team.score])
    );

    return {
      ...gameState,
      leaderboard: payload.leaderboard ?? [],
      teams: gameState.teams.map((team) => (
        scoreByTeamId.has(team.id)
          ? {
              ...team,
              score: scoreByTeamId.get(team.id),
            }
          : team
      )),
    };
  }

  return gameState;
}
