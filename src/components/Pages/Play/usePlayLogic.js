import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useMatch } from "../../../hooks/useMatch";

import introMusic from "../../../sound/OST/Intro.mp3";
import battleMusic from "../../../sound/OST/Battle.mp3";

export default function usePlayLogic(match_id) {
  const { user, setUserAtt } = useAuth();

  const {
    getMatch,
    getShipDefinitions,
    placeFleet,
    startMatch,
    shoot
  } = useMatch();

  // -------------------------------------------------------------------
  // Refs
  // -------------------------------------------------------------------
  const boardRef = useRef(null);
  const shipsRef = useRef(null);
  const enemyBoardRef = useRef(null);
  const enemyShipsRef = useRef(null);

  // Audio refs
  const introRef = useRef(null);
  const battleRef = useRef(null);

  // -------------------------------------------------------------------
  // States
  // -------------------------------------------------------------------
  const [match, setMatch] = useState(null);
  const [shipDefs, setShipDefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [shots, setShots] = useState([]);
  const [activeEmoji, setActiveEmoji] = useState(null);
  const [isDeckPopupOpen, setIsDeckPopupOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState("player");

  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------
  const meId = user?.data?.user_id || user?.user_id;

  const mePlayer = () => match?.player?.find(p => p.user_id === meId);
  const enemyPlayer = () => match?.player?.find(p => p.user_id !== meId);

  const playerHasPlaced = () =>
    (mePlayer()?.player_ship?.length || 0) > 0;

  const enemyHasPlaced = () =>
    (enemyPlayer()?.player_ship?.length || 0) > 0;

  // -------------------------------------------------------------------
  // Audio setup (once)
  // -------------------------------------------------------------------
  useEffect(() => {
    introRef.current = new Audio(introMusic);
    battleRef.current = new Audio(battleMusic);

    introRef.current.loop = true;
    battleRef.current.loop = true;

    return () => {
      introRef.current?.pause();
      battleRef.current?.pause();
    };
  }, []);

  // -------------------------------------------------------------------
  // Audio switching based on match.state
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!match) return;

    const state = match.state;

    // Lobby + Placement → Intro Music
    if (state === "LOBBY" || state === "SHIP_PLACEMENT") {
      battleRef.current.pause();
      battleRef.current.currentTime = 0;

      introRef.current.play().catch(() => {});
    }

    // Active battle → Battle Music
    if (state === "ACTIVE") {
      introRef.current.pause();
      introRef.current.currentTime = 0;

      battleRef.current.play().catch(() => {});
    }

    // Finished → stop all
    if (state === "FINISHED") {
      introRef.current.pause();
      battleRef.current.pause();
    }

  }, [match?.state]);

  // -------------------------------------------------------------------
  // Load initial match + ship definitions
  // -------------------------------------------------------------------
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

  // -------------------------------------------------------------------
  // Polling a cada 2s
  // -------------------------------------------------------------------
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updated = await getMatch(match_id);

        setMatch(prev => {
          if (prev && prev.state === updated?.state) return updated;
          return updated;
        });

        const me = updated?.player?.find(p => p.user_id === meId);
        if (me && me.player_ship?.length > 0) {
          shipsRef.current?.setFleetFromBackend(me.player_ship);
        }
      } catch (err) {
        console.error("Erro no polling:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [match_id, getMatch, meId]);

  // -------------------------------------------------------------------
  // Deck Save
  // -------------------------------------------------------------------
  const handleDeckSave = useCallback(() => {
    setUserAtt?.(p => !p);
  }, [setUserAtt]);

  // -------------------------------------------------------------------
  // Confirm placement
  // -------------------------------------------------------------------
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

  // -------------------------------------------------------------------
  // Start match
  // -------------------------------------------------------------------
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

  // -------------------------------------------------------------------
  // Turn system
  // -------------------------------------------------------------------
  useEffect(() => {
    if (match?.state !== "ACTIVE") return;

    if (currentPlayer === "enemy") {
      const t = setTimeout(() => setCurrentPlayer("player"), 2000);
      return () => clearTimeout(t);
    }
  }, [match, currentPlayer]);

  // -------------------------------------------------------------------
  // Shooting logic
  // -------------------------------------------------------------------
  const handleCellClick = async (x, y) => {
    if (match?.state !== "ACTIVE") return;
    if (currentPlayer !== "player") return;

    if (shots.some(s => s.x === x && s.y === y)) return;

    try {
      setSubmitting(true);

      const updated = await shoot(match_id, x, y);
      setMatch(updated);

      const enemyGrid = enemyPlayer()?.grid_cell || [];
      const cell = enemyGrid.find(c => c.x === x && c.y === y);

      const isHit = cell?.is_hit && cell?.ship_id;

      setShots(prev => [...prev, { x, y, isHit: !!isHit }]);
      setCurrentPlayer("enemy");

    } catch (err) {
      console.error("Erro ao atirar:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------------
  // State UI helpers
  // -------------------------------------------------------------------
  const stateUI = {
    isLobby: match?.state === "LOBBY",
    isPlacement: match?.state === "SHIP_PLACEMENT",
    isActive: match?.state === "ACTIVE",
    isFinished: match?.state === "FINISHED",
  };

  // -------------------------------------------------------------------
  // Retorno do hook
  // -------------------------------------------------------------------
  return {
    // basic
    loading,
    submitting,
    match,
    shipDefs,

    // refs
    boardRef,
    shipsRef,
    enemyBoardRef,
    enemyShipsRef,

    // UI helpers
    stateUI,
    mePlayer,
    enemyPlayer,
    playerHasPlaced,
    enemyHasPlaced,

    // states
    activeEmoji,
    setActiveEmoji,
    isDeckPopupOpen,
    setIsDeckPopupOpen,
    shots,

    // actions
    handleDeckSave,
    handleConfirmPlacement,
    handleStartMatch,
    handleCellClick,
  };
}
