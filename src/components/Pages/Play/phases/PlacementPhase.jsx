import Board from "../../../Board/Board";
import Ships from "../../../Ships/Ships";
import styles from "./PlacementShip.module.css";

export default function PlacementPhase({
  shipDefs,
  boardRef,
  shipsRef,
  submitting,
  handleConfirmPlacement
}) {
  return (
    <div className={styles.placementContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Posicione seus navios</h2>

        <button className={styles.helpIcon}>
          ?
          <div className={styles.tooltip}>
            Selecione um navio e use as teclas de movimento para movê-lo pelo tabuleiro.
            <br />
            Aperte <strong>Enter</strong> para girar.
            <br />
            (O navio só vira se houver espaço disponível.)
          </div>
        </button>
      </div>

      <div className={styles.boardSection}>
        <Board ref={boardRef} enableHover={false}>
          <Ships
            ref={shipsRef}
            boardRef={boardRef}
            shipDefinitions={shipDefs}
            isLocked={false}
          />
        </Board>

        <div className={styles.buttonContainer}>
          <button
            className={`${styles.button} ${styles.randomize}`}
            onClick={() => shipsRef.current?.randomize()}
          >
            Reposicionar Navios
          </button>

          <button
            className={`${styles.button} ${styles.confirm}`}
            onClick={handleConfirmPlacement}
            disabled={submitting}
          >
            {submitting ? "Enviando..." : "Confirmar Posicionamento"}
          </button>
        </div>
      </div>
    </div>
  );
}
