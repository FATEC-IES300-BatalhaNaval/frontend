// Header.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import styles from "./Header.module.css";
import Nav_Button from "./elements/Nav_Button";

import { useAuth } from "../../../hooks/useAuth";
import { useUser } from "../../../hooks/useUser";
import { resolveCosmeticUrl } from "../../../utils";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const { signOut } = useAuth();
  const { me, config, loading } = useUser();

  const [active, setActive] = useState(null);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/play") || path.includes("/lobby")) setActive("Play");
    else if (path.includes("/Store")) setActive("Store");
    else if (path.includes("/Perfil")) setActive("Perfil");
    else setActive(null);
  }, [location]);

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const primaryColor = rootStyles.getPropertyValue("--primary-color").trim();

    const backgroundUrl = config?.enabled_background?.link
      ? resolveCosmeticUrl(config.enabled_background.link)
      : null;

    if (backgroundUrl) {
      document.body.style.backgroundImage = `url(${backgroundUrl})`;
      document.body.style.backgroundColor = "transparent";
    } else {
      document.body.style.backgroundImage = "none";
      document.body.style.backgroundColor = primaryColor || "#242424";
    }

    return () => {
      document.body.style.backgroundColor = primaryColor || "#242424";
      document.body.style.backgroundImage = "none";
    };
  }, [config]);

  if (loading) {
    return (
      <nav className={styles.navbar}>
        <div className={styles.navbarLeft}>
          <span style={{ color: "#fff" }}>Carregando...</span>
        </div>
      </nav>
    );
  }

  const username = me?.username ?? "#username";
  const email = me?.email ?? "#email";

  const icon = resolveCosmeticUrl(config?.enabled_icon?.link, "/profileicon.png");
  const effect = config?.enabled_effect?.link
    ? resolveCosmeticUrl(config.enabled_effect.link)
    : null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <Nav_Button id="Play" path="/lobby" label="PLAY" select={active} setSelect={setActive} />
        <Nav_Button id="Store" path="/Store" label="Market" select={active} setSelect={setActive} />
        <Nav_Button id="Perfil" path="/Perfil" label="Perfil" select={active} setSelect={setActive} />
      </div>

      <div className={styles.navbarRight}>
        <div
          className={styles.Perfil_Container}
          onClick={() => setOpenProfileMenu((v) => !v)}
        >
          <img
            src={icon}
            alt="User Icon"
            className={styles.Perfil_Icon}
            onError={(e) => (e.currentTarget.src = "/profileicon.png")}
          />

          {effect && (
            <div className={styles.Effect_Container}>
              <img
                src={effect}
                alt="Effect"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          )}
        </div>

        {openProfileMenu && (
          <ProfileMenu
            username={username}
            email={email}
            icon={icon}
            navigate={navigate}
            signOut={signOut}
          />
        )}
      </div>
    </nav>
  );
}

function ProfileMenu({ username, email, icon, navigate, signOut }) {
  return (
    <div className={styles.loggoutPopUP}>
      <div>
        <div
          className={styles.Perfil_Container}
          onClick={() => navigate("/Perfil")}
        >
          <img
            src={icon}
            alt="User Icon"
            className={styles.Perfil_Icon}
            onError={(e) => (e.currentTarget.src = "/profileicon.png")}
          />
        </div>

        <h1><span>{username}</span></h1>
      </div>

      <h2><span>{email}</span></h2>

      <button onClick={signOut}>Deslogar</button>
    </div>
  );
}
