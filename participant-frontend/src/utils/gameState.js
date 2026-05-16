export function createEmptyGameState() {
  return {
    room: null,
    players: [],
    teams: [],
    activeChallenge: null,
    leaderboard: [],
    gameState: "LOBBY",
    currentRound: 0,
    roomCode: "",
    player: null,
    team: null,
  };
}

export function normalizeChallenge(challenge) {
  if (!challenge) {
    return null;
  }

  return {
    id: challenge.id ?? null,
    title: challenge.title ?? "Untitled Challenge",
    description: challenge.description ?? "",
    challenge_type: challenge.challenge_type ?? challenge.type ?? "",
    duration: challenge.duration ?? null,
    started_at: challenge.started_at ?? null,
  };
}

export function normalizeRoomState(state, fallbackRoomCode = "") {
  const room = state?.room ?? null;
  const roomCode = room?.code ?? fallbackRoomCode;

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
    roomCode,
  };
}

function deriveTeam(teams, player, explicitTeam) {
  if (explicitTeam) {
    return explicitTeam;
  }

  if (!player) {
    return null;
  }

  return (
    teams.find((team) =>
      team.players?.some((teamPlayer) => teamPlayer.id === player.id)
    ) ?? null
  );
}

export function normalizePlayerState(state, fallbackRoomCode, currentPlayer = null) {
  const roomState = normalizeRoomState(state, fallbackRoomCode);
  const player = state?.player ?? currentPlayer ?? null;
  const teams = roomState.teams.length > 0
    ? roomState.teams
    : state?.team
      ? [state.team]
      : [];
  const team = deriveTeam(
    teams,
    player,
    state?.team ?? null
  );

  return {
    ...roomState,
    teams,
    player,
    team,
    roomCode:
      roomState.roomCode ||
      state?.player?.room_code ||
      state?.team?.room_code ||
      fallbackRoomCode ||
      "",
  };
}

export function applyLegacyPlayerEvent(gameState, payload) {
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
    const teams = gameState.teams.map((team) => ({
      ...team,
      players: (team.players ?? []).filter(
        (player) => player.id !== payload.player_id
      ),
    }));
    const currentTeam = gameState.team
      ? {
          ...gameState.team,
          players: (gameState.team.players ?? []).filter(
            (player) => player.id !== payload.player_id
          ),
        }
      : null;

    return {
      ...gameState,
      players: gameState.players.filter(
        (player) => player.id !== payload.player_id
      ),
      teams,
      team: currentTeam,
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
    const teams = gameState.teams.map((team) => (
      scoreByTeamId.has(team.id)
        ? {
            ...team,
            score: scoreByTeamId.get(team.id),
          }
        : team
    ));
    const currentTeam = gameState.team && scoreByTeamId.has(gameState.team.id)
      ? {
          ...gameState.team,
          score: scoreByTeamId.get(gameState.team.id),
        }
      : gameState.team;

    return {
      ...gameState,
      leaderboard: payload.leaderboard ?? [],
      teams,
      team: currentTeam,
    };
  }

  return gameState;
}
