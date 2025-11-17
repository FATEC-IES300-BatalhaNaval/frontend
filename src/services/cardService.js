// src/services/cardService.js
import apiFetch from "./apiFetch";

const BASE_URL = "/cards";

export async function getCardById(cardId) {
  if (!cardId) throw new Error("cardId is required");
  return apiFetch(`${BASE_URL}/${cardId}`, "GET");
}

export async function getAllCards() {
  return apiFetch(`${BASE_URL}/`, "GET");
}

export async function purchaseCard(cardId) {
  if (!cardId) throw new Error("cardId is required");
  return apiFetch(`${BASE_URL}/purchase/`, "POST", { card_id: cardId });
}

const cardService = {
  getCardById,
  getAllCards,
  purchaseCard,
};

export default cardService;
