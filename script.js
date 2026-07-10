(function () {
  const cfg = window.BIRTHDAY_CONFIG || {};

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const stepEls = [
    $("#stepHome"),
    $("#stepLock"),
    $("#stepStory"),
    $("#stepFavorite"),
    $("#stepMusic"),
    $("#stepLetter"),
    $("#stepFinale"),
  ].filter(Boolean);

  const POLAROID_EMOJI = ["💕", "✨", "🌙", "🎂", "🦋", "⭐", "🧸", "💌"];

  const PAGE_COUNT = stepEls.length;

  let flowIndex = 0;
  let unlocked = false;
  let lockInput = "";
  const passLen = 4;

  const FLOW_NAV = {
    0: {
      back: { main: "←", hint: "" },
      next: { main: "Open your surprise →", hint: "Enter the passcode" },
    },
    1: {
      back: { main: "← The wish again", hint: "Back to the beginning" },
      next: { main: "Our story →", hint: "How we met & beyond" },
    },
    2: {
      back: { main: "← Secret door", hint: "The passcode" },
      next: { main: "My favorite →", hint: "The one I adore" },
    },
    3: {
      back: { main: "← Our chapters", hint: "Polaroid memories" },
      next: { main: "Our soundtrack →", hint: "Music memories" },
    },
    4: {
      back: { main: "← Favorite you", hint: "My favorite person" },
      next: { main: "Your letter →", hint: "Sealed with love" },
    },
    5: {
      back: { main: "← Music memories", hint: "The playlist" },
      next: { main: "For you →", hint: "Badges & bouquet" },
    },
    6: {
      back: { main: "← Your letter", hint: "Soft footsteps back" },
      next: { main: "Stay here ♥", hint: "You're at the end" },
    },
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function openModal(title, htmlOrText) {
    const modal = $("#modal");
    if (!modal || !$("#modalTitle") || !$("#modalBody")) return;
    $("#modalTitle").textContent = title;
    const body = $("#modalBody");
    if (typeof htmlOrText === "string" && htmlOrText.includes("<")) {
      body.innerHTML = htmlOrText;
    } else {
      body.textContent = htmlOrText;
    }
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const modal = $("#modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function bindModalClose() {
    const modal = $("#modal");
    if (!modal) return;
    $$("[data-close-modal]", modal).forEach((el) => el.addEventListener("click", closeModal));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });
  }

  function setNames() {
    const name = cfg.name || "Aakash kumar";
    const heroName = $("#heroName");
    const letterTo = $("#letterToName");
    const letterHeading = $("#letterHeadingName");
    if (heroName) heroName.textContent = name;
    if (letterTo) letterTo.textContent = name;
    if (letterHeading) letterHeading.textContent = name;
    document.title = `Happy Golden Birthday to my Golden boy, ${name}`;

    const chip = $("#heroCountdown");
    const sub = $("#heroSub");
    if (cfg.birthdayISO) {
      const days = daysUntilBirthday(cfg.birthdayISO);
      if (chip) {
        if (days === 0) {
          chip.textContent = "🎂 Today is your birthday";
          chip.hidden = false;
        } else if (days > 0) {
          chip.textContent = `${days} day${days === 1 ? "" : "s"} until your day`;
          chip.hidden = false;
        } else {
          chip.hidden = true;
        }
      }
      if (sub) {
        if (days === 0) {
          sub.textContent = "Today's the day. When you're ready, open your surprise — I'm so glad you exist.";
        } else if (days > 0) {
          sub.textContent = "When you're ready, your surprise is waiting — tap below when your heart says yes.";
        }
      }
    }
  }

  function daysUntilBirthday(iso) {
    const parts = iso.split("-").map(Number);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    let y = now.getFullYear();
    let t = new Date(y, parts[1] - 1, parts[2]).getTime();
    if (t < start) t = new Date(y + 1, parts[1] - 1, parts[2]).getTime();
    return Math.round((t - start) / 86400000);
  }

  function setFlowStep(nextIndex) {
    let i = Math.max(0, Math.min(stepEls.length - 1, nextIndex));
    if (i > 1 && !unlocked) i = 1;
    flowIndex = i;

    stepEls.forEach((el, idx) => {
      el.classList.toggle("is-active", idx === i);
      el.hidden = idx !== i;
    });

    const showPageNav = i >= 1;
    const pageNav = $("#pageNav");
    if (pageNav) pageNav.hidden = !showPageNav;
    document.body.classList.toggle("has-page-nav", showPageNav);

    const flowNav = $("#flowNav");
    if (flowNav) flowNav.hidden = false;
    document.body.classList.add("has-flow-nav");

    const btnFlowBack = $("#btnFlowBack");
    if (btnFlowBack) btnFlowBack.disabled = i === 0;

    $$(".page-nav__link").forEach((link) => {
      link.classList.toggle("is-active", Number(link.getAttribute("data-page")) === i);
    });

    const skyDecor = $("#skyDecor");
    if (skyDecor) skyDecor.hidden = i === 0;

    const btnFlowNext = $("#btnFlowNext");
    if (btnFlowNext) btnFlowNext.disabled = i >= stepEls.length - 1 || (i === 1 && !unlocked);

    const nav = FLOW_NAV[i];
    if (nav) {
      const bm = $("#btnFlowBackMain");
      const bh = $("#btnFlowBackHint");
      const nm = $("#btnFlowNextMain");
      const nh = $("#btnFlowNextHint");
      if (bm) bm.textContent = nav.back.main;
      if (bh) bh.textContent = nav.back.hint;
      if (nm) nm.textContent = nav.next.main;
      if (nh) nh.textContent = nav.next.hint;
    }

    const scrollEl = stepEls[i]?.querySelector(".flow-step__scroll");
    if (scrollEl) scrollEl.scrollTop = 0;
    window.scrollTo(0, 0);

    if (i !== 1) clearConfetti();

    if (i === 5) onLetterPageEnter();
    if (i === stepEls.length - 1) onFinalePageEnter();
  }

  function initGlobalSparkles() {
    const host = $("#globalSparkles");
    if (!host || host.dataset.done) return;
    host.dataset.done = "1";
    const pieces = 48;
    for (let s = 0; s < pieces; s++) {
      const sp = document.createElement("span");
      const isHeart = s % 4 === 0;
      sp.className = isHeart ? "global-sparkle global-sparkle--heart" : "global-sparkle";
      if (isHeart) sp.textContent = "♥";
      sp.style.left = `${Math.random() * 100}%`;
      sp.style.top = `${Math.random() * 100}%`;
      sp.style.animationDelay = `${Math.random() * 3}s`;
      sp.style.animationDuration = `${2 + Math.random() * 2.5}s`;
      host.appendChild(sp);
    }
    host.classList.add("is-visible");
  }

  function setupPageNav() {
    const host = $("#pageNavLinks");
    if (!host) return;
    host.innerHTML = Array.from({ length: PAGE_COUNT }, (_, i) => {
      return `<button type="button" class="page-nav__link" data-page="${i}">Page ${i + 1}</button>`;
    }).join("");

    host.querySelectorAll(".page-nav__link").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = Number(btn.getAttribute("data-page"));
        if (target > 1 && !unlocked) {
          setFlowStep(1);
          return;
        }
        setFlowStep(target);
      });
    });
  }

  function setupFlowNav() {
    $("#btnFlowBack")?.addEventListener("click", () => {
      if (flowIndex > 0) setFlowStep(flowIndex - 1);
    });

    $("#btnFlowNext")?.addEventListener("click", () => {
      if (flowIndex === 1 && !unlocked) return;
      const next = flowIndex + 1;
      if (next > 1 && !unlocked) return;
      if (flowIndex < stepEls.length - 1) setFlowStep(next);
    });
  }

  function imagePath(raw) {
    if (!raw) return "";
    let s = String(raw).trim().replace(/\\/g, "/");
    const marker = "assets/photos/";
    const idx = s.toLowerCase().indexOf(marker);
    if (idx !== -1) s = s.slice(idx);
    if (!s || s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) {
      return s;
    }
    if (!s.startsWith("./") && !s.startsWith("/")) s = "./" + s;
    try {
      return new URL(s, document.baseURI).href;
    } catch {
      return s;
    }
  }

  function mediaSlot(url, emoji) {
    const src = imagePath(url);
    if (src) {
      return `<img src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async" onerror="this.classList.add('img-broken')" />`;
    }
    return emoji;
  }

  function pinSizeForItem(j) {
    const src = imagePath(j.image || "").toLowerCase();
    if (!src) return "";
    if (src.includes("future") || src.includes("thing") || src.includes("memory")) {
      return "story-pin--landscape";
    }
    return "story-pin--portrait";
  }

  function renderStoryMasonry() {
    const grid = $("#storyMasonry");
    if (!grid) return;
    const items = (cfg.journey || []).filter((j) => j.title !== "???");
    grid.innerHTML = items
      .map((j, i) => {
        const emoji = POLAROID_EMOJI[i % POLAROID_EMOJI.length];
        const img = mediaSlot(j.image, emoji);
        const title = j.title ? escapeHtml(j.title) : "♡";
        const sizeClass = pinSizeForItem(j);
        const hasImg = Boolean(imagePath(j.image));
        return `
        <article class="story-pin ${sizeClass}${hasImg ? " story-pin--has-img" : ""}">
          <div class="story-pin__media">${img}</div>
          <div class="story-pin__body">
            <h3 class="story-pin__title">${title}</h3>
            <p class="story-pin__text">${escapeHtml(j.text)}</p>
          </div>
        </article>`;
      })
      .join("");
  }

  function renderFavorite() {
    const items = cfg.journey || [];
    const special = items.find((j) => j.title === "???");
    const quoteEl = $("#favoriteQuote");
    if (quoteEl && special) quoteEl.textContent = special.text;

    const photos = (cfg.favoritePhotos || []).length
      ? cfg.favoritePhotos
      : items.filter((j) => j.title !== "???").slice(0, 4).map((j, i) => ({
          image: j.image || "",
          emoji: POLAROID_EMOJI[i],
        }));

    const collage = $("#favoriteCollage");
    if (!collage) return;

    const main = photos[0] || {};
    const heroImg = mediaSlot(main.image, main.emoji || "💕");
    collage.innerHTML = `
      <figure class="favorite-hero-pin">
        <div class="favorite-hero-pin__img">${heroImg}</div>
        <figcaption class="favorite-hero-pin__cap">my favorite person ♡</figcaption>
      </figure>`;
  }

  function renderEnvelopes() {
    const grid = $("#envelopeGrid");
    if (!grid) return;
    const items = cfg.openWhen || [];
    grid.innerHTML = items
      .map(
        (item, i) => `
        <button type="button" class="env-card" data-idx="${i}">
          <span class="env-card__icon" aria-hidden="true">✉️</span>
          <span class="env-card__label">${escapeHtml(item.title)}</span>
        </button>`
      )
      .join("");

    grid.querySelectorAll(".env-card").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = items[Number(btn.getAttribute("data-idx"))];
        if (item) openModal(item.title, item.body);
      });
    });
  }

  const FINALE_KFLOWER_SVG = `<svg viewBox="0 0 32 32" class="finale-kflower__svg" aria-hidden="true">
    <circle cx="16" cy="16" r="5" fill="#ffca28" stroke="#1a1a1a" stroke-width="1.5"/>
    <ellipse cx="16" cy="8" rx="5" ry="6" fill="#e91e8c" stroke="#1a1a1a" stroke-width="1.5"/>
    <ellipse cx="22" cy="13" rx="5" ry="6" fill="#e91e8c" stroke="#1a1a1a" stroke-width="1.5" transform="rotate(72 16 16)"/>
    <ellipse cx="20" cy="21" rx="5" ry="6" fill="#e91e8c" stroke="#1a1a1a" stroke-width="1.5" transform="rotate(144 16 16)"/>
    <ellipse cx="12" cy="21" rx="5" ry="6" fill="#e91e8c" stroke="#1a1a1a" stroke-width="1.5" transform="rotate(216 16 16)"/>
    <ellipse cx="10" cy="13" rx="5" ry="6" fill="#e91e8c" stroke="#1a1a1a" stroke-width="1.5" transform="rotate(288 16 16)"/>
  </svg>`;

  const FINALE_FLOAT_ITEMS = [
    { kind: "heart", left: "8%", top: "15%", delay: "0s", dur: "7s" },
    { kind: "flower", left: "90%", top: "20%", delay: "0.5s", dur: "8s" },
    { kind: "heart", left: "85%", top: "75%", delay: "1s", dur: "6s" },
    { kind: "flower", left: "12%", top: "80%", delay: "0.3s", dur: "7.5s" },
  ];

  let finaleCelebrated = false;

  function initFinaleDecor() {
    const decor = $("#finaleDecor");
    if (decor && !decor.dataset.done) {
      decor.dataset.done = "1";
      decor.innerHTML = FINALE_FLOAT_ITEMS.map((item, i) => {
        let inner = "";
        if (item.kind === "flower") inner = FINALE_KFLOWER_SVG;
        else if (item.kind === "heart") inner = '<span class="finale-float__heart">♥</span>';
        else inner = '<span class="finale-float__spark">✦</span>';
        return `<span class="finale-float finale-float--${item.kind}" style="left:${item.left};top:${item.top};--float-delay:${item.delay};--float-dur:${item.dur};--float-i:${i}">${inner}</span>`;
      }).join("");
    }
  }

  function onFinalePageEnter() {
    const root = $("#finalePageRoot");
    root?.classList.add("is-celebrating");
    window.setTimeout(() => root?.classList.remove("is-celebrating"), 2400);
    if (!finaleCelebrated) {
      finaleCelebrated = true;
      burstConfettiFinale();
    }
  }

  function burstConfettiFinale() {
    const canvas = $("#confetti");
    if (!canvas) return;
    clearConfetti();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = ["#fff", "#ffd6e7", "#ff2e63", "#ffca28", "#e91e8c", "#b8f5c8"];
    const pieces = Array.from({ length: 140 }, () => ({
      x: innerWidth * 0.5 + (Math.random() - 0.5) * 120,
      y: innerHeight * 0.35 + (Math.random() - 0.5) * 80,
      vy: -(1 + Math.random() * 2),
      vx: -3 + Math.random() * 6,
      r: 3 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      kind: Math.random() > 0.7 ? "heart" : "rect",
    }));
    let f = 0;
    function frame() {
      f++;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.rot += 0.08;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = colors[f % colors.length];
        if (p.kind === "heart") {
          ctx.font = `${p.r * 3}px serif`;
          ctx.textAlign = "center";
          ctx.fillText("♥", 0, 0);
        } else {
          ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
        }
        ctx.restore();
      });
      if (f < 130) confettiFrameId = requestAnimationFrame(frame);
      else confettiFrameId = null;
    }
    confettiFrameId = requestAnimationFrame(frame);
  }

  const FINALE_BADGE_MARKS = ["💝", "✨", "🌟"];

  function renderFinalePage() {
    const sec = cfg.finalePage || {};
    const eyebrow = $("#finaleEyebrow");
    const title = $("#finaleTitle");
    const lead = $("#finaleLead");
    const badgesHost = $("#finaleBadgesList");
    const bouquetImg = $("#finaleBouquetImg");
    const memory = $("#finaleMemory");
    const sign = $("#finaleSign");
    const footerNote = $("#finaleFooterNote");

    if (eyebrow) eyebrow.textContent = sec.eyebrow || "";
    if (title) title.textContent = sec.title || "";
    if (lead) lead.textContent = sec.lead || "";
    if (memory) {
      const closing = (sec.closingLine || "").trim();
      const blocks = closing ? closing.split(/\n\n+/) : [];
      memory.innerHTML = blocks
        .map((block, i) => {
          const cls =
            i === 0
              ? "finale-letter__para finale-letter__para--remember"
              : "finale-letter__para finale-letter__para--love";
          return `<p class="${cls}">${escapeHtml(block).replace(/\n/g, "<br />")}</p>`;
        })
        .join("");
    }
    if (sign) sign.textContent = sec.signOff || "";
    if (footerNote) footerNote.textContent = sec.footerNote || "Made with love. Happy birthday again.";

    const bouquetSrc = imagePath((sec.bouquetImage || "assets/bouquet-dino.png").trim());
    if (bouquetImg && bouquetSrc) bouquetImg.src = bouquetSrc;

    const badges = Array.isArray(sec.badges) ? sec.badges.slice(0, 3) : [];
    if (badgesHost) {
      badgesHost.innerHTML = badges
        .map(
          (label, i) => `
        <div class="finale-award" style="--badge-i: ${i}">
          <span class="finale-award__mark" aria-hidden="true">${FINALE_BADGE_MARKS[i] || "♥"}</span>
          <span class="finale-award__label">${escapeHtml(label)}</span>
        </div>`
        )
        .join("");
    }
  }

  function renderLockPolaroid() {
    const imgHost = $("#lockPolaroidImg");
    if (!imgHost) return;
    const url = (cfg.lockPolaroidImage || "").trim();
    const src = imagePath(url);
    imgHost.innerHTML = src
      ? `<img src="${escapeHtml(src)}" alt="" loading="eager" decoding="async" onerror="this.classList.add('img-broken')" />`
      : "♡";
  }

  function setupLockScreen() {
    const hint = $("#lockHint");
    if (hint) hint.textContent = cfg.passcodeHint || "hint — your golden day (MMDD)";
    renderLockPolaroid();

    const keypad = $("#lockKeypad");
    if (!keypad) return;
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
    keypad.innerHTML = keys
      .map((k) => {
        if (k === "") return `<span class="lock-key lock-key--empty"></span>`;
        return `<button type="button" class="lock-key" data-key="${k}">${k}</button>`;
      })
      .join("");

    keypad.querySelectorAll(".lock-key[data-key]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-key");
        if (key === "*") clearLock();
        else if (key !== "#") onLockDigit(key);
      });
    });

    $("#lockClear")?.addEventListener("click", clearLock);
  }

  function updateLockBoxes() {
    $("#lockBoxes")?.querySelectorAll("span").forEach((span, i) => {
      const ch = lockInput[i] || "";
      span.textContent = ch ? "•" : "";
      span.classList.toggle("filled", Boolean(ch));
    });
  }

  function onLockDigit(digit) {
    if (lockInput.length >= passLen) return;
    lockInput += digit;
    updateLockBoxes();
    if (lockInput.length === passLen) checkPasscode();
  }

  function clearLock() {
    lockInput = "";
    updateLockBoxes();
  }

  function checkPasscode() {
    const expected = String(cfg.passcode || "0722");
    const screen = $(".lock-split");
    if (lockInput === expected) {
      unlocked = true;
      const btnFlowNext = $("#btnFlowNext");
      if (btnFlowNext) btnFlowNext.disabled = false;
      burstHeartsUnlock();
      burstConfetti();
      const hint = $("#lockHint");
      if (hint) hint.textContent = "Correct — tap Next when you're ready ♥";
    } else {
      screen?.classList.add("is-shake");
      setTimeout(() => screen?.classList.remove("is-shake"), 500);
      setTimeout(clearLock, 400);
    }
  }

  function burstHeartsUnlock() {
    const layer = document.createElement("div");
    layer.className = "unlock-burst";
    document.body.appendChild(layer);
    for (let i = 0; i < 20; i++) {
      const h = document.createElement("span");
      h.className = "burst-heart";
      h.textContent = "♥";
      const angle = (Math.PI * 2 * i) / 20;
      const dist = 80 + Math.random() * 100;
      h.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
      h.style.setProperty("--ty", `${Math.sin(angle) * dist}px`);
      layer.appendChild(h);
    }
    setTimeout(() => layer.remove(), 1100);
  }

  let letterTimer = null;
  let letterStarted = false;

  function onLetterPageEnter() {
    const paper = $("#loveLetterPaper");
    if (paper) paper.classList.add("is-visible");
    const replay = $("#replayLetter");
    if (replay) replay.hidden = false;
    if (!letterStarted) {
      letterStarted = true;
      startTypedLetter();
    }
  }

  function startTypedLetter() {
    const typedLetter = $("#typedLetter");
    const letterCursor = $("#letterCursor");
    if (!typedLetter) return;
    const text = cfg.letterText || "";
    let idx = 0;
    typedLetter.textContent = "";
    letterCursor?.classList.remove("is-off");
    if (letterTimer) clearInterval(letterTimer);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      typedLetter.textContent = text;
      letterCursor?.classList.add("is-off");
      return;
    }

    letterTimer = setInterval(() => {
      idx += 1;
      typedLetter.textContent = text.slice(0, idx);
      if (idx >= text.length) {
        clearInterval(letterTimer);
        letterTimer = null;
        letterCursor?.classList.add("is-off");
      }
    }, 28);
  }

  function setupLetterReplay() {
    $("#replayLetter")?.addEventListener("click", startTypedLetter);
  }

  let trackIndex = 0;
  let playlist = [];

  function getPlaylist() {
    if (Array.isArray(cfg.playlist) && cfg.playlist.length) {
      return cfg.playlist.filter((t) => t && t.src);
    }
    return [];
  }

  function spotifyPlaylistId(raw) {
    if (!raw) return "";
    const s = String(raw).trim();
    const embedMatch = s.match(/embed\/playlist\/([a-zA-Z0-9]+)/);
    if (embedMatch) return embedMatch[1];
    const openMatch = s.match(/playlist\/([a-zA-Z0-9]+)/);
    if (openMatch) return openMatch[1];
    return s;
  }

  function renderSpotifyPlaylist() {
    const sec = cfg.spotifyPlaylist || {};
    const panel = $("#spotifyPanel");
    const host = $("#spotifyEmbedHost");
    const title = $("#spotifyPlaylistTitle");
    const meta = $("#spotifyPlaylistMeta");
    const link = $("#spotifyOpenLink");
    const id = spotifyPlaylistId(sec.id || sec.url || "");
    if (!panel || !host || !id) return;

    if (title) title.textContent = sec.title || "Our playlist";
    if (meta) meta.textContent = sec.curator ? `by ${sec.curator}` : "";
    if (link) {
      link.href = sec.url || `https://open.spotify.com/playlist/${id}`;
    }

    host.innerHTML = `<iframe
      class="spotify-embed"
      title="${escapeHtml(sec.title || "Spotify playlist")}"
      src="https://open.spotify.com/embed/playlist/${encodeURIComponent(id)}?utm_source=generator"
      width="100%"
      height="352"
      frameborder="0"
      allowfullscreen=""
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    ></iframe>`;
    panel.hidden = false;
  }

  function renderPlaylist() {
    playlist = getPlaylist();
    const list = $("#playlist");
    if (!list) return;
    list.innerHTML = playlist
      .map(
        (t, i) => `
      <li><button type="button" data-track="${i}">${escapeHtml(t.title)}${t.artist ? ` · ${escapeHtml(t.artist)}` : ""}</button></li>`
      )
      .join("");
    list.querySelectorAll("button[data-track]").forEach((btn) => {
      btn.addEventListener("click", () => loadTrack(Number(btn.getAttribute("data-track")), true));
    });
    updateNowPlaying();
  }

  function updateNowPlaying() {
    const el = $("#nowPlaying");
    const t = playlist[trackIndex];
    if (el && t) el.textContent = `${t.title}${t.artist ? ` — ${t.artist}` : ""}`;
  }

  function loadTrack(i, play) {
    trackIndex = (i + playlist.length) % playlist.length;
    const track = playlist[trackIndex];
    const audio = $("#playlistAudio");
    const disc = $("#vinylDisc");
    $$(".playlist button").forEach((b) => b.classList.remove("is-active"));
    $(`.playlist button[data-track="${trackIndex}"]`)?.classList.add("is-active");
    updateNowPlaying();
    if (!audio) return;
    if (track.src) {
      audio.src = track.src;
      audio.load();
      if (play) {
        audio.play().catch(() => openModal("Music", "Add MP3 paths in config.js → playlist[].src"));
        disc?.classList.add("is-spinning");
        const pb = $("#playTrack");
        if (pb) pb.textContent = "⏸";
      }
    } else if (play) {
      openModal("Playlist", "Add your songs in config.js under playlist with title and src.");
    }
  }

  function setupMusicPlayer() {
    const audio = $("#playlistAudio");
    const progress = $("#trackProgress");
    $("#prevTrack")?.addEventListener("click", () => loadTrack(trackIndex - 1, true));
    $("#nextTrack")?.addEventListener("click", () => loadTrack(trackIndex + 1, true));
    $("#playTrack")?.addEventListener("click", () => {
      const track = playlist[trackIndex];
      if (!track?.src) {
        loadTrack(trackIndex, true);
        return;
      }
      if (!audio) return;
      const disc = $("#vinylDisc");
      const pb = $("#playTrack");
      if (audio.paused) {
        audio.play();
        pb.textContent = "⏸";
        disc?.classList.add("is-spinning");
      } else {
        audio.pause();
        pb.textContent = "▶";
        disc?.classList.remove("is-spinning");
      }
    });
    audio?.addEventListener("timeupdate", () => {
      if (audio.duration && progress) {
        progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
      }
    });
    audio?.addEventListener("ended", () => loadTrack(trackIndex + 1, true));
  }

  let confettiFrameId = null;

  function clearConfetti() {
    if (confettiFrameId) {
      cancelAnimationFrame(confettiFrameId);
      confettiFrameId = null;
    }
    const canvas = $("#confetti");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function burstConfetti() {
    const canvas = $("#confetti");
    if (!canvas) return;
    clearConfetti();
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = ["#fff", "#ffd6e7", "#ff2e63"];
    const pieces = Array.from({ length: 100 }, () => ({
      x: Math.random() * innerWidth,
      y: -20,
      vy: 2 + Math.random() * 3,
      vx: -2 + Math.random() * 4,
      r: 4 + Math.random() * 4,
    }));
    let f = 0;
    function frame() {
      f++;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        ctx.fillStyle = colors[f % colors.length];
        ctx.fillRect(p.x, p.y, p.r, p.r);
      });
      if (f < 100) confettiFrameId = requestAnimationFrame(frame);
      else confettiFrameId = null;
    }
    confettiFrameId = requestAnimationFrame(frame);
  }

  function setupSecrets() {
    const secrets = cfg.secrets || [];
    $$(".sky-star, .sky-heart").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-secret")) || 0;
        openModal("For you", secrets[i] || "You're loved more than you know.");
      });
    });
  }

  function runLoader() {
    const flowNav = $("#flowNav");
    if (flowNav) flowNav.hidden = true;
    return new Promise((resolve) => {
      setTimeout(() => {
        $("#loader")?.classList.add("is-done");
        if (flowNav) flowNav.hidden = false;
        resolve();
      }, 1400);
    });
  }

  function init() {
    setNames();
    renderStoryMasonry();
    renderFavorite();
    renderFinalePage();
    renderPlaylist();
    renderSpotifyPlaylist();
    bindModalClose();
    setupPageNav();
    setupFlowNav();
    setupLockScreen();
    setupLetterReplay();
    setupMusicPlayer();
    setupSecrets();

    initGlobalSparkles();
    initFinaleDecor();

    runLoader().then(() => setFlowStep(0));
  }

  init();
})();
