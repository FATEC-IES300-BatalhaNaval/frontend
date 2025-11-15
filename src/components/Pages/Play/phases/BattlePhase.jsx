import Board from "../../../Board/Board";
import Ships from "../../../Ships/Ships";
import Placar from "../../../Placar/Placar";
import EmojiBox from "../../../EmojiBox/EmojiBox";
import EmojiAnimation from "../../../EmojiBox/EmojiAnimation";
import TurnIndicator from "../../../TurnIndicator/TurnIndicator";
import Timer from "../../../Timer/Timer";
import Deck from "../../../Deck/Deck";
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
  shots,
  isMyTurn,
  activeEmoji,
  setActiveEmoji,
}) {
  const itIsMyTurn = isMyTurn();

  return (
    <div className={styles.playContainer}>

      {/* Placar do jogador */}
      <Placar titulo="Seu Placar" ships={mePlayer()?.player_ship || []} />

      <div className={styles.mainGameArea}>
        <div className={styles.gameStatusContainer}>
          
          {/* Indicador de turno */}
          <TurnIndicator currentPlayer={itIsMyTurn ? "player" : "enemy"} />

          {/* Timer só conta quando é minha vez */}
          <Timer
            duration={30}
            isRunning={itIsMyTurn}
            key={itIsMyTurn ? "player" : "enemy"}
          />

          {/* Mensagem quando for turno do oponente */}
          {!itIsMyTurn && (
            <span style={{ color: "orange", fontSize: "1.1rem", fontWeight: "bold" }}>
              Aguarde sua vez...
            </span>
          )}
        </div>

        <div className={styles.boardsContainer}>

          {/* Meu tabuleiro */}
          <div className={styles.boardWrapper}>
            <Board ref={boardRef}>
              <Ships
                ref={shipsRef}
                boardRef={boardRef}
                shipDefinitions={shipDefs}
                isLocked={true}
              />
            </Board>
          </div>

          {/* Tabuleiro inimigo */}
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
                shots={shots}
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

        <EmojiAnimation
          emoji={activeEmoji}
          onAnimationEnd={() => setActiveEmoji(null)}
        />
        <EmojiBox onEmojiSelect={setActiveEmoji} />

        <Deck />
      </div>

      {/* Placar do inimigo */}
      <Placar titulo="Placar Inimigo" ships={enemyPlayer()?.player_ship || []} />
    </div>
  );
}
