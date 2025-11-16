import { useMemo, useEffect } from "react";
import confetti from "canvas-confetti";
import styles from "../Play.module.css";

export default function FinishedPhase({ match, mePlayer }) {
  const me = mePlayer();
  const winnerId = match?.winner_user_id;
  const iWon = me?.user_id === winnerId;

  const winnerPlayer = match?.player?.find(
    (p) => p.user_id === winnerId
  );

  const shotsTotal = me?.grid_cell?.length || 0;
  const shotsHit = me?.grid_cell?.filter(c => c.is_hit && c.ship_id).length || 0;
  const accuracy = shotsTotal > 0
    ? Math.round((shotsHit / shotsTotal) * 100)
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

        <h3>
          {iWon ? "Você venceu!" : "Você perdeu!"}
        </h3>

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

        <div className={styles.stats}>
          <h4>Estatísticas</h4>
          <p>Tiros: {shotsTotal}</p>
          <p>Acertos: {shotsHit}</p>
          <p>Precisão: {accuracy}%</p>
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
