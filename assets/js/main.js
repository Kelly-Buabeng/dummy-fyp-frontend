/**
 * Site-wide behavior: mobile nav, header scroll state, dynamic
 * copyright year, and a shared toast notification system.
 */

(function () {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mobileMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      })
    );
  }

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  // Footer live status pill — pings the public /health endpoint.
  const statusDot = document.querySelector("[data-status-dot]");
  const statusText = document.querySelector("[data-status-text]");
  if (statusDot && statusText && typeof RoadGuardApi !== "undefined") {
    RoadGuardApi.health()
      .then((res) => {
        statusDot.classList.add("online");
        statusText.textContent = res.pothole_model_ready
          ? "All systems online"
          : "Online — model warming up";
      })
      .catch(() => {
        statusDot.classList.add("offline");
        statusText.textContent = "Service unreachable — it may be waking from idle";
      });
  }
})();

/* ---------------- toast notifications ---------------- */

function ensureToastStack() {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    stack.setAttribute("role", "status");
    stack.setAttribute("aria-live", "polite");
    document.body.appendChild(stack);
  }
  return stack;
}

function showToast(message, type = "info", timeout = 5000) {
  const stack = ensureToastStack();
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
  stack.appendChild(toast);
  const remove = () => {
    toast.style.transition = "opacity .2s ease";
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 200);
  };
  const timer = setTimeout(remove, timeout);
  toast.addEventListener("click", () => {
    clearTimeout(timer);
    remove();
  });
  return toast;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}
