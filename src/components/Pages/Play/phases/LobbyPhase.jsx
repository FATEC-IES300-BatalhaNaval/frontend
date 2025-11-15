import styles from "../Play.module.css";

export default function LobbyPhase({
  match,
  meId,
  submitting,
  handleStartMatch
}) {
  const players = match.player || [];
  const full = players.length === match.max_players;

  return (
    <div className={styles.lobby}>
      <h2>Sala: {match.room_name}</h2>

      <div className={styles.playerList}>
        {players.map(p => (
          <div key={p.user_id}>{p.user?.username}</div>
        ))}
      </div>

      {match.creator?.user_id === meId && (
        <button
          disabled={!full || submitting}
          onClick={handleStartMatch}
        >
          {submitting ? "Iniciando..." : "Iniciar"}
        </button>
      )}
    </div>
  );
}
