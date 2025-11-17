// src/hooks/useCards.js
import { useState, useEffect, useCallback } from "react";
import cardService from "../services/cardService";

export default function useCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await cardService.getAllCards();
      setCards(data || []);
    } catch (err) {
      setError(err.message || "Error loading cards");
    } finally {
      setLoading(false);
    }
  }, []);

  const purchaseCard = useCallback(
    async (cardId) => {
      try {
        setLoading(true);
        setError(null);

        await cardService.purchaseCard(cardId);
        await loadCards(); // Atualiza lista após compra
      } catch (err) {
        setError(err.message || "Error purchasing card");
      } finally {
        setLoading(false);
      }
    },
    [loadCards]
  );

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  return {
    cards,
    loading,
    error,
    loadCards,
    purchaseCard,
  };
}
