import { useState, useMemo } from "react";
import styles from "./CardPickingPhase.module.css";

export default function CardPickingPhase({
  ownedCards,
  pickCards,
  matchId,
  mePlayer
}) {
  const [selected, setSelected] = useState([]);

  const alreadyPicked = useMemo(() => {
    const deck = mePlayer()?.deck || [];
    return deck.filter(c => !c.is_used).length >= 3;
  }, [mePlayer]);

  function getCardImage(link) {
    if (!link) return "/placeholder.png";
    return link.startsWith("/") ? link : `/${link}`;
  }

  function toggleCard(cardId) {
    if (alreadyPicked) return;

    setSelected(prev => {
      if (prev.includes(cardId)) return prev.filter(id => id !== cardId);
      if (prev.length >= 3) return prev;
      return [...prev, cardId];
    });
  }

  async function confirmSelection() {
    if (selected.length === 0) return;

    try {
      await pickCards(matchId, selected);
    } catch (err) {
      console.error(err);
      alert("Erro ao selecionar as cartas.");
    }
  }

  if (alreadyPicked) {
    return (
      <div className={styles.container}>
        <h2>Aguardando oponente selecionar as cartas...</h2>
      </div>
    );
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
