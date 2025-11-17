import { useState } from "react";
import styles from "./Login.module.css";
import navio1 from "../../../assets/cosmetic/ships/destroyer/F00001.png";
import navio2 from "../../../assets/cosmetic/ships/battleship/G00001.png";
import navio3 from "../../../assets/cosmetic/ships/aircraftCarrier/H00001.png";
import navio4 from "../../../assets/cosmetic/ships/submarine/I00001.png";
import logo from "../../../assets/development/logo.png";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  // Estado para mensagem de feedback do registro
  const [signupMessage, setSignupMessage] = useState("");
  const [signupMessageType, setSignupMessageType] = useState(""); // "success" ou "error"
  // Função para registrar usuário
  async function registerUser({ username, email, password }) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      return { ok: response.ok, data };
    } catch (error) {
      return { ok: false, error };
    }
  }
  // Variáveis
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Estado para mensagem de feedback do login
  const [loginMessage, setLoginMessage] = useState("");
  const [loginMessageType, setLoginMessageType] = useState(""); // "success" ou "error"
  // Estados para registro
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [actualTab, setActualTab] = useState("login");
  const navigate = useNavigate();
  const { signIn } = useAuth();

  // Funções
  async function handleSubmitLoginForm(e) {
    e?.preventDefault();
    setLoginMessage("");
    const res = await signIn(email, password);
    if (res?.ok) {
      setLoginMessage("Login realizado com sucesso.");
      setLoginMessageType("success");
      navigate("/lobby");
    } else {
      setLoginMessage(res?.message || "Erro ao fazer login");
      setLoginMessageType("error");
    }
  }

  async function handleSubmitSignupForm(e) {
    e.preventDefault();
    // Validação simples de senha
    if (signupPassword !== signupConfirmPassword) {
      setSignupMessage("As senhas não coincidem.");
      setSignupMessageType("error");
      return;
    }
    // Chama a função de registro
    const result = await registerUser({
      username: signupUsername,
      email: signupEmail,
      password: signupPassword,
    });
    if (result.ok) {
      const createdUsername = result.data?.username;
      setSignupMessage(createdUsername ? `Conta criada com sucesso! Bem-vindo, ${createdUsername}` : "Conta criada com sucesso!");
      setSignupMessageType("success");
      // Limpa campos e volta para login
      setSignupUsername("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirmPassword("");
      setTimeout(() => {
        setActualTab("login");
        setSignupMessage("");
        setSignupMessageType("");
      }, 2000);
    } else {
      let errorMsg = result.error || "Erro desconhecido";
      if (result.data) {
        if (Array.isArray(result.data.detail)) {
          errorMsg = result.data.detail
            .map((d) => {
              const loc = Array.isArray(d.loc) ? d.loc.join(".") : d.loc;
              return `${loc}: ${d.msg}`;
            })
            .join("; ");
        } else {
          errorMsg = result.data.detail || result.data.message || errorMsg;
        }
      }
      setSignupMessage("Erro ao criar conta: " + errorMsg);
      setSignupMessageType("error");
    }
  }

  return (
    <div className={styles.login_background}>
      <img src={navio1} alt="navio1" className={styles.navio1} />
      <img src={navio2} alt="navio2" className={styles.navio2} />
      <img src={navio3} alt="navio3" className={styles.navio3} />
      <img src={navio4} alt="navio4" className={styles.navio4} />
      <img src={logo} alt="Logo do Jogo" className={styles.logo} />

      <h2 className={styles.form_title}>Acesse sua conta</h2>
      <div className={styles.login_container}>
        {/* Logar em conta existente */}
        <form
          onSubmit={handleSubmitLoginForm}
          style={{ display: actualTab === "login" ? "flex" : "none" }}
        >
          {/* Mensagem de feedback do login (topo) */}
          {loginMessage && (
            <div
              style={{
                color: loginMessageType === "success" ? "green" : "red",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              {loginMessage}
            </div>
          )}
          <input
            type="email"
            placeholder="E-mail"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          { /*
            <button
              type="button"
              className={styles.text_link_stacked_link}
              onClick={() => setActualTab("forgot_password")}
            >
              Esqueceu a senha?
            </button>
            */
          }
          <button
            type="button"
            className={styles.text_link_stacked_link}
            onClick={() => setActualTab("new_account")}
          >
            Criar nova conta
          </button>
          <button
            type="submit"
            className={styles.main_button}
          >
            Entrar
          </button>
        </form>
        {/* Criar nova conta */}
        <form
          onSubmit={handleSubmitSignupForm}
          style={{ display: actualTab === "new_account" ? "flex" : "none" }}
        >
          {/* Mensagem de feedback no topo */}
          {signupMessage && (
            <div
              style={{
                color: signupMessageType === "success" ? "green" : "red",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              {signupMessage}
            </div>
          )}
          <input
            type="text"
            placeholder="Nome de usuário"
            required
            value={signupUsername}
            onChange={(e) => setSignupUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="E-mail"
            required
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            required
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirmar senha"
            required
            value={signupConfirmPassword}
            onChange={(e) => setSignupConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            className={styles.text_link_stacked_link}
            onClick={() => setActualTab("login")}
          >
            Já tem uma conta? Entrar
          </button>
          <button
            type="submit"
            className={styles.main_button}
          >
            Criar
          </button>
        </form>
        {/* Recuperar senha */}
        <form
          onSubmit={handleSubmitSignupForm}
          style={{ display: actualTab === "forgot_password" ? "flex" : "none" }}
        >
          <input type="email" placeholder="E-mail" required />
          <button
            type="button"
            className={styles.text_link_stacked_link}
            onClick={() => setActualTab("login")}
          >
            Voltar
          </button>
          <button
            type="submit"
            className={styles.main_button}
            onClick={() => {}}
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
