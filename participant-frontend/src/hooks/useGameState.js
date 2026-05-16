import { useCallback, useState } from "react";
import { createEmptyGameState } from "../utils/gameState";

export default function useGameState() {
  const [gameState, setGameState] = useState(createEmptyGameState);

  const resetGameState = useCallback(() => {
    setGameState(createEmptyGameState());
  }, []);

  return {
    gameState,
    setGameState,
    resetGameState,
  };
}
