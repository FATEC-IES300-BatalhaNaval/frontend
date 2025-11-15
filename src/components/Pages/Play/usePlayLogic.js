import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useMatch } from "../../../hooks/useMatch";

import introMusic from "../../../sound/OST/Intro.mp3";
import battleMusic from "../../../sound/OST/Battle.mp3";

export default function usePlayLogic(match_id) {
  const { user, setUserAtt } = useAuth();
  const { getMatch, getShipDefinitions, placeFleet, startMatch, shoot } = useMatch();

  const boardRef = useRef(null);
  const shipsRef = useRef(null);
  const enemyBoardRef = useRef(null);
  const enemyShipsRef = useRef(null);

  const introRef = useRef(null);
  const battleRef = useRef(null);

  const [match, setMatch] = useState(null);
  const [shipDefs, setShipDefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [shots, setShots] = useState([]); // recebe hits e misses do jogador

  const [activeEmoji, setActiveEmoji] = useState(null);
  const [isDeckPopupOpen, setIsDeckPopupOpen] = useState(false);

  const meId = user?.data?.user_id || user?.user_id;
  const mePlayer = () => match?.player?.find(p => p.user_id === meId);
  const enemyPlayer = () => match?.player?.find(p => p.user_id !== meId);

  const playerHasPlaced = () => (mePlayer()?.player_ship?.length || 0) > 0;
  const enemyHasPlaced = () => (enemyPlayer()?.player_ship?.length || 0) > 0;

  const isMyTurn = () => match?.current_user_id === meId;

  // Inicializa sons
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

  // Troca música por estado da partida
  useEffect(() => {
    if (!match) return;
    const state = match.state;

    if (state === "LOBBY" || state === "SHIP_PLACEMENT") {
      battleRef.current.pause();
      battleRef.current.currentTime = 0;
      introRef.current.play().catch(() => {});
    }

    if (state === "ACTIVE") {
      introRef.current.pause();
      introRef.current.currentTime = 0;
      battleRef.current.play().catch(() => {});
    }

    if (state === "FINISHED") {
      introRef.current.pause();
      battleRef.current.pause();
    }
  }, [match?.state]);

  // Carrega partida + navios inicialmente
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

        if (matchData) {
          const me = matchData.player?.find(p => p.user_id === meId);
          if (me?.grid_cell) {
            setShots(
              me.grid_cell.map(c => ({
                x: c.x, y: c.y, isHit: !!c.ship_id
              }))
            );
          }
        }

      } catch (err) {
        console.error("Erro ao carregar partida:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getMatch, getShipDefinitions, match_id]);

  // Polling contínuo
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updated = await getMatch(match_id);
        setMatch(updated);

        const me = updated?.player?.find(p => p.user_id === meId);
        if (me) {
          if (me.player_ship?.length > 0) {
            shipsRef.current?.setFleetFromBackend(me.player_ship);
          }
          if (me.grid_cell) {
            setShots(
              me.grid_cell.map(c => ({
                x: c.x, y: c.y, isHit: !!c.ship_id
              }))
            );
          }
        }

      } catch (err) {
        console.error("Erro no polling:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [match_id, getMatch, meId]);

  const handleDeckSave = useCallback(() => {
    setUserAtt?.(p => !p);
  }, [setUserAtt]);

  async function handleConfirmPlacement() {
    if (playerHasPlaced()) return;
    try {
      setSubmitting(true);
      const fleet = shipsRef.current.getFleetForBackend();
      await placeFleet(match_id, fleet);
    } catch (err) {
      console.error("Erro ao enviar frota:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStartMatch() {
    try {
      setSubmitting(true);
      await startMatch(match_id);
    } catch (err) {
      console.error("Erro ao iniciar partida:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCellClick(x, y) {
    if (!isMyTurn()) return;
    if (match?.state !== "ACTIVE") return;

    try {
      setSubmitting(true);
      const updated = await shoot(match_id, x, y);
      setMatch(updated);
    } catch (err) {
      console.error("Erro ao atirar:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const stateUI = {
    isLobby: match?.state === "LOBBY",
    isPlacement: match?.state === "SHIP_PLACEMENT",
    isActive: match?.state === "ACTIVE",
    isFinished: match?.state === "FINISHED",
  };

  return {
    loading,
    submitting,
    match,
    shipDefs,

    boardRef,
    shipsRef,
    enemyBoardRef,
    enemyShipsRef,

    stateUI,
    mePlayer,
    enemyPlayer,
    playerHasPlaced,
    enemyHasPlaced,
    isMyTurn,

    activeEmoji,
    setActiveEmoji,
    isDeckPopupOpen,
    setIsDeckPopupOpen,

    shots,

    handleDeckSave,
    handleConfirmPlacement,
    handleStartMatch,
    handleCellClick,
  };
}
