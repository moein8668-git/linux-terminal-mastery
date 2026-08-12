(() => {
  "use strict";
  const root = document.documentElement;
  const content = document.querySelector("#content");
  const menus = [...document.querySelectorAll("[data-menu]")];
  const closeMenus = () => menus.forEach((button) => {
    document.getElementById(button.dataset.menu).hidden = true;
    button.setAttribute("aria-expanded", "false");
  });

  menus.forEach((button) => {
    button.setAttribute("aria-expanded", "false");
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const panel = document.getElementById(button.dataset.menu);
      const shouldOpen = panel.hidden;
      closeMenus();
      panel.hidden = !shouldOpen;
      button.setAttribute("aria-expanded", String(shouldOpen));
    });
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".menu-panel") && !event.target.closest("[data-menu]")) closeMenus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenus();
  });

  const search = document.querySelector("#chapterSearch");
  search?.addEventListener("input", () => {
    const query = search.value.trim().toLocaleLowerCase();
    document.querySelectorAll(".menu-chapters li").forEach((item) => {
      item.hidden = query && !item.textContent.toLocaleLowerCase().includes(query);
    });
  });
  document.querySelectorAll(".chapter-tree a[data-chapter]").forEach((link) => {
    if (link.dataset.chapter === window.CURRENT_CHAPTER) link.classList.add("current");
  });

  const themeButton = document.querySelector("#themeButton");
  const themes = ["dracula", "nord", "light"];
  let theme = localStorage.getItem("lt-theme") || "dracula";
  const setTheme = (value) => {
    theme = value;
    root.dataset.theme = value;
    localStorage.setItem("lt-theme", value);
  };
  setTheme(theme);
  themeButton?.addEventListener("click", () => setTheme(themes[(themes.indexOf(theme) + 1) % themes.length]));

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.dataset.action;
      closeMenus();
      if (action === "print") window.print();
      if (action === "top") content?.scrollTo({ top: 0, behavior: "smooth" });
      if (action === "copy") {
        const text = [...document.querySelectorAll("pre code")].map((code) => code.textContent).join("\n");
        try { await navigator.clipboard.writeText(text); button.textContent = "کپی شد ✓"; } catch { button.textContent = "کپی ناموفق بود"; }
        setTimeout(() => { button.textContent = "کپی کدهای این فصل"; }, 1400);
      }
    });
  });

  const headings = [...document.querySelectorAll(".markdown h2, .markdown h3")];
  const toc = document.querySelector("#toc");
  headings.forEach((heading) => {
    if (!heading.id) heading.id = `section-${headings.indexOf(heading) + 1}`;
    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    link.dataset.target = heading.id;
    toc?.append(link);
  });

  const updateProgress = () => {
    if (!content) return;
    const max = content.scrollHeight - content.clientHeight;
    document.querySelector("#progress").textContent = `${max > 0 ? Math.round(content.scrollTop / max * 100) : 0}%`;
  };
  content?.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    document.querySelectorAll(".toc a").forEach((link) => link.classList.toggle("current", link.dataset.target === visible.target.id));
  }, { root: content, rootMargin: "-10% 0px -75% 0px" });
  headings.forEach((heading) => observer.observe(heading));

  document.querySelectorAll(".tag-filter").forEach((button) => {
    button.addEventListener("click", () => {
      const tag = button.dataset.tag;
      document.querySelectorAll(".tag-filter").forEach((item) => item.classList.toggle("active", item === button));
      document.querySelectorAll(".chapter-tree li").forEach((item) => {
        const chapter = item.querySelector("a");
        const tags = (chapter?.dataset.tags || "").split(",");
        item.hidden = !tags.includes(tag);
      });
    });
  });

  const clock = document.querySelector("#clock");
  const updateClock = () => { if (clock) clock.textContent = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(new Date()); };
  updateClock();
  setInterval(updateClock, 30000);
})();
