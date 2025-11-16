import { useEffect, useState } from "react";
import styles from "./Settings.module.css";

import { useUser } from "../../../hooks/useUser";
import { updateUserConfig } from "../../../services/userService";
import { resolveCosmeticUrl } from "../../../utils";

export default function Settings() {
  const { me, config, ownedCosmetics, loading, refresh } = useUser();

  const [primary, setPrimary] = useState("#242424");
  const [secondary, setSecondary] = useState("gray");
  const [tertiary, setTertiary] = useState("orange");
  const [fontColor, setFontColor] = useState("white");

  const [selected, setSelected] = useState({
    ICON: null,
    BACKGROUND: null,
    EFFECT: null,
    DESTROYER_1: null,
    DESTROYER_2: null,
    BATTLESHIP: null,
    AIRCRAFT: null,
    SUBMARINE: null,
  });

  const cosmeticsList = Array.isArray(ownedCosmetics)
    ? ownedCosmetics
    : Array.isArray(ownedCosmetics?.cosmetics)
    ? ownedCosmetics.cosmetics
    : [];

  useEffect(() => {
    if (!config) return;

    setPrimary(config.primary_color);
    setSecondary(config.secondary_color);
    setTertiary(config.tertiary_color);
    setFontColor(config.font_color);

    setSelected({
      ICON: config.enabled_icon?.cosmetic_id ?? null,
      BACKGROUND: config.enabled_background?.cosmetic_id ?? null,
      EFFECT: config.enabled_effect?.cosmetic_id ?? null,
      DESTROYER_1: config.enabled_destroyer_1?.cosmetic_id ?? null,
      DESTROYER_2: config.enabled_destroyer_2?.cosmetic_id ?? null,
      BATTLESHIP: config.enabled_battleship?.cosmetic_id ?? null,
      AIRCRAFT: config.enabled_aircraft?.cosmetic_id ?? null,
      SUBMARINE: config.enabled_submarine?.cosmetic_id ?? null,
    });
  }, [config]);

  // Aplica as cores nas variáveis CSS globais sempre que elas mudam
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--primary-color", primary);
    root.setProperty("--secondary-color", secondary);
    root.setProperty("--tertiary-color", tertiary);
    root.setProperty("--font-color", fontColor);
  }, [primary, secondary, tertiary, fontColor]);

  if (loading) return <div>Carregando...</div>;
  if (!me) return <div>Faça login para acessar as configurações.</div>;

  const groups = {
    ICON: cosmeticsList.filter((c) => c.type === "ICON"),
    BACKGROUND: cosmeticsList.filter((c) => c.type === "BACKGROUND"),
    EFFECT: cosmeticsList.filter((c) => c.type === "EFFECT"),
    DESTROYER_1: cosmeticsList.filter((c) => c.type === "DESTROYER"),
    DESTROYER_2: cosmeticsList.filter((c) => c.type === "DESTROYER"),
    BATTLESHIP: cosmeticsList.filter((c) => c.type === "BATTLESHIP"),
    AIRCRAFT: cosmeticsList.filter((c) => c.type === "AIRCRAFT"),
    SUBMARINE: cosmeticsList.filter((c) => c.type === "SUBMARINE"),
  };

  async function save() {
    const body = {
      enabled_background: selected.BACKGROUND,
      enabled_effect: selected.EFFECT,
      enabled_icon: selected.ICON,
      enabled_destroyer_1: selected.DESTROYER_1,
      enabled_destroyer_2: selected.DESTROYER_2,
      enabled_aircraft: selected.AIRCRAFT,
      enabled_battleship: selected.BATTLESHIP,
      enabled_submarine: selected.SUBMARINE,
      primary_color: primary,
      secondary_color: secondary,
      tertiary_color: tertiary,
      font_color: fontColor,
    };

    await updateUserConfig(body);
    await refresh();
    alert("Configurações atualizadas!");
  }

  function reset() {
    if (!config) return;

    setPrimary(config.primary_color);
    setSecondary(config.secondary_color);
    setTertiary(config.tertiary_color);
    setFontColor(config.font_color);

    setSelected({
      ICON: config.enabled_icon?.cosmetic_id ?? null,
      BACKGROUND: config.enabled_background?.cosmetic_id ?? null,
      EFFECT: config.enabled_effect?.cosmetic_id ?? null,
      DESTROYER_1: config.enabled_destroyer_1?.cosmetic_id ?? null,
      DESTROYER_2: config.enabled_destroyer_2?.cosmetic_id ?? null,
      BATTLESHIP: config.enabled_battleship?.cosmetic_id ?? null,
      AIRCRAFT: config.enabled_aircraft?.cosmetic_id ?? null,
      SUBMARINE: config.enabled_submarine?.cosmetic_id ?? null,
    });
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerSpacer} />

      <h1>Configurações</h1>

      {/* Botões fixos logo abaixo do título */}
      <div className={styles.buttonRow}>
        <button className={styles.save} onClick={save}>
          Salvar
        </button>

        <button className={styles.reset} onClick={reset}>
          Resetar
        </button>
      </div>

      {/* ------------------ Cores ------------------ */}
      <section className={styles.section}>
        <h2>Cores</h2>

        <div className={styles.colors}>
          <div className={styles.colorCard}>
            <div
              className={styles.colorPreview}
              style={{ background: primary }}
            />
            <span className={styles.colorLabel}>Primária</span>
            <input
              type="color"
              value={primary}
              className={styles.colorInput}
              onChange={(e) => setPrimary(e.target.value)}
            />
          </div>

          <div className={styles.colorCard}>
            <div
              className={styles.colorPreview}
              style={{ background: secondary }}
            />
            <span className={styles.colorLabel}>Secundária</span>
            <input
              type="color"
              value={secondary}
              className={styles.colorInput}
              onChange={(e) => setSecondary(e.target.value)}
            />
          </div>

          <div className={styles.colorCard}>
            <div
              className={styles.colorPreview}
              style={{ background: tertiary }}
            />
            <span className={styles.colorLabel}>Terciária</span>
            <input
              type="color"
              value={tertiary}
              className={styles.colorInput}
              onChange={(e) => setTertiary(e.target.value)}
            />
          </div>

          <div className={styles.colorCard}>
            <div
              className={styles.colorPreview}
              style={{ background: fontColor }}
            />
            <span className={styles.colorLabel}>Fonte</span>
            <input
              type="color"
              value={fontColor}
              className={styles.colorInput}
              onChange={(e) => setFontColor(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ------------------ Cosméticos ------------------ */}
      <section className={styles.section}>
        <h2>Cosméticos</h2>

        {Object.entries(groups).map(([key, list]) => (
          <div key={key} className={styles.group}>
            <h3>{key}</h3>

            <div className={styles.grid}>
              {list.length === 0 && <p>Nenhum cosmético deste tipo.</p>}

              {list.map((c) => (
                <div
                  key={c.cosmetic_id}
                  className={
                    selected[key] === c.cosmetic_id
                      ? styles.itemSelected
                      : styles.item
                  }
                  onClick={() =>
                    setSelected((prev) => ({ ...prev, [key]: c.cosmetic_id }))
                  }
                >
                  <img
                    src={resolveCosmeticUrl(c.link)}
                    alt={c.description}
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  />
                  <span>{c.description}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
