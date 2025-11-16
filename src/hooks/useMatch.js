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
  shoot as apiShoot,
  getAllMatches as apiGetAllMatches,
  skipTurn as apiSkipTurn
} from "../services/matchService";

export function useMatch() {
  const [matches, setMatches] = useState([]);
  const [shipsDef, setShipsDef] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const getAllMatches = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const res = await apiGetAllMatches(filters);

      const list =
        Array.isArray(res)
          ? res
          : Array.isArray(res?.matches)
          ? res.matches
          : Array.isArray(res?.results)
          ? res.results
          : [];

      setMatches(list);
      return list;
    } finally {
      setLoading(false);
    }
  }, []);

  const newMatch = useCallback(async (body) => {
    try {
      setLoading(true);
      return await apiCreateMatch(body);
    } finally {
      setLoading(false);
    }
  }, []);

  const getMatch = useCallback(async (id) => {
    try {
      setLoading(true);
      return await apiGetMatchById(id);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const sendFleet = useCallback(async (matchId, fleet) => {
    return await apiPlaceFleet(matchId, fleet);
  }, []);

  const placeFleet = useCallback(async (matchId, fleet) => {
    return await apiPlaceFleet(matchId, fleet);
  }, []);

  const joinMatch = useCallback(async (matchId) => {
    return await apiJoinMatch(matchId);
  }, []);

  const startMatch = useCallback(async (matchId) => {
    return await apiStartMatch(matchId);
  }, []);

  const shoot = useCallback(async (matchId, x, y) => {
    return await apiShoot(matchId, x, y);
  }, []);

  const skipTurn = useCallback(async (matchId) => {
    return await apiSkipTurn(matchId);
  }, []);

  return {
    matches,
    shipsDef,
    loading,

    searchMatches,
    getAllMatches,
    newMatch,
    getMatch,

    loadShipDefinitions,
    getShipDefinitions,

    sendFleet,
    placeFleet,
    joinMatch,
    startMatch,

    shoot,
    skipTurn
  };
}
