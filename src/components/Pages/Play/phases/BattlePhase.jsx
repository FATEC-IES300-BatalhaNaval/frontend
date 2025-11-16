import Board from "../../../Board/Board";
import Ships from "../../../Ships/Ships";
import Placar from "../../../Placar/Placar";
import EmojiBox from "../../../EmojiBox/EmojiBox";
import EmojiAnimation from "../../../EmojiBox/EmojiAnimation";
import TurnIndicator from "../../../TurnIndicator/TurnIndicator";
import Timer from "../../../Timer/Timer";
import Deck from "../../../Deck/Deck";
import CoordinateInput from "../CoordinateInput";
import styles from "../Play.module.css";

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
  activeEmoji,
  setActiveEmoji,
}) {
  const itIsMyTurn = isMyTurn();

  return (
    <div className={styles.playContainer}>
      <Placar titulo="Seu Placar" ships={mePlayer()?.player_ship || []} />

      <div className={styles.mainGameArea}>
        <div className={styles.gameStatusContainer}>
          <TurnIndicator currentPlayer={itIsMyTurn ? "player" : "enemy"} />
          <Timer
            duration={30}
            isRunning={itIsMyTurn}
            key={itIsMyTurn ? "player" : "enemy"}
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
                pointerEvents: itIsMyTurn ? "auto" : "none",
                opacity: itIsMyTurn ? 1 : 0.45,
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

        {/* Input extra para atirar via coordenada */}
        <CoordinateInput
          onShoot={handleCellClick}
          disabled={!itIsMyTurn}
        />

        <EmojiAnimation
          emoji={activeEmoji}
          onAnimationEnd={() => setActiveEmoji(null)}
        />
        <EmojiBox onEmojiSelect={setActiveEmoji} />
        <Deck />
      </div>

      <Placar titulo="Placar Inimigo" ships={enemyPlayer()?.player_ship || []} />
    </div>
  );
}
