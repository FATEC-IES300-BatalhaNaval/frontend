import styles from "../Play.module.css";

export default function WaitingPlacementPhase() {
  return (
    <div className={styles.waiting}>
      <h2>Aguardando o oponente posicionar os navios...</h2>
    </div>
  );
}
