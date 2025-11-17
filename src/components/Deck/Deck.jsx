import React from "react";
import styles from "./Deck.module.css";
import Card from "../Cards/Card";

export default function Deck({ cards = [] }) {
  
  function resolveImage(link) {
    if (!link) return "/placeholder.png";
    return link.startsWith("/") ? link : `/${link}`;
  }

  const availableCards = cards.filter(c => !c.is_used);

  return (
    <div className={styles.deckContainer}>
      {Array.from({ length: 3 }).map((_, index) => {
        const card = availableCards[index];
        return (
          <div key={index} className={styles.cardSlot}>
            {card && (
              <Card
                image={resolveImage(card.card.link)}
                title={card.card.card_name}
                description={card.card.description}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
