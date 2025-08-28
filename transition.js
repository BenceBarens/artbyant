// transition.js

function resetStrokes() {
  const strokes = document.querySelectorAll(".transition-overlay .stroke");
  strokes.forEach(s => {
    s.style.animation = "none";
    s.style.transform = "rotate(-15deg) translateX(-100%)";
    s.offsetHeight; // force reflow (hackje zodat animatie herstartbaar is)
  });
}

function coverPage(callback) {
  const strokes = document.querySelectorAll(".transition-overlay .stroke");
  let delay = 0;
  strokes.forEach(s => {
    s.style.animation = `strokeIn 0.6s ease forwards`;
    s.style.animationDelay = `${delay}s`;
    delay += 0.2;
  });
  setTimeout(() => callback && callback(), 1200);
}

function revealPage() {
  const strokes = document.querySelectorAll(".transition-overlay .stroke");
  let delay = 0;
  strokes.forEach(s => {
    s.style.animation = `strokeOut 0.6s ease forwards`;
    s.style.animationDelay = `${delay}s`;
    delay += 0.2;
  });

  // Reset na reveal zodat ze opnieuw bruikbaar zijn
  setTimeout(resetStrokes, 1200);
}

// Inject overlay in elke pagina
function injectOverlay() {
  if (!document.querySelector(".transition-overlay")) {
    const overlay = document.createElement("div");
    overlay.className = "transition-overlay";

    // drie strokes met variatie
    overlay.innerHTML = `
      <div class="stroke" style="top:0; background-position:${Math.random()*100}% 0;"></div>
      <div class="stroke" style="top:30%; background-position:${Math.random()*100}% 0;"></div>
      <div class="stroke" style="top:60%; background-position:${Math.random()*100}% 0;"></div>
    `;
    document.body.appendChild(overlay);
  }
}


window.addEventListener("DOMContentLoaded", () => {
  injectOverlay();

  // Check of we uit een transitie komen
  if (sessionStorage.getItem("transition") === "true") {
    sessionStorage.setItem("transition", "false");
    const strokes = document.querySelectorAll(".transition-overlay .stroke");
    strokes.forEach(s => s.style.transform = "rotate(-15deg) translateX(0%)");
    window.addEventListener("load", revealPage);
  }

  // Intercepteer clicks op interne links
  document.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", e => {
      const url = a.href;
      if (url.startsWith(window.location.origin)) {
        e.preventDefault();
        coverPage(() => {
          sessionStorage.setItem("transition", "true");
          window.location = url;
        });
      }
    });
  });
});
