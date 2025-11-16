import { useMemo, useEffect } from "react";
import confetti from "canvas-confetti";
import styles from "../Play.module.css";

export default function FinishedPhase({ match, mePlayer }) {
  const me = mePlayer();
  const winnerId = match?.winner_user_id;
  const iWon = me?.user_id === winnerId;

  const winnerPlayer = match?.player?.find(p => p.user_id === winnerId);
  const enemy = match?.player?.find(p => p.user_id !== me?.user_id);

  // Stats calculation
  const myShots = enemy?.grid_cell?.filter(c => c.is_hit) ?? [];
  const myHits = myShots?.filter(c => c.ship_id) ?? [];
  const myAccuracy = myShots.length > 0
    ? Math.round((myHits.length / myShots.length) * 100)
    : 0;

  const enemyShots = me?.grid_cell?.filter(c => c.is_hit) ?? [];
  const enemyHits = enemyShots?.filter(c => c.ship_id) ?? [];
  const enemyAccuracy = enemyShots.length > 0
    ? Math.round((enemyHits.length / enemyShots.length) * 100)
    : 0;

  const victoryMessages = [
    "Você brilhou mais que navio em porta-aviões!",
    "Inimigos afundados, ego inflado!",
    "Se fosse tiro de sorte, você teria uma fábrica de sorte!",
    "GG! Você é o capitão da embarcação da vitória!",
    "O mar está calmo… porque não sobrou inimigo!"
  ];

  const defeatMessages = [
    "Afundou… mas com estilo!",
    "Você virou submarino sem querer!",
    "O oceano te deu um abraço forçado!",
    "Não foi dessa vez, marujo…",
    "O radar falhou… ou foi você?"
  ];

  const randomMessage = useMemo(() => {
    const list = iWon ? victoryMessages : defeatMessages;
    return list[Math.floor(Math.random() * list.length)];
  }, [iWon]);

  useEffect(() => {
    if (iWon) {
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [iWon]);

  return (
    <div className={styles.finished}>
      <h2>Partida Encerrada</h2>

      <div className={styles.resultCard}>
        <div style={{ fontSize: "3rem", marginBottom: "10px" }}>
          {iWon ? "🏆" : "💥"}
        </div>

        <h3>{iWon ? "Você venceu!" : "Você perdeu!"}</h3>

        {!iWon && winnerPlayer && (
          <p>
            O vencedor foi:{" "}
            <strong>{winnerPlayer?.user?.username ?? "Desconhecido"}</strong>
          </p>
        )}

        {iWon && winnerPlayer && (
          <p>
            Parabéns, comandante{" "}
            <strong>{winnerPlayer?.user?.username ?? "Desconhecido"}</strong>!
          </p>
        )}

        <p className={styles.randomMessage}>
          {randomMessage}
        </p>

        <hr className={styles.divider} />

        {/* Stats Comparison */}
        <div className={styles.statsRow}>
          <div className={styles.statsBox}>
            <h4>Você</h4>
            <p>Tiros: {myShots.length}</p>
            <p>Acertos: {myHits.length}</p>
            <p>Precisão: {myAccuracy}%</p>
          </div>

          <div className={styles.statsBox}>
            <h4>{enemy?.user?.username ?? "Inimigo"}</h4>
            <p>Tiros: {enemyShots.length}</p>
            <p>Acertos: {enemyHits.length}</p>
            <p>Precisão: {enemyAccuracy}%</p>
          </div>
        </div>

        <button
          className={styles.backLobbyButton}
          onClick={() => window.location.href = "/"}
        >
          Voltar ao Lobby
        </button>
      </div>
    </div>
  );
}
