import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMatch } from "../../../hooks/useMatch";
import { useAuth } from "../../../hooks/useAuth";
import styles from "./Lobby.module.css";

export default function Lobby() {
  const navigate = useNavigate();
  const { matches, loading, getAllMatches, newMatch, joinMatch } = useMatch();
  const { user } = useAuth();

  const [filter, setFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");

  const meId = user?.data?.user_id || user?.user_id;

  // Load matches on open
  useEffect(() => {
    getAllMatches();
  }, [getAllMatches]);

  // My active matches
  const myMatches = useMemo(() => {
    return matches.filter(
      (m) =>
        m.player?.some((p) => p.user_id === meId) &&
        m.state !== "FINISHED"
    );
  }, [matches, meId]);

  // Public/Private filter
  const filtered = useMemo(() => {
    return matches.filter((room) => {
      if (filter === "public") return !room.is_private;
      if (filter === "private") return room.is_private;
      return true;
    });
  }, [matches, filter]);

  async function handleCreate(e) {
    e.preventDefault();

    const res = await newMatch({
      room_name: roomName,
      is_private: isPrivate,
      password: isPrivate ? password : "",
    });

    if (res?.match_id) {
      // await joinMatch(res.match_id); (Já entra automaticamente ao criar)
      navigate(`/play/${res.match_id}`);
    }
  }

  async function enterMatch(match_id) {
    try {
      await joinMatch(match_id);
      navigate(`/play/${match_id}`);
    } catch {
      alert("Erro ao entrar na partida.");
    }
  }

  return (
    <div className={styles.lobbyBackground}>
      <div className={styles.lobbyContainer}>

        {/* My Matches */}
        {myMatches.length > 0 && (
          <div className={styles.myMatchesSection}>
            <h2>Suas partidas</h2>

            {myMatches.map((m) => (
              <div key={m.match_id} className={styles.myMatchCard}>
                <div>
                  <strong>{m.room_name}</strong>
                  <div>Estado: {m.state}</div>
                </div>

                <button
                  className={styles.joinButton}
                  onClick={() => navigate(`/play/${m.match_id}`)}
                >
                  Re-entrar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.filters}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">Todas</option>
              <option value="public">Públicas</option>
              <option value="private">Privadas</option>
            </select>
          </div>

          <button
            className={styles.newGameButton}
            onClick={() => setShowCreateModal(true)}
          >
            Nova Sala
          </button>
        </div>

        {/* Matches List */}
        <div className={styles.roomList}>
          {loading && <p>Carregando...</p>}

          {!loading && filtered.length === 0 && (
            <p className={styles.noRooms}>Nenhuma sala encontrada.</p>
          )}

          {!loading &&
            filtered.length > 0 &&
            filtered.map((room) => (
              <div key={room.match_id} className={styles.roomCard}>
                <div className={styles.roomInfo}>
                  <h3>{room.room_name}</h3>
                  <p>Criador: {room.creator?.username ?? "Desconhecido"}</p>
                </div>

                <div className={styles.roomStatus}>
                  <span
                    className={
                      room.is_private ? styles.privateTag : styles.publicTag
                    }
                  >
                    {room.is_private ? "Privada" : "Pública"}
                  </span>

                  <button
                    className={styles.joinButton}
                    onClick={() => enterMatch(room.match_id)}
                  >
                    Entrar
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeButton}
              onClick={() => setShowCreateModal(false)}
            >
              X
            </button>

            <h2>Criar Sala</h2>

            <form onSubmit={handleCreate} className={styles.modalForm}>
              <input
                type="text"
                placeholder="Nome da sala"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />

              <div className={styles.toggleContainer}>
                <span>Privada?</span>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                  />
                  <span className={`${styles.slider} ${styles.round}`} />
                </label>
              </div>

              {isPrivate && (
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              )}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>

                <button type="submit" className={styles.confirmButton}>
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
