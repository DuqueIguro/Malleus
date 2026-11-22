/* ============================================================
   DESTINOS DO HUB
   Para liberar uma página: troque estado para "disponivel" e informe href.
   estado: "disponivel" | "em-breve"
   ============================================================ */
const DESTINOS = [
  {
    grupo: "Acesso",
    titulo: "Entrar",
    desc: "Acesso de mestres e jogadores à mesa.",
    icone: "🔑",
    href: "entrar.html",
    estado: "em-breve"
  },
  {
    grupo: "Mesa",
    titulo: "Área do Mestre",
    desc: "Penitentes, Véu, púlpito, grimório e registro de feitos.",
    icone: "🕯",
    href: "mestre/",
    estado: "em-breve"
  },
  {
    grupo: "Mesa",
    titulo: "Área do Jogador",
    desc: "Sua ficha, o rolador e o diário de sessões.",
    icone: "⚔",
    href: "jogador/",
    estado: "em-breve"
  },
  {
    grupo: "Ferramentas",
    titulo: "Escudo do Mestre",
    desc: "Protótipo atual da mesa do mestre.",
    icone: "✝",
    href: "escudo-do-mestre-v7.html",
    estado: "disponivel",
    selo: "Protótipo"
  },
  {
    grupo: "Ferramentas",
    titulo: "Regras da Casa",
    desc: "Doutrinas, cânones e regras do Santo Ofício.",
    icone: "📜",
    href: "pages/regras.html",
    estado: "disponivel",
    selo: "Protótipo"
  }
];

/* ---------- Utilitários ---------- */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const $portas = document.getElementById("portas");
const btnVitral = document.getElementById("btn-vitral");

function cartao(d) {
  const ativo = d.estado === "disponivel";
  const tag = ativo ? "a" : "div";
  const attrs = ativo ? `href="${esc(d.href)}"` : `aria-disabled="true"`;
  const rotulo = ativo ? (d.selo || "Disponível") : "Em breve";
  return `<${tag} class="cartao${ativo ? "" : " bloqueado"}" ${attrs}>
    <span class="cartao-ico" aria-hidden="true">${esc(d.icone)}</span>
    <h3>${esc(d.titulo)}</h3>
    <p>${esc(d.desc)}</p>
    <span class="selo${ativo ? " ok" : ""}">${esc(rotulo)}</span>
  </${tag}>`;
}

function renderizar() {
  const grupos = {};
  for (const d of DESTINOS) (grupos[d.grupo] ??= []).push(d);

  $portas.innerHTML = Object.entries(grupos).map(([nome, itens]) => `
    <section class="grupo" aria-labelledby="g-${esc(nome)}">
      <h2 id="g-${esc(nome)}">${esc(nome)}</h2>
      <div class="cartoes">${itens.map(cartao).join("")}</div>
    </section>`).join("");
}

/* ---------- Raios do vitral ---------- */
function desenharRaios() {
  const g = document.getElementById("raios");
  const cores = ["#f59e0b", "#be123c", "#6d28d9", "#0ea5e9", "#d97706", "#9f1239"];
  let s = "";
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    const x = 200 + Math.cos(a) * 130, y = 200 + Math.sin(a) * 130;
    s += `<line x1="200" y1="200" x2="${x}" y2="${y}" stroke="#78350f" stroke-width="1.5"/>`;
    s += `<circle cx="${200 + Math.cos(a) * 85}" cy="${200 + Math.sin(a) * 85}" r="28"
      fill="${cores[i % 6]}" fill-opacity=".6" stroke="#78350f" stroke-width="2"/>`;
  }
  g.innerHTML = s;
}

/* ---------- Alternar vitral (preferência salva no navegador) ---------- */
function aplicarVitral(ligado) {
  document.body.classList.toggle("sem-vitral", !ligado);
  btnVitral.setAttribute("aria-pressed", String(ligado));
  btnVitral.textContent = ligado ? "Desligar vitral" : "Ligar vitral";
}

function iniciarVitral() {
  let ligado = true;
  try { ligado = localStorage.getItem("mm:vitral") !== "off"; } catch {}
  aplicarVitral(ligado);

  btnVitral.addEventListener("click", () => {
    ligado = !ligado;
    aplicarVitral(ligado);
    try { localStorage.setItem("mm:vitral", ligado ? "on" : "off"); } catch {}
  });
}

/* ---------- Inicialização ---------- */
desenharRaios();
iniciarVitral();
renderizar();