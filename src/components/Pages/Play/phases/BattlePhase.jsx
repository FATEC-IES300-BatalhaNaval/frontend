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
  currentPlayer,
  setCurrentPlayer,
  activeEmoji,
  setActiveEmoji
}) {
  return (
    <div className={styles.playContainer}>

      <Placar titulo="Seu Placar" ships={mePlayer()?.player_ship || []} />

      <div className={styles.mainGameArea}>
        <div className={styles.gameStatusContainer}>
          <TurnIndicator currentPlayer={currentPlayer} />
          <Timer
            duration={30}
            onTimeEnd={() => setCurrentPlayer("enemy")}
            isRunning={currentPlayer === "player"}
            key={currentPlayer}
          />
        </div>

        <div className={styles.boardsContainer}>
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

          <div className={styles.boardWrapper}>
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
