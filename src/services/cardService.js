// src/services/cardService.js
import apiFetch from "./apiFetch";

const BASE_URL = "/cards";

export async function getCardById(cardId) {
  if (!cardId) throw new Error("cardId is required");
  return apiFetch(`${BASE_URL}/${cardId}`, { method: "GET" });
}

export async function getAllCards() {
  return apiFetch(`${BASE_URL}/`, { method: "GET" });
}

export async function purchaseCard(cardId) {
  if (!cardId) throw new Error("cardId is required");

  return apiFetch(`${BASE_URL}/purchase/`, {
    method: "POST",
    body: JSON.stringify({ card_id: cardId }),
  });
}

const cardService = {
  getCardById,
  getAllCards,
  purchaseCard,
};

export default cardService;
