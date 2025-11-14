import { Link } from "react-router-dom";
import { useUser } from "../../../hooks/useUser";
import styles from "./Perfil.module.css";

import perfil_icon from "../../../assets/cosmetic/icons/E00001.png";
import { resolveCosmeticUrl } from "../../../utils";

export default function Perfil() {
  const { me, config, loading } = useUser();

  if (loading) return <div>Carregando...</div>;
  if (!me) return <div>Usuário não autenticado.</div>;

  const username = me.username || "#user";
  const iconSrc = resolveCosmeticUrl(
    config?.enabled_icon?.link,
    "/profileicon.png"
  );
  const backgroundSrc = resolveCosmeticUrl(
    config?.enabled_background?.link,
    "/profileicon.png"
  );

  const lvl = 0;
  const exp = 0;
  const expNeeded = 100;
  const progress = Math.min(100, (exp / expNeeded) * 100);

  const partidas = 0;
  const vitorias = 0;
  const derrotas = 0;

  return (
    <div
      className={styles.Container}
      style={{
        backgroundImage: backgroundSrc ? `url(${backgroundSrc})` : "",
      }}
    >
      <div className={styles.Header}>
        <img
          src={iconSrc}
          alt="User Icon"
          className={styles.Icon}
          onError={(e) => (e.currentTarget.src = perfil_icon)}
        />

        <h1 className={styles.Username}>{username}</h1>

        <Link to="/Settings" className={styles.SettingsButton}>
          Configurações
        </Link>
      </div>

      <div className={styles.LevelBox}>
        <h2>Nível {lvl}</h2>

        <div className={styles.ProgressBar}>
          <div
            className={styles.ProgressFill}
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className={styles.ProgressInfo}>
          {exp} / {expNeeded} XP
        </p>
      </div>

      <div className={styles.StatsSection}>
        <h2>Estatísticas</h2>

        <div className={styles.StatsGrid}>
          <div className={styles.StatCard}>
            <span className={styles.StatNumber}>{partidas}</span>
            <span className={styles.StatLabel}>Partidas</span>
          </div>

          <div className={styles.StatCard}>
            <span className={styles.StatNumber}>{vitorias}</span>
            <span className={styles.StatLabel}>Vitórias</span>
          </div>

          <div className={styles.StatCard}>
            <span className={styles.StatNumber}>{derrotas}</span>
            <span className={styles.StatLabel}>Derrotas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
