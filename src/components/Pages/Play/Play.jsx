import { useParams } from "react-router-dom";

// Hook centralizado
import usePlayLogic from "./usePlayLogic";

// Fases
import LobbyPhase from "./phases/LobbyPhase";
import PlacementPhase from "./phases/PlacementPhase";
import WaitingPlacementPhase from "./phases/WaitingPlacementPhase";
import BattlePhase from "./phases/BattlePhase";
import FinishedPhase from "./phases/FinishedPhase";

export default function Play() {
  const { match_id } = useParams();

  const {
    // estado geral
    loading,
    match,
    shipDefs,

    // refs
    boardRef,
    shipsRef,
    enemyBoardRef,
    enemyShipsRef,

    // helpers
    mePlayer,
    enemyPlayer,
    playerHasPlaced,
    enemyHasPlaced,
    stateUI,

    // estados
    submitting,
    shots,
    activeEmoji,
    setActiveEmoji,
    isDeckPopupOpen,
    setIsDeckPopupOpen,

    // ações
    handleStartMatch,
    handleConfirmPlacement,
    handleDeckSave,
    handleCellClick,
  } = usePlayLogic(match_id);

  if (loading) {
    return <div style={{ padding: 20 }}>Carregando partida...</div>;
  }

  if (!match) {
    return <div style={{ padding: 20 }}>Erro ao carregar partida.</div>;
  }

  // --------------------------- PHASES ---------------------------

  if (stateUI.isLobby) {
    return (
      <LobbyPhase
        match={match}
        meId={mePlayer()?.user_id}
        submitting={submitting}
        handleStartMatch={handleStartMatch}
      />
    );
  }

  if (stateUI.isPlacement) {
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
          user={mePlayer()?.user}
        />
      );
    }

    if (!enemyHasPlaced()) {
      return <WaitingPlacementPhase />;
    }
  }

  if (stateUI.isActive) {
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
        activeEmoji={activeEmoji}
        setActiveEmoji={setActiveEmoji}
        handleCellClick={handleCellClick}
      />
    );
  }

  if (stateUI.isFinished) {
    return <FinishedPhase />;
  }

  return <div>Estado desconhecido.</div>;
}
