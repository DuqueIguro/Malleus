/* ============================================================
   REGRAS DA CASA: navegação
   PC (≥ 1024px): um capítulo por vez, paginação e teclado (← →).
   Celular: todos os capítulos em sequência, com destaque conforme a rolagem.
   ============================================================ */
(() => {
  const body = document.body;
  const capitulos = [...document.querySelectorAll(".capitulo")];
  const links = [...document.querySelectorAll("#lista-caps a[data-cap]")];
  const btnAnt = document.getElementById("ant");
  const btnProx = document.getElementById("prox");
  const posicao = document.getElementById("posicao");
  const pc = window.matchMedia("(min-width: 1024px)");

  const indiceDe = (id) => capitulos.findIndex((c) => c.id === id);
  let atual = 0;

  /* ---------- Subíndice (seções h3 do capítulo ativo) ---------- */
  const slug = (t) => t.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  capitulos.forEach((cap) => {
    cap.querySelectorAll("h3").forEach((h, i) => {
      if (!h.id) h.id = `${cap.id}-${slug(h.textContent) || i}`;
    });
  });

  function montarSubnav(cap) {
    links.forEach((a) => {
      const ul = a.parentElement.querySelector(".subnav");
      if (!ul) return;
      if (a.dataset.cap !== cap.id) {
        ul.classList.remove("visivel");
        return;
      }
      ul.innerHTML = [...cap.querySelectorAll("h3")]
        .map((h) => `<li><a href="#${h.id}">${h.textContent}</a></li>`).join("");
      ul.classList.add("visivel");
    });
  }

  /* ---------- Destaque do índice ---------- */
  function marcarLink(id) {
    links.forEach((a) => {
      if (a.dataset.cap === id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  /* ---------- Modo PC: mostrar um capítulo ---------- */
  function mostrar(i, { foco = false, atualizarHash = true } = {}) {
    if (i < 0 || i >= capitulos.length) return;
    atual = i;
    const cap = capitulos[i];

    capitulos.forEach((c) => c.classList.toggle("ativo", c === cap));
    marcarLink(cap.id);
    montarSubnav(cap);

    btnAnt.disabled = i === 0;
    btnProx.disabled = i === capitulos.length - 1;
    posicao.textContent = `Capítulo ${i + 1} de ${capitulos.length}`;

    if (atualizarHash) history.replaceState(null, "", `#${cap.id}`);
    if (foco) {
      window.scrollTo({ top: 0, behavior: "auto" });
      cap.querySelector("h2").setAttribute("tabindex", "-1");
      cap.querySelector("h2").focus({ preventScroll: true });
    }
  }

  /* ---------- Modo celular: destaque pela rolagem ---------- */
  let observador = null;
  function observarRolagem() {
    observador?.disconnect();
    observador = new IntersectionObserver((entradas) => {
      const visivel = entradas.filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visivel) marcarLink(visivel.target.id);
    }, { rootMargin: "-140px 0px -60% 0px" });
    capitulos.forEach((c) => observador.observe(c));
  }

  /* ---------- Trocar de modo conforme a largura ---------- */
  function aplicarModo() {
    if (pc.matches) {
      body.classList.add("modo-foco");
      observador?.disconnect();
      const h = location.hash.slice(1);
      const i = indiceDe(h);
      mostrar(i >= 0 ? i : atual, { atualizarHash: true });
    } else {
      body.classList.remove("modo-foco");
      capitulos.forEach((c) => c.classList.remove("ativo"));
      links.forEach((a) => a.parentElement.querySelector(".subnav")?.classList.remove("visivel"));
      observarRolagem();
      const i = indiceDe(location.hash.slice(1));
      if (i >= 0) document.getElementById(capitulos[i].id)?.scrollIntoView({ block: "start" });
      marcarLink(capitulos[i >= 0 ? i : 0].id);
    }
  }

  /* ---------- Eventos ---------- */
  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      if (!pc.matches) return; // no celular, o link rola até a seção normalmente
      e.preventDefault();
      mostrar(indiceDe(a.dataset.cap), { foco: true });
    });
  });

  // Links do subíndice (h3) rolam dentro do capítulo ativo
  document.getElementById("lista-caps").addEventListener("click", (e) => {
    const a = e.target.closest(".subnav a");
    if (!a) return;
    e.preventDefault();
    const alvo = document.getElementById(a.getAttribute("href").slice(1));
    alvo?.scrollIntoView({ block: "start", behavior: "smooth" });
    history.replaceState(null, "", `#${capitulos[atual].id}`);
  });

  btnAnt.addEventListener("click", () => mostrar(atual - 1, { foco: true }));
  btnProx.addEventListener("click", () => mostrar(atual + 1, { foco: true }));

  document.addEventListener("keydown", (e) => {
    if (!pc.matches) return;
    if (e.target.closest("input, textarea, select")) return;
    if (e.key === "ArrowRight") mostrar(atual + 1, { foco: true });
    if (e.key === "ArrowLeft") mostrar(atual - 1, { foco: true });
  });

  window.addEventListener("hashchange", () => {
    if (!pc.matches) return;
    const i = indiceDe(location.hash.slice(1));
    if (i >= 0) mostrar(i, { foco: true, atualizarHash: false });
  });

  pc.addEventListener("change", aplicarModo);

  /* ---------- Início ---------- */
  const inicial = indiceDe(location.hash.slice(1));
  if (inicial >= 0) atual = inicial;
  aplicarModo();
  if (pc.matches) mostrar(atual, { atualizarHash: true });
})();