import Board from "../../../Board/Board";
import Ships from "../../../Ships/Ships";
import Placar from "../../../Placar/Placar";
import TurnIndicator from "../../../TurnIndicator/TurnIndicator";
import Timer from "../../../Timer/Timer";
import Deck from "../../../Deck/Deck";
import styles from "../Play.module.css";
import { useCallback } from "react";

export default function BattlePhase({
  mePlayer,
  enemyPlayer,
  shipDefs,
  boardRef,
  shipsRef,
  enemyBoardRef,
  enemyShipsRef,
  handleCellClick,
  isMyTurn,
  matchId,
  skipTurn,
  getMatch,
  activeCard,
  setActiveCard,
  submitting,
  setMatch
}) {
  const itIsMyTurn = isMyTurn();

  const handleTimeEnd = useCallback(async () => {
    try {
      const updated = await skipTurn(matchId);
      if (updated) {
        setMatch(updated);
      } else {
        const refreshed = await getMatch(matchId);
        setMatch(refreshed);
      }
    } catch (err) {
      console.error("Erro ao pular turno:", err);
    }
  }, [matchId, skipTurn, getMatch]);

  return (
    <div className={styles.playContainer}>
      <Placar
        titulo="Seu Placar"
        ships={mePlayer()?.player_ship || []}
        shipDefs={shipDefs}
      />

      <div className={styles.mainGameArea}>
        <div className={styles.gameStatusContainer}>
          <TurnIndicator currentPlayer={itIsMyTurn ? "player" : "enemy"} />

          <Timer
            duration={30}
            isRunning={itIsMyTurn}
            key={itIsMyTurn ? "player" : "enemy"}
            onTimeEnd={handleTimeEnd}
          />

          {!itIsMyTurn && (
            <span style={{ color: "orange", fontSize: "1.1rem", fontWeight: "bold" }}>
              Aguarde sua vez...
            </span>
          )}
        </div>

        <div className={styles.boardsContainer}>
          <div className={styles.boardWrapper}>
            <Board ref={boardRef} grid={mePlayer()?.grid_cell || []}>
              <Ships
                ref={shipsRef}
                boardRef={boardRef}
                shipDefinitions={shipDefs}
                isLocked={true}
              />
            </Board>
          </div>

          <div className={styles.boardWrapper}>
            <div
              style={{
                pointerEvents: itIsMyTurn && !submitting ? "auto" : "none",
                opacity: itIsMyTurn && !submitting ? 1 : 0.45,
                transition: "opacity .3s ease"
              }}
            >
              <Board
                ref={enemyBoardRef}
                onCellClick={handleCellClick}
                grid={enemyPlayer()?.grid_cell || []}
              >
                <Ships
                  ref={enemyShipsRef}
                  boardRef={enemyBoardRef}
                  shipDefinitions={shipDefs}
                  isLocked={true}
                  areShipsHidden={true}
                />
              </Board>
            </div>
          </div>
        </div>

        <Deck
          cards={mePlayer()?.deck || []}
          activeCard={activeCard}
          setActiveCard={setActiveCard}
        />

      </div>

      <Placar
        titulo="Placar Inimigo"
        ships={enemyPlayer()?.player_ship || []}
        shipDefs={shipDefs}
      />    
    </div>
  );
}
