import { Navigate, Route, Routes } from "react-router-dom";
import JoinPage from "./pages/JoinPage";
import LobbyPage from "./pages/LobbyPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<JoinPage />} />
      <Route path="/lobby" element={<LobbyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
