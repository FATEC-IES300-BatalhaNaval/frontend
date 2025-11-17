import { useState } from "react";
import styles from "./CardPickingPhase.module.css";

export default function CardPickingPhase({
  ownedCards,
  pickCards,
  matchId,
}) {
  const [selected, setSelected] = useState([]);

  function getCardImage(link) {
    if (!link) return "/placeholder.png";
    return link.startsWith("/") ? link : `/${link}`;
  }

  function toggleCard(cardId) {
    if (selected.includes(cardId)) {
      setSelected(prev => prev.filter(id => id !== cardId));
      return;
    }

    if (selected.length >= 3) {
      alert("Você só pode selecionar 3 cartas!");
      return;
    }

    setSelected(prev => [...prev, cardId]);
  }

  async function confirmSelection() {
    if (selected.length === 0) {
      alert("Selecione pelo menos 1 carta.");
      return;
    }

    try {
      await pickCards(matchId, selected);
    } catch (err) {
      console.error(err);
      alert("Erro ao selecionar as cartas.");
    }
  }

  return (
    <div className={styles.container}>
      <h2>Escolha até 3 cartas</h2>

      <div className={styles.list}>
        {ownedCards.length === 0 && (
          <p>Você ainda não possui cartas. Comece jogando para ganhar!</p>
        )}

        {ownedCards.map(card => {
          const isSelected = selected.includes(card.card_id);
          return (
            <div
              key={card.card_id}
              className={`${styles.card} ${isSelected ? styles.selected : ""}`}
              onClick={() => toggleCard(card.card_id)}
              title={card.description}
            >
              <img
                src={getCardImage(card.link)}
                alt={card.card_name}
                onError={(e) => (e.currentTarget.src = "/placeholder.png")}
              />
              <span>{card.card_name}</span>
            </div>
          );
        })}
      </div>

      <button
        className={styles.confirmBtn}
        onClick={confirmSelection}
        disabled={selected.length === 0}
      >
        Confirmar ({selected.length}/3)
      </button>
    </div>
  );
}
