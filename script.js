document.getElementById("year").textContent = new Date().getFullYear();

const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", false);
  })
);

function countUp(el) {
  const target = Number(el.dataset.target);
  const suffix = el.dataset.suffix || "";
  const duration = 1200;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      const num = entry.target.querySelector(".num");
      if (num) countUp(num);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Theme toggle
document.querySelector(".theme-toggle").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
});

// Scroll progress + back-to-top
const progress = document.querySelector(".progress");
const toTop = document.querySelector(".to-top");
let ticking = false;
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  toTop.classList.toggle("show", window.scrollY > 600);
  ticking = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  },
  { passive: true }
);
onScroll();

// Highlight the nav link of the section in view
const navMap = new Map(
  [...links.querySelectorAll('a[href^="#"]')].map((a) => [a.getAttribute("href").slice(1), a])
);
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navMap.forEach((a) => a.classList.remove("active"));
      const link = navMap.get(entry.target.id);
      if (link) link.classList.add("active");
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("main section[id]").forEach((s) => sectionObserver.observe(s));

// Rotating typed role
const typed = document.querySelector(".typed");
if (typed && !reduceMotion) {
  const words = JSON.parse(typed.dataset.words);
  let w = 0;
  let i = words[0].length;
  let deleting = true;
  const tick = () => {
    const word = words[w];
    i += deleting ? -1 : 1;
    typed.textContent = word.slice(0, i);
    let delay = deleting ? 35 : 75;
    if (!deleting && i === word.length) {
      deleting = true;
      delay = 2000;
    } else if (deleting && i === 0) {
      deleting = false;
      w = (w + 1) % words.length;
      delay = 350;
    }
    setTimeout(tick, delay);
  };
  setTimeout(tick, 2500);
}

// Cursor spotlight on cards
document.querySelectorAll(".card").forEach((card) =>
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  })
);

// Project filters
const filterBtns = document.querySelectorAll(".filter-btn");
filterBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    filterBtns.forEach((b) => {
      b.classList.toggle("active", b === btn);
      b.setAttribute("aria-pressed", b === btn);
    });
    document.querySelectorAll(".project").forEach((p) => {
      const show = f === "all" || p.dataset.cat.split(" ").includes(f);
      p.classList.toggle("is-hidden", !show);
      if (show) p.classList.add("visible");
    });
  })
);
