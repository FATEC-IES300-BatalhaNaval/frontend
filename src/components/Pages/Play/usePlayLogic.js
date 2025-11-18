import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useMatch } from "../../../hooks/useMatch";

import introMusic from "../../../sound/OST/Intro.mp3";
import battleMusic from "../../../sound/OST/Battle.mp3";
import { getUserCards } from "../../../services/userService";

export default function usePlayLogic(match_id) {
  const { user, setUserAtt } = useAuth();
  const {
    getMatch,
    getShipDefinitions,
    placeFleet,
    startMatch,
    shoot,
    skipTurn,
    pickCards,
    playCard,
  } = useMatch();

  const boardRef = useRef(null);
  const shipsRef = useRef(null);
  const enemyBoardRef = useRef(null);
  const enemyShipsRef = useRef(null);

  const [activeCard, setActiveCard] = useState(null);

  const introRef = useRef(null);
  const battleRef = useRef(null);

  const [match, setMatch] = useState(null);
  const [shipDefs, setShipDefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [activeEmoji, setActiveEmoji] = useState(null);
  const [isDeckPopupOpen, setIsDeckPopupOpen] = useState(false);

  const meId = user?.data?.user_id || user?.user_id;
  const mePlayer = () => match?.player?.find(p => p.user_id === meId);
  const enemyPlayer = () => match?.player?.find(p => p.user_id !== meId);

  const playerHasPlaced = () => (mePlayer()?.player_ship?.length || 0) > 0;
  const enemyHasPlaced = () => (enemyPlayer()?.player_ship?.length || 0) > 0;
  const isMyTurn = () => match?.current_user_id === meId;

  const [ownedCards, setOwnedCards] = useState([]);

  const shots = useMemo(() => {
    const enemyGrid = enemyPlayer()?.grid_cell || [];
    return enemyGrid.map(c => ({
      x: c.x,
      y: c.y,
      isHit: c.is_hit && c.ship_id
    }));
  }, [enemyPlayer]);

  // Música
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

  useEffect(() => {
    if (!match) return;

    if (match.state === "LOBBY" || match.state === "SHIP_PLACEMENT") {
      battleRef.current.pause();
      introRef.current.play().catch(() => {});
    }

    if (match.state === "ACTIVE") {
      introRef.current.pause();
      battleRef.current.play().catch(() => {});
    }

    if (match.state === "FINISHED") {
      introRef.current.pause();
      battleRef.current.pause();
    }
  }, [match?.state]);

  // Carrega tudo ao abrir a partida
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [defs, matchData, cardsData] = await Promise.all([
          getShipDefinitions(),
          getMatch(match_id),
          getUserCards(),
        ]);

        setShipDefs(Array.isArray(defs) ? defs : []);
        setMatch(matchData);
        setOwnedCards(cardsData?.cards || []);

        const me = matchData?.player?.find(p => p.user_id === meId);
        if (me?.player_ship?.length > 0) {
          shipsRef.current?.setFleetFromBackend(me.player_ship);
        }

      } catch (err) {
        console.error("Erro ao carregar partida:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [getMatch, getShipDefinitions, match_id, meId]);

  // Polling inteligente: somente quando não for meu turno ou em fases iniciais
useEffect(() => {
  if (!match) return;

  const shouldPoll =
    match.state !== "ACTIVE" || !isMyTurn();

  if (!shouldPoll) return;

  const interval = setInterval(async () => {
    try {
      const updated = await getMatch(match_id);

      if (!updated) return;

      setMatch(updated);

      const me = updated.player?.find(p => p.user_id === meId);
      if (me?.player_ship?.length > 0) {
        shipsRef.current?.setFleetFromBackend(me.player_ship);
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  }, 3000);

  return () => clearInterval(interval);
}, [match, match_id, getMatch, meId, isMyTurn]);


  const handleDeckSave = useCallback(() => {
    setUserAtt?.(p => !p);
  }, [setUserAtt]);

  const handleConfirmPlacement = async () => {
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
  };

  const handleStartMatch = async () => {
    try {
      setSubmitting(true);
      await startMatch(match_id);
    } catch (err) {
      console.error("Erro ao iniciar partida:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCellClick = async (x, y) => {
    if (!match?.state || match.state !== "ACTIVE") return;
    if (!isMyTurn()) return;
    if (submitting) return;

    setSubmitting(true);

    try {
      let updated;

      if (activeCard) {
        updated = await playCard(match_id, activeCard.card_id, x, y);
        setActiveCard(null);
      } else {
        updated = await shoot(match_id, x, y);
      }

      if (updated) {
        setMatch(updated);

        const me = updated.player?.find(p => p.user_id === meId);
        if (me?.player_ship?.length > 0) {
          shipsRef.current?.setFleetFromBackend(me.player_ship);
        }
      }
    } catch (err) {
      console.error("Erro ao atirar/jogar carta:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const stateUI = {
    isLobby: match?.state === "LOBBY",
    isPlacement: match?.state === "SHIP_PLACEMENT",
    isCardPicking: match?.state === "CARD_PICKING",
    isActive: match?.state === "ACTIVE",
    isFinished: match?.state === "FINISHED",
  };

  return {
    loading,
    submitting,
    match,
    shipDefs,
    setMatch,
        
    boardRef,
    shipsRef,
    enemyBoardRef,
    enemyShipsRef,

    mePlayer,
    enemyPlayer,
    stateUI,
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
    skipTurn,
    getMatch,
    pickCards,
    ownedCards,

    activeCard,
    setActiveCard
  };
}
