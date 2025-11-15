import Board from "../../../Board/Board";
import Ships from "../../../Ships/Ships";
import Deck from "../../../Deck/Deck";
import PopupComponent from "../../Perfil/elements/PopupComponent";
import styles from "../Play.module.css";

export default function PlacementPhase({
  shipDefs,
  boardRef,
  shipsRef,
  submitting,
  handleConfirmPlacement,
  handleDeckSave,
  isDeckPopupOpen,
  setIsDeckPopupOpen,
  user
}) {
  return (
    <div className={styles.playContainer}>
      <h2>Posicione seus navios</h2>

      <Board ref={boardRef}>
        <Ships
          ref={shipsRef}
          boardRef={boardRef}
          shipDefinitions={shipDefs}
          isLocked={false}
        />
      </Board>

      <div className={styles.buttonContainer}>
        <button onClick={() => shipsRef.current?.randomize()}>
          Reposicionar Navios
        </button>

        <button
          onClick={handleConfirmPlacement}
          disabled={submitting}
        >
          {submitting ? "Enviando..." : "Confirmar Posicionamento"}
        </button>
      </div>

      <div
        className={styles.deckContainer}
        onClick={() => setIsDeckPopupOpen(true)}
      >
        <Deck />
      </div>

      <PopupComponent
        isOpen={isDeckPopupOpen}
        onClose={() => setIsDeckPopupOpen(false)}
        type="cards"
        userData={user?.data || user}
        onSave={handleDeckSave}
      />
    </div>
  );
}
