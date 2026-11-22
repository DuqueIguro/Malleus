/* ============================================================
   LOGIN
   Autenticação por e-mail e senha com Supabase Auth (RF01).
   Só a chave pública (anon) vai ao navegador. Nunca a chave de serviço.
   ============================================================ */
(() => {
  /* ---------- Configuração ----------
     Preencha com os dados do projeto em Supabase > Settings > API.
     A chave anon é pública por desenho: a segurança fica no RLS do banco. */
  const CONFIG = {
    supabaseUrl: "https://SEU-PROJETO.supabase.co",
    supabaseAnonKey: "SUA-CHAVE-PUBLICA-ANON",
    destinoAposLogin: "index.html"
  };

  const configurado = !CONFIG.supabaseUrl.includes("SEU-PROJETO")
    && !CONFIG.supabaseAnonKey.includes("SUA-CHAVE");

  const form = document.getElementById("form-login");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const erro = document.getElementById("erro");
  const btn = document.getElementById("entrar");
  const textoBtn = btn.querySelector(".texto-botao");
  const btnMostrar = document.getElementById("mostrar-senha");

  /* ---------- Mensagens ---------- */
  // Mensagem genérica de propósito: não revela se o e-mail existe.
  const MSG_CREDENCIAIS = "E-mail ou senha incorretos.";
  const MSG_REDE = "Não foi possível conectar. Verifique sua internet e tente de novo.";
  const MSG_MUITAS = "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.";
  const MSG_GENERICA = "Não foi possível entrar agora. Tente novamente.";

  function mostrarErro(texto, campo = null) {
    erro.textContent = texto;
    erro.hidden = false;
    [email, senha].forEach((c) => c.removeAttribute("aria-invalid"));
    if (campo) campo.setAttribute("aria-invalid", "true");
  }

  function limparErro() {
    erro.hidden = true;
    erro.textContent = "";
    [email, senha].forEach((c) => c.removeAttribute("aria-invalid"));
  }

  function ocupado(sim) {
    btn.disabled = sim;
    textoBtn.textContent = sim ? "Entrando…" : "Entrar";
    email.readOnly = sim;
    senha.readOnly = sim;
  }

  function traduzirErro(e) {
    const msg = (e?.message || "").toLowerCase();
    if (msg.includes("invalid login")) return MSG_CREDENCIAIS;
    if (msg.includes("too many") || e?.status === 429) return MSG_MUITAS;
    if (msg.includes("fetch") || msg.includes("network")) return MSG_REDE;
    return MSG_GENERICA;
  }

  /* ---------- Mostrar / ocultar senha ---------- */
  btnMostrar.addEventListener("click", () => {
    const mostrando = senha.type === "text";
    senha.type = mostrando ? "password" : "text";
    btnMostrar.textContent = mostrando ? "Mostrar" : "Ocultar";
    btnMostrar.setAttribute("aria-pressed", String(!mostrando));
    senha.focus();
  });

  /* ---------- Validação simples antes de enviar ---------- */
  function validar() {
    if (!email.value.trim()) return mostrarErro("Informe seu e-mail.", email), false;
    if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) return mostrarErro("Este e-mail não parece válido.", email), false;
    if (!senha.value) return mostrarErro("Informe sua senha.", senha), false;
    return true;
  }

  /* ---------- Inicialização do cliente ---------- */
  if (!configurado) {
    mostrarErro("Login indisponível: o site ainda não está ligado ao banco de dados.");
    ocupado(true);
    console.warn("[login] Configure supabaseUrl e supabaseAnonKey em login.js.");
    return;
  }

  const sb = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
  });

  // Se já existe sessão no navegador, não mostra o formulário de novo.
  sb.auth.getSession().then(({ data }) => {
    if (data?.session) location.replace(CONFIG.destinoAposLogin);
  });

  /* ---------- Envio ---------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    limparErro();
    if (!validar()) return;

    ocupado(true);
    try {
      const { error } = await sb.auth.signInWithPassword({
        email: email.value.trim(),
        password: senha.value
      });
      if (error) throw error;
      location.replace(CONFIG.destinoAposLogin);
    } catch (err) {
      senha.value = "";
      mostrarErro(traduzirErro(err), senha);
      senha.focus();
      ocupado(false);
    }
  });
})();