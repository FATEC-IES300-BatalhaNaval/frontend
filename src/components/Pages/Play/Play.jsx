import { useParams } from "react-router-dom";

// Hook centralizado
import usePlayLogic from "./usePlayLogic";

// Fases
import LobbyPhase from "./phases/LobbyPhase";
import CardPickingPhase from "./phases/CardPickingPhase";
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
    getMatch,
    
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
    activeEmoji,
    setActiveEmoji,
    isDeckPopupOpen,
    setIsDeckPopupOpen,
    isMyTurn,

    // ações
    handleStartMatch,
    handleConfirmPlacement,
    handleDeckSave,
    handleCellClick,
    skipTurn,
    pickCards,
    ownedCards,
    // cartão ativo
    activeCard,
    setActiveCard
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
      <div style={{ background: "transparent" }}>
        <LobbyPhase
          match={match}
          meId={mePlayer()?.user_id}
          submitting={submitting}
          handleStartMatch={handleStartMatch}
        />
      </div>
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

  if (stateUI.isCardPicking) {
  return (
    <CardPickingPhase
      ownedCards={ownedCards}
      pickCards={pickCards}
      matchId={match_id}
      mePlayer={mePlayer}
    />
  );
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
        handleCellClick={handleCellClick}
        isMyTurn={isMyTurn}
        activeEmoji={activeEmoji}
        setActiveEmoji={setActiveEmoji}
        matchId={match_id}
        skipTurn={skipTurn}
        getMatch={getMatch}
        activeCard={activeCard}
        setActiveCard={setActiveCard}
      />
    );
  }

  if (stateUI.isFinished) {
    return (
      <FinishedPhase
        match={match}
        mePlayer={mePlayer}
      />
    );
  }

  return <div>Estado desconhecido.</div>;
}
