import React from "react";
import styles from "./Deck.module.css";

export default function Deck({ cards = [], activeCard, setActiveCard }) {
  function resolveImage(link) {
    if (!link) return "/placeholder.png";
    return link.startsWith("/") ? link : `/${link}`;
  }

  function select(card) {
    if (card.is_used) return;
    setActiveCard(card === activeCard ? null : card);
  }

  return (
    <div className={styles.deckContainer}>
      {Array.from({ length: 3 }).map((_, index) => {
        const card = cards[index];
        if (!card) {
          return <div key={index} className={styles.cardSlot} />;
        }

        const isActive = activeCard?.card_id === card.card_id;

        return (
          <div
            key={card.card_id}
            className={`${styles.cardSlot} ${isActive ? styles.active : ""} ${
              card.is_used ? styles.used : ""
            }`}
            onClick={() => select(card)}
            title={card.card.card_name} // tooltip com o nome
          >
            <img
              src={resolveImage(card.card.link)}
              alt={card.card.card_name}
            />

            {/* Exibe nome da carta abaixo do card */}
            <div className={styles.cardLabel}>
              {card.card.card_name}
            </div>

            {/* Indicador de usada */}
            {card.is_used && (
              <div className={styles.usedOverlay}>Usada</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
