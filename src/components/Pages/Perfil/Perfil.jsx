import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../../../hooks/useUser";
import { useMatch } from "../../../hooks/useMatch";
import styles from "./Perfil.module.css";

import perfil_icon from "../../../assets/cosmetic/icons/E00001.png";
import { resolveCosmeticUrl } from "../../../utils";

export default function Perfil() {
  const { me, config, loading } = useUser();
  const { getUserMatches, calculateStats, calculateXP } = useMatch();

  const [stats, setStats] = useState({
    played: 0,
    wins: 0,
    losses: 0,
    level: 0,
    xpCurrentLevel: 0,
    xpNeeded: 100,
  });

  useEffect(() => {
    if (!me) return;

    async function loadStats() {
      const matches = await getUserMatches(me.user_id);
      const { played, wins, losses } = calculateStats(matches, me.user_id);
      const { level, xpCurrentLevel, xpNeeded } = calculateXP(wins, losses);

      setStats({
        played,
        wins,
        losses,
        level,
        xpCurrentLevel,
        xpNeeded,
      });
    }

    loadStats();
  }, [me, getUserMatches, calculateStats, calculateXP]);

  if (loading) return <div>Carregando...</div>;
  if (!me) return <div>Usuário não autenticado.</div>;

  const username = me.username || "#user";
  const iconSrc = resolveCosmeticUrl(
    config?.enabled_icon?.link,
    perfil_icon
  );

  const progress = Math.min(
    100,
    (stats.xpCurrentLevel / stats.xpNeeded) * 100
  );

  return (
    <div className={styles.Container}>
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
        <h2>Nível {stats.level}</h2>

        <div className={styles.ProgressBar}>
          <div
            className={styles.ProgressFill}
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className={styles.ProgressInfo}>
          {stats.xpCurrentLevel} / {stats.xpNeeded} XP
        </p>
      </div>

      <div className={styles.StatsSection}>
        <h2>Estatísticas</h2>

        <div className={styles.StatsGrid}>
          <div className={styles.StatCard}>
            <span className={styles.StatNumber}>
              {stats.played}
            </span>
            <span className={styles.StatLabel}>Partidas</span>
          </div>

          <div className={styles.StatCard}>
            <span className={styles.StatNumber}>
              {stats.wins}
            </span>
            <span className={styles.StatLabel}>Vitórias</span>
          </div>

          <div className={styles.StatCard}>
            <span className={styles.StatNumber}>
              {stats.losses}
            </span>
            <span className={styles.StatLabel}>Derrotas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
