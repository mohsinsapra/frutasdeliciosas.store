/* ============================================================
   FRUTAS DELICIOSAS — main.js
   GSAP + ScrollTrigger · Three.js · Anime.js
   ============================================================ */

/* ------------------------------------------------------------
   CONFIGURACIÓN — cambia aquí la URL de login (subdominio/app)
   ------------------------------------------------------------ */
const LOGIN_URL = "https://app.frutasdeliciosas.store/";

/* TELÉFONOS — sustituir por los números reales */
const TEL_NABIL = "+34602178586"; // <-- TELÉFONO NABIL
const TEL_IDRIS = "+34600000000"; // <-- TELÉFONO IDRIS

document.querySelectorAll(".enlace-login").forEach(a => (a.href = LOGIN_URL));
const telN = document.getElementById("telNabil");
const telI = document.getElementById("telIdris");
if (telN) telN.href = "tel:" + TEL_NABIL;
if (telI) telI.href = "tel:" + TEL_IDRIS;

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hayGSAP = typeof gsap !== "undefined";
const hayAnime = typeof anime !== "undefined";
const hayTHREE = typeof THREE !== "undefined";
if (hayGSAP) gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   1. PRELOADER (anime.js: letras + barra)
   ============================================================ */
(function preloader() {
  const pre = document.getElementById("preloader");
  if (!pre) return;
  const ocultar = () => {
    if (hayGSAP && !reduceMotion) {
      gsap.to(pre, { yPercent: -100, duration: 0.7, ease: "power3.inOut", onComplete: () => pre.remove() });
    } else pre.remove();
  };
  if (reduceMotion || !hayAnime) { ocultar(); return; }

  anime.timeline()
    .add({
      targets: "#preloader .letras span",
      translateY: [44, 0], opacity: [0, 1],
      easing: "easeOutExpo", duration: 700, delay: anime.stagger(38)
    })
    .add({
      targets: "#preloader .barra i",
      width: ["0%", "100%"], easing: "easeInOutQuart", duration: 800
    }, "-=300")
    .finished.then(() => setTimeout(ocultar, 150));
  /* red de seguridad: nunca dejar el preloader más de 4 s */
  setTimeout(() => { if (document.getElementById("preloader")) ocultar(); }, 4000);
})();

/* ============================================================
   2. MENÚ MÓVIL + sombra del header + barra de progreso
   ============================================================ */
(function navegacion() {
  const btn = document.getElementById("btnMenu");
  const menu = document.getElementById("menu");
  btn.addEventListener("click", () => {
    menu.classList.toggle("abierto");
    btn.classList.toggle("abierto");
  });
  menu.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => { menu.classList.remove("abierto"); btn.classList.remove("abierto"); })
  );
  const header = document.querySelector("header");
  window.addEventListener("scroll", () => header.classList.toggle("con-sombra", window.scrollY > 20), { passive: true });

  if (hayGSAP && !reduceMotion) {
    gsap.to("#progresoScroll", {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 }
    });
  }
})();

/* ============================================================
   3. FALLBACK DE IMÁGENES
   ============================================================ */
document.querySelectorAll("img[data-emoji]").forEach(img => {
  img.addEventListener("error", () => {
    const div = document.createElement("div");
    div.className = "foto-fallback";
    div.textContent = img.dataset.emoji || "🥗";
    img.replaceWith(div);
  });
});

/* ============================================================
   4. THREE.JS — escena del hero
      · 80 partículas-hoja instanciadas + orbes de fruta
      · parallax con el ratón, rotación suave
   ============================================================ */
(function escena() {
  if (reduceMotion || !hayTHREE) return;
  const canvas = document.getElementById("escena3d");
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 11;

  scene.add(new THREE.AmbientLight(0xffffff, 0.95));
  const luz = new THREE.DirectionalLight(0xfff4e0, 0.9);
  luz.position.set(4, 6, 8);
  scene.add(luz);

  const paleta = [0x3fa45b, 0xff8a3d, 0xff5d73, 0xffd84d, 0x7ccb92];

  /* orbes grandes (frutas abstractas) */
  const orbes = [];
  for (let i = 0; i < 9; i++) {
    const geo = new THREE.IcosahedronGeometry(0.4 + Math.random() * 0.55, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: paleta[i % paleta.length],
      roughness: 0.38, metalness: 0.05, flatShading: true,
      transparent: true, opacity: 0.9
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 5 - 1);
    m.userData = { v: 0.15 + Math.random() * 0.35, f: Math.random() * Math.PI * 2, rx: (Math.random() - 0.5) * 0.01, ry: (Math.random() - 0.5) * 0.012 };
    scene.add(m);
    orbes.push(m);
  }

  /* anillos decorativos (torus) */
  const anillos = [];
  for (let i = 0; i < 3; i++) {
    const t = new THREE.Mesh(
      new THREE.TorusGeometry(1.1 + i * 0.5, 0.045, 10, 60),
      new THREE.MeshStandardMaterial({ color: paleta[i], roughness: 0.5, transparent: true, opacity: 0.55 })
    );
    t.position.set(4.5, 0.5, -2);
    t.rotation.x = Math.PI / 2.4 + i * 0.2;
    scene.add(t);
    anillos.push(t);
  }

  /* partículas pequeñas ("polen") */
  const nPart = 90;
  const partGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(nPart * 3);
  for (let i = 0; i < nPart; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 20;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 11;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
  }
  partGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const particulas = new THREE.Points(partGeo, new THREE.PointsMaterial({ color: 0x3fa45b, size: 0.055, transparent: true, opacity: 0.65 }));
  scene.add(particulas);

  /* parallax de ratón */
  const raton = { x: 0, y: 0 };
  window.addEventListener("pointermove", e => {
    raton.x = (e.clientX / window.innerWidth - 0.5) * 2;
    raton.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  const reloj = new THREE.Clock();
  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(canvas);

  (function animar() {
    requestAnimationFrame(animar);
    if (!visible) return;
    const t = reloj.getElapsedTime();
    orbes.forEach(o => {
      o.rotation.x += o.userData.rx + 0.003;
      o.rotation.y += o.userData.ry + 0.004;
      o.position.y += Math.sin(t * o.userData.v + o.userData.f) * 0.0038;
    });
    anillos.forEach((a, i) => { a.rotation.z += 0.0016 + i * 0.0008; });
    particulas.rotation.y = t * 0.02;
    /* cámara sigue suavemente al ratón */
    camera.position.x += (raton.x * 1.1 - camera.position.x) * 0.04;
    camera.position.y += (-raton.y * 0.7 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  })();
})();

/* ============================================================
   5. GSAP — hero, reveals, parallax, marquee, horizontal
   ============================================================ */
(function animacionesGsap() {
  if (!hayGSAP || reduceMotion) return;

  /* --- entrada del hero --- */
  gsap.timeline({ delay: 0.9 })
    .from(".hero-texto .etiqueta", { y: 34, opacity: 0, duration: 0.9, ease: "power3.out" })
    .from(".hero-texto h1", { y: 54, opacity: 0, filter: "blur(6px)", clearProps: "filter", duration: 1.2, ease: "power3.out" }, "-=0.5")
    .from(".hero-texto p", { y: 34, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.65")
    .from(".hero-cta a", { y: 26, opacity: 0, duration: 0.8, stagger: 0.16, ease: "power3.out" }, "-=0.5")
    .from(".hero-mini-stats .mini", { y: 20, opacity: 0, stagger: 0.14, duration: 0.7 }, "-=0.4")
    .from(".plato", { scale: 0.55, opacity: 0, duration: 1.4, ease: "back.out(1.3)" }, "-=1.2")
    .from(".badge-flotante", { scale: 0, opacity: 0, stagger: 0.2, duration: 0.8, ease: "back.out(1.8)" }, "-=0.7");

  /* flotación continua, pausada y orgánica */
  gsap.to(".plato", { y: -18, duration: 3.6, yoyo: true, repeat: -1, ease: "sine.inOut" });
  gsap.to(".badge-1", { y: -14, duration: 3.1, yoyo: true, repeat: -1, ease: "sine.inOut" });
  gsap.to(".badge-2", { y: 14, duration: 3.9, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 0.5 });
  gsap.to(".badge-3", { y: -12, duration: 3.4, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1 });
  gsap.to(".orbita", { rotation: 360, duration: 26, repeat: -1, ease: "none", transformOrigin: "50% 50%" });

  /* hero parallax al hacer scroll */
  gsap.to(".hero-visual", {
    y: 90, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  gsap.to(".hero-texto", {
    y: 50, opacity: 0.25, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "30% top", end: "bottom top", scrub: true }
  });

  /* --- marquee infinito (más pausado) --- */
  const pista = document.querySelector(".marquee-pista");
  if (pista) {
    pista.innerHTML += pista.innerHTML; /* duplicar para bucle perfecto */
    gsap.to(pista, { xPercent: -50, duration: 34, repeat: -1, ease: "none" });
  }

  /* --- palabras de fondo: se deslizan con el scroll --- */
  gsap.utils.toArray(".palabra-fondo").forEach(p => {
    gsap.fromTo(p, { xPercent: 5 }, {
      xPercent: -14, ease: "none",
      scrollTrigger: { trigger: p.parentElement, start: "top bottom", end: "bottom top", scrub: 1.4 }
    });
  });

  /* --- blobs decorativos: deriva lenta con el scroll --- */
  gsap.utils.toArray(".blob").forEach((b, i) => {
    gsap.fromTo(b, { y: 70 }, {
      y: -70, ease: "none",
      scrollTrigger: { trigger: b.parentElement, start: "top bottom", end: "bottom top", scrub: 1.8 + i * 0.4 }
    });
  });

  /* --- reveals por sección: lentos, con blur que se disipa --- */
  document.querySelectorAll("section:not(.hero):not(.ofertas)").forEach(sec => {
    const cab = sec.querySelectorAll(".etiqueta, .titulo, .subtexto");
    if (cab.length) {
      gsap.from(cab, {
        y: 44, opacity: 0, filter: "blur(8px)", duration: 1.15, stagger: 0.18, ease: "power3.out",
        clearProps: "filter",
        scrollTrigger: { trigger: sec, start: "top 78%" }
      });
    }
  });
  const reveal = (sel, trigger, extra = {}) => {
    const els = document.querySelectorAll(sel);
    if (!els.length) return;
    gsap.from(els, {
      y: 56, opacity: 0, duration: 1.05, stagger: 0.14, ease: "power3.out",
      scrollTrigger: { trigger, start: "top 84%" }, ...extra
    });
  };
  reveal(".tarjeta-producto", ".grid-productos");
  reveal(".tarjeta-sucursal", ".grid-sucursales");
  reveal(".paso", ".proceso-grid", { stagger: 0.22 });
  reveal(".tarjeta-contacto", ".grid-contacto", { stagger: 0.22 });
  reveal(".faq-item", ".faq-lista", { y: 34 });
  reveal(".valor", ".valores-mini", { y: 34, stagger: 0.16 });

  /* fotos de "sobre nosotros": entrada suave + parallax continuo */
  gsap.from(".foto-a", { y: 90, opacity: 0, duration: 1.3, ease: "power3.out", scrollTrigger: { trigger: ".sobre-fotos", start: "top 82%" } });
  gsap.from(".foto-b", { y: -70, opacity: 0, duration: 1.3, ease: "power3.out", delay: 0.2, scrollTrigger: { trigger: ".sobre-fotos", start: "top 82%" } });
  gsap.from(".sobre-fotos .foto img", { scale: 1.22, duration: 1.8, ease: "power2.out", stagger: 0.15, scrollTrigger: { trigger: ".sobre-fotos", start: "top 82%" } });
  gsap.from(".sello-experiencia", { scale: 0, rotation: -14, duration: 1, ease: "back.out(1.8)", scrollTrigger: { trigger: ".sobre-fotos", start: "top 70%" } });
  /* parallax cruzado mientras se hace scroll */
  gsap.to(".foto-a", { y: -44, ease: "none", scrollTrigger: { trigger: "#nosotros", start: "top bottom", end: "bottom top", scrub: 1.2 } });
  gsap.to(".foto-b", { y: 40, ease: "none", scrollTrigger: { trigger: "#nosotros", start: "top bottom", end: "bottom top", scrub: 1.2 } });
  gsap.from(".lista-check li", {
    x: -34, opacity: 0, duration: 0.9, stagger: 0.14, ease: "power3.out",
    scrollTrigger: { trigger: ".lista-check", start: "top 86%" }
  });

  /* --- sección OFERTAS: scroll horizontal fijado (solo escritorio) --- */
  ScrollTrigger.matchMedia({
    "(min-width: 861px)": function () {
      const fila = document.querySelector(".pista-ofertas");
      if (!fila) return;
      const desplazamiento = () => -(fila.scrollWidth - document.documentElement.clientWidth + 120);
      gsap.to(fila, {
        x: desplazamiento, ease: "none",
        scrollTrigger: {
          trigger: ".ofertas", start: "top top",
          end: () => "+=" + (fila.scrollWidth - window.innerWidth + 400),
          pin: true, scrub: 0.6, invalidateOnRefresh: true
        }
      });
    }
  });

  /* banda CTA con zoom sutil y lento */
  gsap.from(".cta-banner", {
    scale: 0.9, opacity: 0, duration: 1.3, ease: "power3.out",
    scrollTrigger: { trigger: ".cta-banner", start: "top 82%" }
  });
})();

/* ============================================================
   6. FILTROS DE PRODUCTOS (anime.js re-entrada)
   ============================================================ */
(function filtros() {
  const botones = document.querySelectorAll(".filtro");
  const tarjetas = document.querySelectorAll(".tarjeta-producto");
  botones.forEach(btn => {
    btn.addEventListener("click", () => {
      botones.forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");
      const cat = btn.dataset.cat;
      const visibles = [];
      tarjetas.forEach(t => {
        const coincide = cat === "todo" || t.dataset.cat === cat;
        t.style.display = coincide ? "" : "none";
        if (coincide) visibles.push(t);
      });
      if (hayAnime && !reduceMotion) {
        anime({
          targets: visibles,
          translateY: [24, 0], opacity: [0, 1], scale: [0.96, 1],
          duration: 500, delay: anime.stagger(60), easing: "easeOutQuad"
        });
      }
    });
  });
})();

/* ============================================================
   7. CONTADORES + pulso de botones (anime.js)
   ============================================================ */
(function contadores() {
  const banda = document.querySelector(".banda-stats");
  if (banda) {
    let hecho = false;
    const lanzar = () => {
      if (hecho) return; hecho = true;
      document.querySelectorAll(".contador").forEach(el => {
        const fin = parseInt(el.dataset.fin, 10);
        if (reduceMotion || !hayAnime) { el.textContent = fin.toLocaleString("es-ES"); return; }
        const obj = { n: 0 };
        anime({
          targets: obj, n: fin, round: 1, duration: 1900, easing: "easeOutExpo",
          update: () => (el.textContent = obj.n.toLocaleString("es-ES"))
        });
      });
    };
    new IntersectionObserver(es => es.forEach(e => e.isIntersecting && lanzar()), { threshold: 0.35 }).observe(banda);
  }

  if (hayAnime && !reduceMotion) {
    document.querySelectorAll(".btn").forEach(btn => {
      btn.addEventListener("mouseenter", () => {
        anime.remove(btn);
        anime({ targets: btn, scale: [1, 1.05, 1], duration: 420, easing: "easeOutQuad" });
      });
    });
  }
})();

/* ============================================================
   8. TESTIMONIOS — carrusel automático
   ============================================================ */
(function testimonios() {
  const items = document.querySelectorAll(".testimonio");
  const puntos = document.querySelectorAll(".punto");
  if (!items.length) return;
  let actual = 0, timer;

  function mostrar(i) {
    items[actual].classList.remove("activo");
    puntos[actual].classList.remove("activo");
    actual = i;
    items[actual].classList.add("activo");
    puntos[actual].classList.add("activo");
    if (hayAnime && !reduceMotion) {
      anime({ targets: items[actual], translateY: [18, 0], opacity: [0, 1], duration: 550, easing: "easeOutCubic" });
      anime({
        targets: items[actual].querySelectorAll(".estrellas, blockquote, .quien"),
        translateY: [14, 0], opacity: [0, 1], delay: anime.stagger(90), duration: 450, easing: "easeOutQuad"
      });
    }
  }
  function auto() { timer = setInterval(() => mostrar((actual + 1) % items.length), 5200); }
  puntos.forEach((p, i) => p.addEventListener("click", () => { clearInterval(timer); mostrar(i); auto(); }));
  if (!reduceMotion) auto();

  /* Swipe táctil: adelante / atrás */
  const caja = document.querySelector(".testimonios-caja");
  if (caja) {
    let x0 = null, y0 = null;
    caja.addEventListener("touchstart", e => {
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    }, { passive: true });
    caja.addEventListener("touchend", e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      x0 = y0 = null;
      /* solo si el gesto es claramente horizontal */
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      clearInterval(timer);
      mostrar(dx < 0 ? (actual + 1) % items.length
                     : (actual - 1 + items.length) % items.length);
      if (!reduceMotion) auto();
    }, { passive: true });
  }
})();

/* ============================================================
   9. FAQ acordeón
   ============================================================ */
document.querySelectorAll(".faq-item").forEach(item => {
  const btn = item.querySelector(".faq-preg");
  const resp = item.querySelector(".faq-resp");
  btn.addEventListener("click", () => {
    const abierto = item.classList.contains("abierto");
    document.querySelectorAll(".faq-item.abierto").forEach(o => {
      o.classList.remove("abierto");
      o.querySelector(".faq-resp").style.maxHeight = null;
    });
    if (!abierto) {
      item.classList.add("abierto");
      resp.style.maxHeight = resp.scrollHeight + "px";
    }
  });
});

/* ============================================================
   10. BOLETÍN (solo mensaje local, sin envío de datos)
   ============================================================ */
(function boletin() {
  const form = document.getElementById("formBoletin");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const msg = document.getElementById("boletinMsg");
    msg.textContent = "¡Gracias! Te avisaremos de las ofertas. 🍓";
    form.reset();
    if (hayAnime && !reduceMotion) anime({ targets: msg, translateY: [8, 0], opacity: [0, 1], duration: 450, easing: "easeOutQuad" });
  });
})();

/* ===== Frutas en órbita: tamaño y deriva aleatorios ===== */
(() => {
  const rand = (min, max) => min + Math.random() * (max - min);
  document.querySelectorAll(".orbita .sat").forEach(sat => {
    sat.style.setProperty("--sat-size", rand(1.5, 2.9).toFixed(2) + "rem");
    if (reduceMotion) return;
    sat.style.setProperty("--float-dur", rand(3.5, 7).toFixed(2) + "s");
    sat.style.setProperty("--float-delay", (-rand(0, 5)).toFixed(2) + "s");
    sat.style.setProperty("--dx", rand(4, 12).toFixed(1) + "px");
    sat.style.setProperty("--dy", rand(4, 12).toFixed(1) + "px");
  });
})();
