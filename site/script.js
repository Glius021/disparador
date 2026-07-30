/**
 * ENAMED MAP — renderização das seções a partir de OFFER (config.js)
 * e motor de carrossel (arraste, setas, paginação) reutilizável.
 */

(function () {
  "use strict";

  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function setDocumentMeta() {
    document.title = OFFER.meta.siteTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", OFFER.meta.metaDescription);
  }

  function formatDayMonth(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return day + "/" + month;
  }

  function renderTopbar() {
    if (!OFFER.topbar || OFFER.topbar.enabled !== true) return;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const text = OFFER.topbar.label + " · Válida apenas nos dias " + formatDayMonth(yesterday) + " e " + formatDayMonth(today);
    document.getElementById("topbarIcon").textContent = OFFER.topbar.icon || "";
    document.getElementById("topbarText").textContent = text;
  }

  function renderHero() {
    document.getElementById("heroEyebrow").textContent = OFFER.hero.eyebrow;
    document.getElementById("heroHeadline").innerHTML = OFFER.hero.headlineHtml;
    document.getElementById("heroSub").innerHTML = OFFER.hero.subheadlineHtml;
    document.getElementById("heroUpdateLabel").textContent = OFFER.hero.updateBadge.label;
    document.getElementById("heroUpdateDesc").textContent = OFFER.hero.updateBadge.desc;
    document.getElementById("heroMicro").textContent = OFFER.hero.microcopy;
    document.getElementById("heroCta").textContent = OFFER.hero.ctaLabel;

    const checklist = document.getElementById("heroChecklist");
    OFFER.hero.checklist.forEach((text) => {
      checklist.appendChild(el("li", "hero-checklist-item", '<span class="hero-checklist-icon" aria-hidden="true">&#10003;</span><span>' + text + "</span>"));
    });
    document.getElementById("heroSocialProofText").innerHTML = OFFER.hero.socialProofHtml;
  }

  // Ícones vetoriais lineares (stroke=currentColor), com detalhe em verde-esmeralda.
  var TRUST_ICONS = {
    devices:
      '<svg viewBox="0 0 40 40" fill="none"><rect x="4" y="9" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M4 20h20" stroke="currentColor" stroke-width="1.6"/><rect x="24" y="14" width="11" height="17" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M27.5 27.5h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="30" cy="10" r="6" fill="var(--action)"/><path d="M27.3 10l1.8 1.8 3.2-3.6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    printer:
      '<svg viewBox="0 0 40 40" fill="none"><path d="M11 15V7h18v8" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><rect x="6" y="15" width="28" height="13" rx="2" stroke="currentColor" stroke-width="1.6"/><rect x="11" y="21" width="18" height="12" rx="1" fill="var(--surface-dark)" stroke="currentColor" stroke-width="1.6"/><path d="M15 25.5h10M15 29h7" stroke="var(--action)" stroke-width="1.6" stroke-linecap="round"/><circle cx="29" cy="19" r="1.4" fill="var(--action)"/></svg>',
    brain:
      '<svg viewBox="0 0 40 40" fill="none"><circle cx="10" cy="12" r="3.4" stroke="currentColor" stroke-width="1.6"/><circle cx="30" cy="12" r="3.4" stroke="currentColor" stroke-width="1.6"/><circle cx="20" cy="24" r="3.8" stroke="var(--action)" stroke-width="1.6"/><circle cx="10" cy="30" r="2.6" stroke="currentColor" stroke-width="1.6"/><circle cx="30" cy="30" r="2.6" stroke="currentColor" stroke-width="1.6"/><path d="M12.6 14.2 17 21M27.4 14.2 23 21M12 28l5.4-2.4M28 28l-5.4-2.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    target:
      '<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="14" stroke="currentColor" stroke-width="1.6"/><circle cx="20" cy="20" r="8.5" stroke="currentColor" stroke-width="1.6"/><circle cx="20" cy="20" r="3" fill="var(--action)"/></svg>'
  };

  function renderTrustBar() {
    const list = document.getElementById("trustBarList");
    OFFER.trustBar.items.forEach((item, i) => {
      if (i > 0) list.appendChild(el("span", "trust-bar-divider"));
      list.appendChild(el("div", "trust-bar-item",
        '<span class="trust-bar-icon" aria-hidden="true">' + (TRUST_ICONS[item.icon] || "") + "</span>" +
        '<h3 class="trust-bar-title">' + item.title + "</h3>" +
        '<p class="trust-bar-desc">' + item.desc + "</p>" +
        '<span class="trust-bar-accent" aria-hidden="true"></span>'
      ));
    });
  }

  // ---------- cartão de amostra (placeholder ilustrativo — sem arte real ainda) ----------
  function mapCardHtml(item, index) {
    return (
      '<button type="button" class="map-card" data-index="' + index + '" aria-label="Ampliar amostra: ' + item.title + '">' +
        '<div class="map-card-body">' +
          '<img class="map-card-img no-save" src="' + item.image + '" alt="Mapa de decisão clínica — ' + item.title + '" loading="lazy" decoding="async" draggable="false" />' +
        '</div>' +
      '</button>'
    );
  }

  // ---------- motor de carrossel: arraste, setas, paginação ----------
  function createCarousel(opts) {
    const viewport = document.getElementById(opts.viewport);
    const track = document.getElementById(opts.track);
    const prevBtn = document.getElementById(opts.prev);
    const nextBtn = document.getElementById(opts.next);
    const dotsWrap = opts.dots ? document.getElementById(opts.dots) : null;
    if (!viewport || !track) return;

    let index = 0;
    let cardStep = 0;
    const itemCount = track.children.length;

    function measure() {
      const first = track.children[0];
      if (!first) return;
      const style = getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap) || 0;
      cardStep = first.getBoundingClientRect().width + gap;
    }

    function visibleCount() {
      if (!cardStep) return 1;
      return Math.max(1, Math.round(viewport.getBoundingClientRect().width / cardStep));
    }

    function maxIndex() {
      return Math.max(0, itemCount - visibleCount());
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      const total = maxIndex() + 1;
      for (let i = 0; i < total; i++) {
        const dot = el("button", "carousel-dot");
        dot.type = "button";
        dot.setAttribute("aria-label", "Ir para posição " + (i + 1));
        dot.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(dot);
      }
      updateDots();
    }

    function updateDots() {
      if (!dotsWrap) return;
      Array.from(dotsWrap.children).forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    }

    function goTo(i, animate) {
      const max = maxIndex();
      // Autoplay dá a volta (0 <-> fim); arrastar/setas travam nos limites.
      if (opts.autoplay) {
        index = i < 0 ? max : i > max ? 0 : i;
      } else {
        index = Math.max(0, Math.min(i, max));
      }
      track.style.transition = animate === false ? "none" : "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
      track.style.transform = "translateX(" + -(index * cardStep) + "px)";
      updateDots();
      if (prevBtn) prevBtn.disabled = !opts.autoplay && index <= 0;
      if (nextBtn) nextBtn.disabled = !opts.autoplay && index >= max;
    }

    // Autoplay — avança sozinho, pausa durante interação (arraste, foco, hover).
    let autoplayTimer = null;
    function stopAutoplay() { clearInterval(autoplayTimer); autoplayTimer = null; }
    function startAutoplay() {
      if (!opts.autoplay || maxIndex() <= 0) return;
      stopAutoplay();
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;
      const step = opts.reverse ? -1 : 1;
      autoplayTimer = setInterval(() => goTo(index + step), opts.autoplayInterval || 2800);
    }

    // Arraste natural (mouse + touch via Pointer Events). Só entra em modo
    // "arraste" depois de um limiar mínimo de movimento — abaixo disso, o
    // toque/clique é tratado como um tap normal e não mexe no transform,
    // deixando o evento "click" do cartão disparar sem interferência.
    const DRAG_THRESHOLD = 6;
    let pointerDown = false, dragging = false, startX = 0, startTranslate = 0, activePointerId = null;
    viewport.addEventListener("pointerdown", (e) => {
      pointerDown = true;
      dragging = false;
      activePointerId = e.pointerId;
      startX = e.clientX;
      startTranslate = -index * cardStep;
    });
    viewport.addEventListener("pointermove", (e) => {
      if (!pointerDown) return;
      const dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return;
        dragging = true;
        stopAutoplay();
        track.style.transition = "none";
        viewport.classList.add("is-dragging");
        try { viewport.setPointerCapture(activePointerId); } catch (err) {}
      }
      track.style.transform = "translateX(" + (startTranslate + dx) + "px)";
    });
    function endDrag(e) {
      if (!pointerDown) return;
      pointerDown = false;
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove("is-dragging");
      try { viewport.releasePointerCapture(activePointerId); } catch (err) {}
      const dx = e.clientX - startX;
      if (Math.abs(dx) > cardStep * 0.18) {
        goTo(index - Math.sign(dx));
      } else {
        goTo(index);
      }
      startAutoplay();
    }
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("pointerleave", (e) => { if (dragging) endDrag(e); });

    if (prevBtn) prevBtn.addEventListener("click", () => { stopAutoplay(); goTo(index - 1); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { stopAutoplay(); goTo(index + 1); startAutoplay(); });
    viewport.setAttribute("tabindex", "0");
    viewport.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { stopAutoplay(); goTo(index - 1); startAutoplay(); }
      if (e.key === "ArrowRight") { stopAutoplay(); goTo(index + 1); startAutoplay(); }
    });
    if (opts.autoplay) {
      viewport.addEventListener("mouseenter", stopAutoplay);
      viewport.addEventListener("mouseleave", startAutoplay);
      viewport.addEventListener("focusin", stopAutoplay);
      viewport.addEventListener("focusout", startAutoplay);
    }

    window.addEventListener("resize", () => { measure(); buildDots(); goTo(index, false); });
    measure();
    buildDots();
    goTo(opts.reverse ? maxIndex() : 0, false);
    startAutoplay();
  }

  function renderAmostras() {
    document.getElementById("amostrasTitle").innerHTML = OFFER.amostras.titleHtml;
    document.getElementById("amostrasLead").textContent = OFFER.amostras.lead;
    const track = document.getElementById("amostrasTrack");
    OFFER.amostras.items.forEach((item, i) => track.insertAdjacentHTML("beforeend", mapCardHtml(item, i)));
    track.addEventListener("click", (e) => {
      const card = e.target.closest(".map-card");
      if (card) openLightbox(parseInt(card.getAttribute("data-index"), 10), OFFER.amostras.items);
    });
    createCarousel({ viewport: "amostrasViewport", track: "amostrasTrack", dots: "amostrasDots", autoplay: true, autoplayInterval: 2800 });
  }

  function renderSpecialties() {
    document.getElementById("specialtiesEyebrow").textContent = OFFER.specialties.eyebrow;
    document.getElementById("specialtiesTitle").innerHTML = OFFER.specialties.titleHtml;
    document.getElementById("specialtiesLead").textContent = OFFER.specialties.lead;
    const grid = document.getElementById("specialtyGrid");
    OFFER.specialties.items.forEach((item) => {
      grid.appendChild(el("div", "specialty-card", '<span class="specialty-icon" aria-hidden="true">' + item.icon + "</span><span class=\"specialty-name\">" + item.name + "</span>"));
    });
  }

  function renderGallery2() {
    document.getElementById("gallery2Eyebrow").textContent = OFFER.gallery2.eyebrow;
    document.getElementById("gallery2Title").innerHTML = OFFER.gallery2.titleHtml;

    // Duplica os cartões de cada fileira para garantir conteúdo suficiente
    // para o movimento contínuo do autoplay, mesmo com poucos itens reais.
    const trackA = document.getElementById("rowATrack");
    const itemsA = OFFER.gallery2.rowA.items;
    itemsA.concat(itemsA).forEach((item, i) => trackA.insertAdjacentHTML("beforeend", mapCardHtml(item, i % itemsA.length)));
    trackA.addEventListener("click", (e) => {
      const card = e.target.closest(".map-card");
      if (card) openLightbox(parseInt(card.getAttribute("data-index"), 10), itemsA);
    });

    const trackB = document.getElementById("rowBTrack");
    const itemsB = OFFER.gallery2.rowB.items;
    itemsB.concat(itemsB).forEach((item, i) => trackB.insertAdjacentHTML("beforeend", mapCardHtml(item, i % itemsB.length)));
    trackB.addEventListener("click", (e) => {
      const card = e.target.closest(".map-card");
      if (card) openLightbox(parseInt(card.getAttribute("data-index"), 10), itemsB);
    });

    createCarousel({ viewport: "rowAViewport", track: "rowATrack", autoplay: true, autoplayInterval: 2600 });
    createCarousel({ viewport: "rowBViewport", track: "rowBTrack", autoplay: true, autoplayInterval: 2600, reverse: true });
  }

  // ---------- lightbox ----------
  function openLightbox(index, items) {
    const item = items[index];
    if (!item) return;
    document.getElementById("lightboxMap").innerHTML =
      '<img class="lightbox-img no-save" src="' + item.image + '" alt="Mapa de decisão clínica — ' + item.title + '" decoding="async" draggable="false" />';
    document.getElementById("lightboxCaption").textContent = item.title;
    const lightbox = document.getElementById("lightbox");
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    const lightbox = document.getElementById("lightbox");
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }
  function initLightbox() {
    document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
    document.getElementById("lightboxBackdrop").addEventListener("click", closeLightbox);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
  }

  function renderAudienceFit() {
    document.getElementById("audienceFitEyebrow").textContent = OFFER.audienceFit.eyebrow;
    document.getElementById("audienceFitTitle").innerHTML = OFFER.audienceFit.titleHtml;
    document.getElementById("audienceFitSubtitle").textContent = OFFER.audienceFit.subtitle;
    const grid = document.getElementById("audienceFitGrid");
    OFFER.audienceFit.blocks.forEach((block, i) => {
      const items = block.items.map((t) => '<li><span class="audience-fit-check" aria-hidden="true">&#10003;</span><span>' + t + "</span></li>").join("");
      grid.appendChild(el("div", "audience-fit-card" + (i === 1 ? " audience-fit-card--alt" : ""),
        '<span class="audience-fit-badge">0' + (i + 1) + "</span>" +
        "<h3>" + block.title + "</h3>" +
        '<ul class="audience-fit-list">' + items + "</ul>"
      ));
    });
  }

  function renderAccessSteps() {
    document.getElementById("accessStepsEyebrow").textContent = OFFER.accessSteps.eyebrow;
    document.getElementById("accessStepsTitle").innerHTML = OFFER.accessSteps.titleHtml;
    document.getElementById("accessStepsSubtitle").textContent = OFFER.accessSteps.subtitle;
    const list = document.getElementById("accessStepsList");
    OFFER.accessSteps.items.forEach((step, i) => {
      list.appendChild(el("div", "access-step-card",
        '<span class="access-step-number">' + (i + 1) + "</span>" +
        "<h3>" + step.title + "</h3><p>" + step.desc + "</p>"
      ));
    });
  }

  // Ícones vetoriais lineares para as capas dos bônus (sem emoji como elemento principal).
  var BONUS_ICONS = {
    sus: '<svg viewBox="0 0 40 40" fill="none"><path d="M20 5 8 9v9c0 8 5 13.5 12 17 7-3.5 12-9 12-17V9L20 5z" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/><path d="M20 15v10M15 20h10" stroke="var(--action)" stroke-width="2" stroke-linecap="round"/></svg>',
    urgencia: '<svg viewBox="0 0 40 40" fill="none"><rect x="5" y="16" width="24" height="12" rx="2" stroke="#fff" stroke-width="1.7"/><path d="M29 20h4l2 3v5h-6" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="30" r="2.6" stroke="var(--action)" stroke-width="1.7"/><circle cx="27" cy="30" r="2.6" stroke="var(--action)" stroke-width="1.7"/><path d="M9 22h5l2-4 2 7 2-4h4" stroke="var(--action)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    lab: '<svg viewBox="0 0 40 40" fill="none"><path d="M16 6h8M17 6v11l-8 15a2 2 0 0 0 1.8 3h18.4a2 2 0 0 0 1.8-3l-8-15V6" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/><path d="M14 26h12" stroke="var(--action)" stroke-width="1.7"/><circle cx="18" cy="30" r="1.1" fill="var(--action)"/><circle cx="22.5" cy="32" r="1.1" fill="var(--action)"/></svg>',
    cronograma: '<svg viewBox="0 0 40 40" fill="none"><rect x="6" y="8" width="28" height="24" rx="2.5" stroke="#fff" stroke-width="1.7"/><path d="M6 15h28M13 5v6M27 5v6" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/><path d="M11 21h4M17 21h4M23 21h4M11 26h4M17 26h4" stroke="var(--action)" stroke-width="1.8" stroke-linecap="round"/></svg>',
    checklist: '<svg viewBox="0 0 40 40" fill="none"><rect x="9" y="6" width="22" height="28" rx="2.5" stroke="#fff" stroke-width="1.7"/><path d="M15 6h10v4H15z" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><path d="M13.5 17.5l2 2 3.5-4M13.5 25.5l2 2 3.5-4" stroke="var(--action)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 18h5M22 26h5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>',
    flashcards: '<svg viewBox="0 0 40 40" fill="none"><rect x="10" y="12" width="20" height="15" rx="2.2" fill="none" stroke="#fff" stroke-width="1.5" transform="rotate(-6 20 20)"/><rect x="9" y="14" width="22" height="16" rx="2.5" stroke="#fff" stroke-width="1.7"/><text x="20" y="25" font-size="9" font-weight="800" fill="var(--action)" text-anchor="middle" font-family="sans-serif">?</text></svg>'
  };

  function renderBonuses() {
    if (!OFFER.bonuses || OFFER.bonuses.enabled !== true) return;
    document.getElementById("bonusesEyebrow").textContent = OFFER.bonuses.eyebrow;
    document.getElementById("bonusesTitle").innerHTML = OFFER.bonuses.titleHtml;
    document.getElementById("bonusesLead").textContent = OFFER.bonuses.lead;
    const grid = document.getElementById("bonusGrid");
    OFFER.bonuses.items.forEach((bonus) => {
      grid.appendChild(el("div", "bonus-card",
        '<div class="bonus-cover">' +
          '<span class="bonus-cover-number">Bônus ' + bonus.number + "</span>" +
          '<span class="bonus-cover-icon" aria-hidden="true">' + (BONUS_ICONS[bonus.icon] || "") + "</span>" +
          '<span class="bonus-cover-accent"></span>' +
        "</div>" +
        '<h3 class="bonus-name">' + bonus.name + "</h3>" +
        '<p class="bonus-description">' + bonus.description + "</p>"
      ));
    });
  }

  function renderProof() {
    if (!OFFER.proof || OFFER.proof.enabled !== true) return;
    document.getElementById("proofEyebrow").textContent = OFFER.proof.eyebrow;
    document.getElementById("proofTitle").innerHTML = OFFER.proof.titleHtml;
    const grid = document.getElementById("testimonialGrid");
    // Duplica os depoimentos para garantir conteúdo suficiente para o carrossel
    // deslizar continuamente para a esquerda, mesmo com poucos itens reais.
    OFFER.proof.items.concat(OFFER.proof.items).forEach((item) => {
      grid.appendChild(el("article", "testimonial-card",
        '<div class="testimonial-stars" aria-hidden="true">★★★★★</div>' +
        '<p class="testimonial-quote">"' + item.quote + '"</p>' +
        '<p class="testimonial-name">' + item.name + "</p>" +
        '<p class="testimonial-role">' + item.role + "</p>"
      ));
    });
    createCarousel({ viewport: "proofViewport", track: "testimonialGrid", autoplay: true, autoplayInterval: 2600 });
  }

  function fillPricingCard(prefix, plan) {
    document.getElementById(prefix + "Name").textContent = plan.planName;
    document.getElementById(prefix + "Price").textContent = plan.price;
    document.getElementById(prefix + "Note").textContent = plan.priceNote || "";
    const includes = document.getElementById(prefix + "Includes");
    plan.includes.forEach((inc) => includes.appendChild(el("li", null, '<span class="check">&#10003;</span><span>' + inc + "</span>")));
    document.getElementById(prefix + "Cta").textContent = plan.ctaLabel;
  }

  function renderPricing() {
    document.getElementById("pricingEyebrow").textContent = OFFER.pricing.eyebrow;
    document.getElementById("pricingTitle").innerHTML = OFFER.pricing.titleHtml;
    fillPricingCard("basic", OFFER.pricing.basic);
    fillPricingCard("premium", OFFER.pricing.premium);
    document.getElementById("premiumRibbon").textContent = OFFER.pricing.premium.ribbon || "";

    document.getElementById("accessTitle").innerHTML = OFFER.pricing.access.titleHtml;
    const devices = document.getElementById("accessDevices");
    OFFER.pricing.access.devices.forEach((d) => {
      devices.appendChild(el("div", "access-device", '<span class="access-device-icon" aria-hidden="true">' + d.icon + "</span><span>" + d.label + "</span>"));
    });
  }

  function renderGuarantee() {
    if (!OFFER.guarantee || OFFER.guarantee.enabled !== true) return;
    document.getElementById("guaranteeLabel").textContent = OFFER.guarantee.label;
    document.getElementById("guaranteeTitle").innerHTML = OFFER.guarantee.titleHtml;
    document.getElementById("guaranteeTerms").textContent = OFFER.guarantee.terms;
  }

  function renderFaq() {
    document.getElementById("faqTitle").textContent = OFFER.faq.title;
    const list = document.getElementById("faqList");
    OFFER.faq.items.forEach((item, i) => {
      const id = "faq-" + i;
      const wrap = el("div", "faq-item");
      wrap.setAttribute("data-open", "false");
      wrap.innerHTML =
        '<h3><button class="faq-question" type="button" aria-expanded="false" aria-controls="' + id + '">' +
        "<span>" + item.question + "</span><span class=\"icon\">+</span></button></h3>" +
        '<div class="faq-answer" id="' + id + '"><div class="faq-answer-inner"><p>' + item.answer + "</p></div></div>";
      list.appendChild(wrap);
    });
    list.addEventListener("click", (e) => {
      const btn = e.target.closest(".faq-question");
      if (!btn) return;
      const item = btn.closest(".faq-item");
      const isOpen = item.getAttribute("data-open") === "true";
      item.setAttribute("data-open", String(!isOpen));
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  function renderFinalCta() {
    document.getElementById("finalCtaTitle").innerHTML = OFFER.finalCta.titleHtml;
    document.getElementById("finalCta").textContent = OFFER.finalCta.ctaLabel;
    document.getElementById("legalNotice").textContent = OFFER.legalNotice;
  }

  function goToCheckout(url) {
    const target = url || OFFER.checkoutUrl;
    if (!target || target.indexOf("#") === 0) {
      console.warn("[ENAMED MAP] Link de checkout ainda não configurado — defina em config.js antes de publicar.");
      return;
    }
    window.location.href = target;
  }

  function wireCta() {
    document.querySelectorAll("[data-cta]:not(#heroCta):not(#finalCta)").forEach((btn) => {
      btn.addEventListener("click", () => goToCheckout());
    });
    const heroCta = document.getElementById("heroCta");
    const nextSection = document.getElementById("amostras-root");
    if (heroCta && nextSection) heroCta.addEventListener("click", () => nextSection.scrollIntoView({ behavior: "smooth", block: "start" }));
    const finalCta = document.getElementById("finalCta");
    const pricingSection = document.getElementById("pricing-root");
    if (finalCta && pricingSection) finalCta.addEventListener("click", () => pricingSection.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function setupScrollReveal() {
    const cards = document.querySelectorAll(".specialty-card, .bonus-card, .testimonial-card, .audience-fit-card, .access-step-card");
    if (!("IntersectionObserver" in window)) { cards.forEach((c) => c.classList.add("is-visible")); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } });
    }, { threshold: 0.01, rootMargin: "0px 0px 80px 0px" });
    cards.forEach((card, i) => { card.style.transitionDelay = Math.min(i * 25, 150) + "ms"; observer.observe(card); });
  }

  // Bloqueia clique-direito ("Salvar imagem como...") nas artes reais do produto.
  // Não impede alguém decidido (dev tools sempre acessa a URL da imagem), só
  // reduz o salvamento casual.
  function guardImages() {
    document.addEventListener("contextmenu", (e) => {
      if (e.target.closest && e.target.closest(".no-save")) e.preventDefault();
    });
    document.addEventListener("dragstart", (e) => {
      if (e.target.closest && e.target.closest(".no-save")) e.preventDefault();
    });
  }

  function init() {
    setDocumentMeta();
    renderTopbar();
    renderHero();
    renderTrustBar();
    renderAmostras();
    renderSpecialties();
    renderGallery2();
    renderAudienceFit();
    renderAccessSteps();
    renderBonuses();
    renderProof();
    renderPricing();
    renderGuarantee();
    renderFaq();
    renderFinalCta();
    initLightbox();
    wireCta();
    setupScrollReveal();
    guardImages();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
