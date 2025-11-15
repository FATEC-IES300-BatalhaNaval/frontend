// hooks/useMatch.js
import { useState, useCallback } from "react";
import {
  getMatches as apiGetMatches,
  createMatch as apiCreateMatch,
  getMatchById as apiGetMatchById,
  getShipDefinitions as apiGetShipDefinitions,
  placeFleet as apiPlaceFleet,
  joinMatch as apiJoinMatch,
  startMatch as apiStartMatch,
  shoot as apiShoot
} from "../services/matchService";

export function useMatch() {
  const [matches, setMatches] = useState([]);
  const [shipsDef, setShipsDef] = useState([]);
  const [loading, setLoading] = useState(false);

  // Buscar salas
  const searchMatches = useCallback(async (query = "") => {
    try {
      setLoading(true);
      const res = await apiGetMatches(query);

      const list =
        Array.isArray(res)
          ? res
          : Array.isArray(res?.matches)
          ? res.matches
          : Array.isArray(res?.results)
          ? res.results
          : [];

      setMatches(list);
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar sala
  const newMatch = useCallback(async (body) => {
    try {
      setLoading(true);
      return await apiCreateMatch(body);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar partida
  const getMatch = useCallback(async (id) => {
    try {
      setLoading(true);
      return await apiGetMatchById(id);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar definições de navios
  const loadShipDefinitions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGetShipDefinitions();
      setShipsDef(Array.isArray(res) ? res : []);
    } finally {
      setLoading(false);
    }
  }, []);

  const getShipDefinitions = useCallback(async () => {
    return await apiGetShipDefinitions();
  }, []);

  // Enviar frota
  const sendFleet = useCallback(async (matchId, fleet) => {
    return await apiPlaceFleet(matchId, fleet);
  }, []);

  // Enviar frota (alias)
  const placeFleet = useCallback(async (matchId, fleet) => {
    return await apiPlaceFleet(matchId, fleet);
  }, []);

  // Entrar em partida
  const joinMatch = useCallback(async (matchId) => {
    return await apiJoinMatch(matchId);
  }, []);

  // Iniciar partida
  const startMatch = useCallback(async (matchId) => {
    return await apiStartMatch(matchId);
  }, []);

  // Atirar
  const shoot = useCallback(async (matchId, x, y) => {
    return await apiShoot(matchId, x, y);
  }, []);

  return {
    matches,
    shipsDef,
    loading,

    searchMatches,
    newMatch,
    getMatch,

    loadShipDefinitions,
    getShipDefinitions,

    sendFleet,
    placeFleet,
    joinMatch,
    startMatch,

    shoot
  };
}
