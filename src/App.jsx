import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Header from "./components/Pages/Header/Header.jsx";
import Lobby from "./components/Pages/Lobby/Lobby";
import Play from "./components/Pages/Play/Play";
import Perfil from "./components/Pages/Perfil/Perfil";
import Store from "./components/Pages/Store/Store";
import Login from "./components/Pages/Login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Settings from "./components/Pages/Settings/Settings.jsx";

function AppContent() {
  const location = useLocation();

  const hideHeaderOnPaths = ["/Login"];
  const shouldShowHeader = !hideHeaderOnPaths.includes(location.pathname);

  return (
    <>
      {shouldShowHeader && <Header />}
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/lobby" />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/play/:match_id" element={<Play />} />
          <Route path="/Perfil" element={<Perfil />} />
          <Route path="/Store" element={<Store />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        {/* 404 not found */}
        <Route path="*" element={<div>404 - Página Não Encontrada</div>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;