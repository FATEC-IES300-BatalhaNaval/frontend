import { useRef, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

import { useAuth } from "../../../hooks/useAuth";
import { useMatch } from "../../../hooks/useMatch";

// Fases
import LobbyPhase from "./phases/LobbyPhase";
import PlacementPhase from "./phases/PlacementPhase";
import WaitingPlacementPhase from "./phases/WaitingPlacementPhase";
import BattlePhase from "./phases/BattlePhase";
import FinishedPhase from "./phases/FinishedPhase";

export default function Play() {
  const { match_id } = useParams();
  const { user, setUserAtt } = useAuth();

  const {
    getMatch,
    getShipDefinitions,
    placeFleet,
    startMatch
  } = useMatch();

  const boardRef = useRef(null);
  const shipsRef = useRef(null);
  const enemyBoardRef = useRef(null);
  const enemyShipsRef = useRef(null);

  const [match, setMatch] = useState(null);
  const [shipDefs, setShipDefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [shots, setShots] = useState([]);
  const [activeEmoji, setActiveEmoji] = useState(null);
  const [isDeckPopupOpen, setIsDeckPopupOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState("player");

  // Helpers -------------------------------------------------------------

  const meId = user?.data?.user_id || user?.user_id;

  function mePlayer() {
    return match?.player?.find(p => p.user_id === meId);
  }

  function enemyPlayer() {
    return match?.player?.find(p => p.user_id !== meId);
  }

  const playerHasPlaced = () =>
    (mePlayer()?.player_ship?.length || 0) > 0;

  const enemyHasPlaced = () =>
    (enemyPlayer()?.player_ship?.length || 0) > 0;

  // Initial load --------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [defs, matchData] = await Promise.all([
          getShipDefinitions(),
          getMatch(match_id),
        ]);

        setShipDefs(Array.isArray(defs) ? defs : []);
        setMatch(matchData);

        if (matchData && playerHasPlaced()) {
          shipsRef.current?.setFleetFromBackend(mePlayer().player_ship);
        }

      } catch (err) {
        console.error("Erro ao carregar partida:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getMatch, getShipDefinitions, match_id]);

  // Polling -------------------------------------------------------------
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updated = await getMatch(match_id);

        setMatch(prev => {
          if (prev && prev.state === updated?.state) {
            return updated;
          }
          return updated;
        });

        if (updated && updated.player) {
          const me = updated.player.find(p => p.user_id === meId);
          if (me && me.player_ship?.length > 0) {
            shipsRef.current?.setFleetFromBackend(me.player_ship);
          }
        }
      } catch (err) {
        console.error("Erro no polling da partida:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [match_id, getMatch, meId]);

  // Deck update ---------------------------------------------------------
  const handleDeckSave = useCallback(() => {
    setUserAtt?.(p => !p);
  }, [setUserAtt]);

  // Fleet placement -----------------------------------------------------
  async function handleConfirmPlacement() {
    if (playerHasPlaced()) return;

    try {
      setSubmitting(true);
      const fleet = shipsRef.current.getFleetForBackend();
      await placeFleet(match_id, fleet);

      const updated = await getMatch(match_id);
      setMatch(updated);

    } catch (err) {
      console.error("Erro ao enviar frota:", err);
    } finally {
      setSubmitting(false);
    }
  }

  // Start match ---------------------------------------------------------
  async function handleStartMatch() {
    try {
      setSubmitting(true);

      await startMatch(match_id);

      const updated = await getMatch(match_id);
      setMatch(updated);

    } catch (err) {
      console.error("Erro ao iniciar partida:", err);
    } finally {
      setSubmitting(false);
    }
  }

  // Turns ---------------------------------------------------------------
  useEffect(() => {
    if (match?.state !== "ACTIVE") return;

    if (currentPlayer === "enemy") {
      const t = setTimeout(() => setCurrentPlayer("player"), 2000);
      return () => clearTimeout(t);
    }
  }, [match, currentPlayer]);

  // Enemy cell click ----------------------------------------------------
  const handleCellClick = (x, y) => {
    if (match?.state !== "ACTIVE") return;
    if (currentPlayer !== "player") return;

    if (shots.some(s => s.x === x && s.y === y)) return;

    const cols = ["A","B","C","D","E","F","G","H","I","J"];
    const coord = `${cols[x]}${y + 1}`;

    const hit = enemyShipsRef.current.registerHit(x, y);
    alert(hit ? `Acertou em ${coord}!` : `Errou em ${coord}!`);

    setShots(prev => [...prev, { x, y, isHit: !!hit }]);
    setCurrentPlayer("enemy");
  };

  // UI ------------------------------------------------------------------

  if (loading) {
    return <div style={{ padding: 20 }}>Carregando partida...</div>;
  }

  if (!match) {
    return <div style={{ padding: 20 }}>Erro ao carregar partida.</div>;
  }

  // ------------------ PHASES ------------------

  if (match.state === "LOBBY") {
    return (
      <LobbyPhase
        match={match}
        meId={meId}
        submitting={submitting}
        handleStartMatch={handleStartMatch}
      />
    );
  }

  if (match.state === "SHIP_PLACEMENT") {
    if (!playerHasPlaced()) {
      return (
        <PlacementPhase
          shipDefs={shipDefs}
          boardRef={boardRef}
          shipsRef={shipsRef}
          submitting={submitting}
          handleConfirmPlacement={handleConfirmPlacement}
          handleDeckSave={handleDeckSave}
          isDeckPopupOpen={isDeckPopupOpen}
          setIsDeckPopupOpen={setIsDeckPopupOpen}
          user={user}
        />
      );
    }

    if (!enemyHasPlaced()) {
      return <WaitingPlacementPhase />;
    }
  }

  if (match.state === "ACTIVE") {
    return (
      <BattlePhase
        mePlayer={mePlayer}
        enemyPlayer={enemyPlayer}
        shipDefs={shipDefs}
        boardRef={boardRef}
        shipsRef={shipsRef}
        enemyBoardRef={enemyBoardRef}
        enemyShipsRef={enemyShipsRef}
        shots={shots}
        currentPlayer={currentPlayer}
        setCurrentPlayer={setCurrentPlayer}
        activeEmoji={activeEmoji}
        setActiveEmoji={setActiveEmoji}
        handleCellClick={handleCellClick}
      />
    );
  }

  if (match.state === "FINISHED") {
    return <FinishedPhase />;
  }

  return <div>Estado desconhecido.</div>;
}
