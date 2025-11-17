// src/hooks/useUserCards.js
import { useState, useEffect, useCallback } from "react";
import { getUserCards } from "../services/userService";

export function useUserCards() {
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [errorCards, setErrorCards] = useState(null);

  const fetchUserCards = useCallback(async () => {
    setLoadingCards(true);
    setErrorCards(null);

    try {
      const data = await getUserCards(); // { cards: [...] }
      setCards(data?.cards || []);
    } catch (err) {
      console.error("Error while fetching user cards:", err);
      setErrorCards(err);
    } finally {
      setLoadingCards(false);
    }
  }, []);

  useEffect(() => {
    fetchUserCards();
  }, [fetchUserCards]);

  return {
    cards,
    loadingCards,
    errorCards,
    refreshCards: fetchUserCards,
  };
}

export default useUserCards;
