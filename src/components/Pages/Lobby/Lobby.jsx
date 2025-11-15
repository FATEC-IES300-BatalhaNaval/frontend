import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMatch } from "../../../hooks/useMatch";
import { useAuth } from "../../../hooks/useAuth";
import styles from "./Lobby.module.css";

export default function Lobby() {
  const navigate = useNavigate();
  const { matches, loading, searchMatches, newMatch, joinMatch } = useMatch();
  const { user } = useAuth();

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");

  const [joinPassword, setJoinPassword] = useState("");
  const [joinRoomSelected, setJoinRoomSelected] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const meId = user?.data?.user_id || user?.user_id;

  // -------------------------------------------------------------------
  // Carrega salas ao abrir
  // -------------------------------------------------------------------
  useEffect(() => {
    searchMatches();
  }, [searchMatches]);

  // -------------------------------------------------------------------
  // Suas partidas
  // -------------------------------------------------------------------
  const myMatches = useMemo(() => {
    return matches.filter((m) =>
      m.player?.some((p) => p.user_id === meId)
    );
  }, [matches, meId]);

  // -------------------------------------------------------------------
  // Filtro e busca
  // -------------------------------------------------------------------
  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase();

    return matches
      .filter((room) => {
        if (filter === "public") return !room.is_private;
        if (filter === "private") return room.is_private;
        return true;
      })
      .filter((room) => {
        const nameMatch = room.room_name?.toLowerCase().includes(t);
        const creatorMatch = room.creator?.username?.toLowerCase().includes(t);
        return nameMatch || creatorMatch;
      });
  }, [matches, filter, searchTerm]);

  // -------------------------------------------------------------------
  // Criar sala
  // -------------------------------------------------------------------
  async function handleCreate(e) {
    e.preventDefault();

    const body = {
      room_name: roomName,
      is_private: isPrivate,
      password: isPrivate ? password : "",
    };

    const res = await newMatch(body);

    if (res?.match_id) {
      await joinMatch(res.match_id);
      navigate(`/play/${res.match_id}`);
    }
  }

  // -------------------------------------------------------------------
  // Entrar em sala
  // -------------------------------------------------------------------
  function joinRoom(room) {
    if (room.is_private) {
      setJoinRoomSelected(room);
      setJoinPassword("");
      setShowJoinModal(true);
      return;
    }

    enterMatch(room.match_id);
  }

  async function enterMatch(match_id) {
    try {
      await joinMatch(match_id);
      navigate(`/play/${match_id}`);
    } catch (err) {
      alert("Erro ao entrar na partida.");
      console.error(err);
    }
  }

  async function handleJoinPrivate(e) {
    e.preventDefault();
    if (!joinRoomSelected) return;

    try {
      await joinMatch(joinRoomSelected.match_id, joinPassword);
      setShowJoinModal(false);
      navigate(`/play/${joinRoomSelected.match_id}`);
    } catch (err) {
      alert("Senha incorreta ou erro ao entrar.");
      console.error(err);
    }
  }

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------
  return (
    <div className={styles.lobbyBackground}>
      <div className={styles.lobbyContainer}>

        {/* Suas partidas */}
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
                  Entrar
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

            <input
              className={styles.searchInput}
              placeholder="Buscar sala..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className={styles.newGameButton}
            onClick={() => setShowModal(true)}
          >
            Nova Sala
          </button>
        </div>

        {/* Lista de salas */}
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
                    onClick={() => joinRoom(room)}
                  >
                    Entrar
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modal: Criar Sala */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeButton}
              onClick={() => setShowModal(false)}
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
                  onClick={() => setShowModal(false)}
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

      {/* Modal: Entrar em sala privada */}
      {showJoinModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeButton}
              onClick={() => setShowJoinModal(false)}
            >
              X
            </button>

            <h2>Entrar na sala privada</h2>

            <form onSubmit={handleJoinPrivate} className={styles.modalForm}>
              <input
                type="password"
                placeholder="Senha"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                required
              />

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowJoinModal(false)}
                >
                  Cancelar
                </button>

                <button type="submit" className={styles.confirmButton}>
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
