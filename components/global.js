(function () {
  let scriptUrl = "";
  if (document.currentScript && document.currentScript.src) {
    scriptUrl = document.currentScript.src;
  } else {
    const scripts = document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src;
      if (src && (src.endsWith("components/global.js") || src.includes("components/global.js"))) {
        scriptUrl = src;
        break;
      }
    }
  }
  if (!scriptUrl) {
    scriptUrl = new URL("components/global.js", document.baseURI).href;
  }
  
  const rootUrl = new URL("../", scriptUrl);
  let lastHeaderScrollY = 0;
  let headerScrollInitialized = false;
  let headerScrollFrameId = 0;
  let headerCompactState = null;

  function fromRoot(path) {
    try {
      return new URL(path, rootUrl).href;
    } catch (e) {
      console.warn("Connektly: Failed to resolve path relative to root: " + path, e);
      return path;
    }
  }

  function siteUrl(path) {
    const cleanPath = String(path || "").replace(/^\/+/, "");
    return fromRoot(cleanPath);
  }

  function normalizeComponentLinks(scope) {
    if (!scope) {
      return;
    }

    scope.querySelectorAll('a[href^="/"]').forEach((link) => {
      const href = link.getAttribute("href");

      if (!href || href.startsWith("//")) {
        return;
      }

      link.setAttribute("href", siteUrl(href));
    });
  }

  function injectHeaderStyles() {
    if (document.getElementById("connektly-header-mega-menu-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "connektly-header-mega-menu-styles";
    style.textContent = `
      [data-site-header] {
        display: block;
        min-height: calc(var(--site-header-shell-height) + var(--site-header-gap, 0rem));
      }

      .site-header {
        position: fixed;
        top: calc(var(--announcement-bar-height, 0px) + var(--site-header-gap, 0rem));
        left: 0;
        z-index: 35;
        width: 100%;
        margin: 0;
        padding: 1rem max(1.25rem, calc((100vw - var(--max-width, 1200px)) / 2 + 1.25rem));
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 1rem;
        border: 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 0;
        background: #111827;
        color: #ffffff;
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        box-shadow: 0 8px 24px rgba(24, 60, 47, 0.08);
        transition: background 300ms ease, backdrop-filter 300ms ease, box-shadow 300ms ease;
      }

      .site-header.is-scrolled {
        background: #111827;
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
      }

      .brand {
        display: inline-flex;
        align-items: center;
        gap: 0.85rem;
        min-width: 0;
        justify-self: start;
      }

      .brand__mark {
        position: relative;
        width: 2.9rem;
        height: 2.9rem;
        display: grid;
        place-items: center;
        font-family: "Sora", sans-serif;
        font-weight: 700;
        color: #082012;
        background: #0b6fff;
        border-radius: 1rem;
        box-shadow: inset 0 -8px 20px rgba(0, 0, 0, 0.14);
      }

      .brand__mark img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .brand__mark::after {
        content: "";
        position: absolute;
        left: 0.4rem;
        bottom: -0.28rem;
        width: 0.8rem;
        height: 0.8rem;
        background: inherit;
        border-radius: 0 0 0.7rem 0;
        transform: rotate(34deg);
      }

      .brand__mark--image {
        padding: 0.08rem;
        background: #ffffff;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
      }

      .brand__mark--image::after {
        display: none;
      }

      .brand__text {
        display: grid;
      }

      .brand__text strong {
        font-family: "Sora", sans-serif;
        font-size: 1rem;
        line-height: 1;
        color: #ffffff;
      }

      .brand__text small {
        color: rgba(255, 255, 255, 0.72);
        font-size: 0.75rem;
      }

      .site-nav {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        justify-self: center;
      }

      .header-actions {
        justify-self: end;
        display: flex;
        align-items: center;
        gap: 1.25rem;
      }

      .header-actions .nav-login,
      .mobile-actions .nav-login {
        color: #ffffff;
        font-weight: 700;
        font-size: 0.95rem;
        transition: color 180ms ease, transform 180ms ease;
      }

      .header-actions .nav-login:hover,
      .mobile-actions .nav-login:hover {
        color: #0b6fff;
        transform: translateY(-1px);
      }

      .mobile-actions {
        display: none;
      }

      .site-nav>a:not(.button),
      .nav-dropdown__toggle {
        color: #ffffff;
        font-weight: 700;
        font-size: 0.95rem;
        transition: color 180ms ease, transform 180ms ease;
      }

      .site-nav>a:not(.button):hover,
      .site-nav>a:not(.button).is-active,
      .nav-dropdown__toggle:hover,
      .nav-dropdown[open]>.nav-dropdown__toggle,
      .nav-dropdown--current>.nav-dropdown__toggle {
        color: #0b6fff;
        transform: translateY(-1px);
      }

      .nav-dropdown {
        position: relative;
      }

      .nav-dropdown__toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        cursor: pointer;
        list-style: none;
        background: transparent;
        border: none;
        padding: 0;
        font-family: inherit;
      }

      .nav-dropdown__toggle::-webkit-details-marker {
        display: none;
      }

      .nav-dropdown__toggle::after {
        content: "";
        width: 0.46rem;
        height: 0.46rem;
        border-right: 2px solid currentColor;
        border-bottom: 2px solid currentColor;
        transform: rotate(45deg) translateY(-1px);
        transform-origin: center;
        transition: transform 180ms ease, opacity 180ms ease;
        opacity: 0.82;
      }

      .nav-dropdown:hover>.nav-dropdown__toggle::after,
      .nav-dropdown[open]>.nav-dropdown__toggle::after {
        transform: rotate(225deg) translate(-1px, -1px);
        opacity: 1;
      }

      .nav-dropdown__menu {
        position: absolute;
        top: calc(100% + 0.5rem);
        left: 50%;
        z-index: 40;
        display: block;
        min-width: 260px;
        max-width: 300px;
        padding: 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 1.25rem;
        background: #0d1a24;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
        transform: translateX(-50%) translateY(10px) scale(0.95);
        opacity: 0;
        visibility: hidden;
        transition: opacity 250ms cubic-bezier(0.16, 1, 0.3, 1), transform 250ms cubic-bezier(0.16, 1, 0.3, 1), visibility 250ms;
      }

      .nav-dropdown__menu::before {
        content: "";
        position: absolute;
        top: -1rem;
        left: 0;
        right: 0;
        height: 1rem;
      }

      .nav-dropdown:hover .nav-dropdown__menu,
      .nav-dropdown[open] .nav-dropdown__menu {
        opacity: 1;
        visibility: visible;
        transform: translateX(-50%) translateY(0) scale(1);
      }

      .nav-dropdown__menu-inner {
        display: grid;
        gap: 0.25rem;
      }

      .nav-dropdown__menu a {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 0.85rem 1rem;
        border-radius: 0.85rem;
        transition: all 200ms ease;
        background: transparent;
        gap: 0.25rem;
      }

      .dropdown-item-label {
        color: #e2e8f0;
        font-weight: 600;
        font-size: 0.95rem;
        line-height: 1.4;
        transition: color 200ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      .dropdown-item-desc {
        color: #94a3b8;
        font-size: 0.8rem;
        font-weight: 400;
        line-height: 1.5;
        transition: color 200ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      .nav-dropdown__menu a:hover .dropdown-item-label,
      .nav-dropdown__menu a.is-active .dropdown-item-label {
        color: #0b6fff;
      }

      .nav-dropdown__menu a:hover .dropdown-item-desc,
      .nav-dropdown__menu a.is-active .dropdown-item-desc {
        color: #cbd5e1;
      }

      .nav-dropdown__menu a:hover,
      .nav-dropdown__menu a.is-active {
        background: rgba(255, 255, 255, 0.06);
        transform: translateX(4px);
      }

      .nav-dropdown__menu--lg {
        min-width: 340px;
        max-width: 380px;
      }

      .nav-toggle {
        display: none;
        width: 3rem;
        height: 3rem;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
      }

      .nav-toggle span {
        display: block;
        width: 1.1rem;
        height: 2px;
        margin: 0.23rem auto;
        background: #ffffff;
        transition: transform 180ms ease, opacity 180ms ease;
      }

      @media (min-width: 821px) {
        .nav-dropdown__menu.nav-dropdown__menu--mega {
          top: calc(100% + 0.78rem) !important;
          width: var(--mega-menu-header-width, min(calc(100vw - clamp(1rem, 3vw, 3rem)), min(var(--max-width), 1480px))) !important;
          min-width: 0 !important;
          max-width: none !important;
          padding: 0.65rem !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          border-radius: 1.45rem !important;
          background: #111827 !important;
          box-shadow:
            0 34px 80px rgba(0, 0, 0, 0.35),
            0 4px 12px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
          transform: translateX(calc(-50% + var(--mega-menu-shift-x, 0px))) translateY(0.95rem) scale(0.97) !important;
        }

        .nav-dropdown__menu--resources {
          width: var(--mega-menu-header-width, min(calc(100vw - clamp(1rem, 3vw, 3rem)), min(var(--max-width), 1480px))) !important;
          min-width: 0 !important;
        }

        .nav-dropdown:hover .nav-dropdown__menu--mega,
        .nav-dropdown[open] .nav-dropdown__menu--mega {
          transform: translateX(calc(-50% + var(--mega-menu-shift-x, 0px))) translateY(0) scale(1) !important;
        }
      }

      @media (min-width: 821px) and (max-width: 1080px) {
        .nav-dropdown__menu.nav-dropdown__menu--mega,
        .nav-dropdown__menu--resources {
          width: var(--mega-menu-header-width, min(calc(100vw - 1.5rem), min(var(--max-width), 1480px))) !important;
          min-width: 0 !important;
        }
      }

      .mega-menu {
        display: grid;
        gap: 0.65rem;
      }

      @media (min-width: 821px) {
        .mega-menu--solutions {
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 0.75rem !important;
        }

        .mega-menu--resources {
          grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(280px, 0.85fr) !important;
          gap: 0.75rem !important;
        }

        .mega-menu--features {
          grid-template-columns: 1fr !important;
          gap: 0.75rem !important;
        }
      }

      .nav-dropdown__menu--features {
        width: 360px !important;
        min-width: 0 !important;
      }

      .mega-menu__feature {
        position: relative;
        min-height: 100%;
        padding: 1.5rem !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        align-items: flex-start !important;
        gap: 0.65rem !important;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 1.15rem !important;
        background: linear-gradient(165deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01)) !important;
        transition: border-color 260ms ease, background 260ms ease, box-shadow 260ms ease !important;
      }

      .mega-menu__feature:hover {
        border-color: rgba(47, 134, 255, 0.2) !important;
        background: linear-gradient(165deg, rgba(47, 134, 255, 0.04), rgba(255, 255, 255, 0.01)) !important;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
      }

      .mega-menu__feature-icon {
        width: 2.75rem;
        height: 2.75rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.75rem;
        background: rgba(47, 134, 255, 0.08);
        border: 1px solid rgba(47, 134, 255, 0.16);
        color: #2f86ff;
        margin-bottom: 1.25rem;
        transition: transform 220ms ease, background 220ms ease, border-color 220ms ease;
      }
      
      .mega-menu__feature:hover .mega-menu__feature-icon {
        transform: scale(1.05) rotate(2deg);
        background: rgba(47, 134, 255, 0.14);
        border-color: rgba(47, 134, 255, 0.3);
      }

      .mega-menu__feature-heading {
        color: #ffffff !important;
        font-family: "Sora", "Manrope", sans-serif !important;
        font-size: 1.15rem !important;
        font-weight: 700 !important;
        line-height: 1.2 !important;
        margin: 0 0 0.4rem !important;
        text-align: left !important;
      }

      .mega-menu__feature-desc {
        color: rgba(226, 232, 240, 0.65) !important;
        font-size: 0.88rem !important;
        line-height: 1.5 !important;
        margin: 0 0 1.5rem !important;
        text-align: left !important;
      }

      .mega-menu__feature-link {
        display: inline-flex !important;
        align-items: center !important;
        gap: 0.35rem !important;
        color: #2f86ff !important;
        font-weight: 800 !important;
        font-size: 0.9rem !important;
        transition: gap 180ms ease, color 180ms ease !important;
        text-decoration: none !important;
        margin-top: auto !important;
      }
      
      .mega-menu__feature-link svg {
        transition: transform 180ms ease !important;
      }

      .mega-menu__feature:hover .mega-menu__feature-link {
        color: #ffffff !important;
        gap: 0.55rem;
      }

      .mega-menu__feature:hover .mega-menu__feature-link svg {
        transform: translateX(2px) !important;
      }

      .mega-menu__column {
        display: grid;
        align-content: start;
        gap: 0.35rem;
        padding: 0.5rem;
      }

      .mega-menu__heading {
        padding: 0.35rem 0.65rem 0.25rem;
        color: #2f86ff;
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .nav-dropdown__menu--mega .mega-menu__column a {
        display: grid !important;
        grid-template-columns: 2rem minmax(0, 1fr) !important;
        gap: 0.75rem !important;
        align-items: center !important;
        padding: 0.65rem !important;
        border-radius: 0.75rem !important;
        transition: background 180ms ease, transform 180ms ease, border-color 180ms ease !important;
      }

      .nav-dropdown__menu--mega .mega-menu__column a.has-desc {
        align-items: center !important;
      }

      .nav-dropdown__menu--mega .mega-menu__column a:hover,
      .nav-dropdown__menu--mega .mega-menu__column a.is-active {
        transform: translateY(0) !important;
        background: rgba(255, 255, 255, 0.06) !important;
      }

      .nav-dropdown__menu--mega .dropdown-item-icon {
        width: 2rem !important;
        height: 2rem !important;
        display: inline-grid;
        place-items: center;
        border-radius: 0.55rem !important;
        background: rgba(47, 134, 255, 0.06) !important;
        border: 1px solid rgba(47, 134, 255, 0.12) !important;
        color: #2f86ff;
        font-size: 0.75rem;
        font-weight: 900;
        letter-spacing: 0;
        box-shadow: none !important;
        transition: background 180ms ease, border-color 180ms ease, color 180ms ease !important;
      }

      .nav-dropdown__menu--mega a:hover .dropdown-item-icon {
        background: rgba(47, 134, 255, 0.16) !important;
        border-color: rgba(47, 134, 255, 0.3) !important;
        color: #ffffff !important;
      }
      
      .dropdown-item-label {
        display: block;
        color: #ffffff;
        font-weight: 700;
        font-size: 0.95rem;
        margin-bottom: 0.1rem;
      }

      .dropdown-item-desc {
        display: block;
        color: rgba(226, 232, 240, 0.65);
        font-size: 0.82rem;
        line-height: 1.4;
      }

      .mega-menu__integrations-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        padding: 0.5rem 0.65rem;
        margin-top: 0.5rem;
      }

      .integration-badge {
        width: 1.75rem;
        height: 1.75rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        padding: 0.2rem;
        transition: transform 180ms ease, border-color 180ms ease;
      }

      .integration-badge:hover {
        transform: translateY(-2px);
        border-color: #2f86ff;
      }

      .integration-badge img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .integration-badge--more {
        background: rgba(47, 134, 255, 0.12);
        border-color: rgba(47, 134, 255, 0.2);
        color: #2f86ff;
        font-size: 0.72rem;
        font-weight: 800;
        padding: 0;
        letter-spacing: -0.02em;
      }

      @media (max-width: 820px) {
        .nav-dropdown__menu--mega {
          padding: 0.5rem !important;
        }

        .mega-menu--solutions,
        .mega-menu--features,
        .mega-menu--resources {
          grid-template-columns: 1fr !important;
          gap: 0.75rem !important;
        }

        .nav-dropdown:not([open]) .nav-dropdown__menu.nav-dropdown__menu--mega {
          display: none !important;
        }

        .nav-dropdown[open] .nav-dropdown__menu.nav-dropdown__menu--mega {
          display: block !important;
        }

        .mega-menu__feature {
          min-height: auto !important;
          margin-top: 1rem !important;
        }
      }

      @media (min-width: 821px) {
        [data-site-header] {
          min-height: 5rem !important;
        }

        .site-header {
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          min-height: 5rem;
          padding: 1rem max(1.25rem, calc((100vw - var(--max-width)) / 2 + 1.25rem)) !important;
          grid-template-columns: 1fr auto 1fr !important;
          gap: 1rem !important;
          border-width: 0 0 1px !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
          border-radius: 0 !important;
          background: #111827 !important;
          box-shadow: 0 8px 24px rgba(24, 60, 47, 0.08) !important;
          transform: translate3d(0, 0, 0) scale(1) !important;
          transform-origin: top center;
          backface-visibility: hidden;
          will-change: left, top, width, min-height, padding, border-radius, transform;
          animation: none !important;
          transition:
            left 400ms ease,
            top 400ms ease,
            width 400ms ease,
            min-height 400ms ease,
            padding 400ms ease,
            border-radius 400ms ease,
            background 400ms ease,
            border-color 400ms ease,
            box-shadow 400ms ease,
            transform 400ms ease,
            backdrop-filter 400ms ease,
            -webkit-backdrop-filter 400ms ease !important;
        }

        .site-header.is-scrolled {
          top: 0.45rem !important;
          left: 50% !important;
          width: min(calc(100% - clamp(1.25rem, 4vw, 4rem)), min(var(--max-width), 1380px)) !important;
          min-height: auto;
          padding: 0.42rem 0.62rem 0.42rem 0.72rem !important;
          grid-template-columns: auto minmax(0, 1fr) auto !important;
          gap: clamp(0.55rem, 1.4vw, 1.1rem) !important;
          border-width: 1px !important;
          border-color: rgba(255, 255, 255, 0.16) !important;
          border-radius: 999px !important;
          background: rgba(8, 13, 24, 0.92) !important;
          box-shadow:
            0 16px 44px rgba(8, 13, 24, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
          transform: translate3d(-50%, 0, 0) scale(0.985) !important;
        }

        .site-header.is-hidden:not(.is-open) {
          transform: translate3d(-50%, calc(-100% - 1.2rem), 0) scale(0.985) !important;
        }

        .site-header .brand {
          gap: 0.85rem !important;
          transition: gap 400ms ease, transform 220ms ease, opacity 220ms ease !important;
        }

        .site-header.is-scrolled .brand {
          gap: 0.62rem !important;
        }

        .site-header .brand__mark {
          width: 2.9rem !important;
          height: 2.9rem !important;
          border-radius: 1rem !important;
          transition: width 400ms ease, height 400ms ease, border-radius 400ms ease, box-shadow 320ms ease, transform 320ms ease !important;
        }

        .site-header.is-scrolled .brand__mark {
          width: 2.18rem !important;
          height: 2.18rem !important;
          border-radius: 0.72rem !important;
        }

        .site-header .brand__text strong {
          font-size: 1rem !important;
          transition: font-size 400ms ease !important;
        }

        .site-header.is-scrolled .brand__text strong {
          font-size: 0.94rem !important;
        }

        .site-header .site-nav {
          gap: 1.25rem !important;
          padding: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          transition: gap 400ms ease, padding 400ms ease, background 300ms ease !important;
        }

        .site-header.is-scrolled .site-nav {
          gap: 0.2rem !important;
          padding: 0.18rem !important;
          border-radius: 999px !important;
          background: rgba(255, 255, 255, 0.045) !important;
        }

        .site-header .site-nav > a:not(.button),
        .site-header .nav-dropdown__toggle {
          min-height: auto !important;
          padding: 0 !important;
          border-radius: 0 !important;
          color: #ffffff !important;
          font-size: 0.95rem !important;
          background: transparent !important;
          transition:
            color 200ms ease,
            min-height 400ms ease,
            padding 400ms ease,
            border-radius 400ms ease,
            font-size 400ms ease,
            background 200ms ease,
            transform 200ms ease !important;
        }

        .site-header.is-scrolled .site-nav > a:not(.button),
        .site-header.is-scrolled .nav-dropdown__toggle {
          min-height: 2.25rem !important;
          padding: 0.55rem 0.72rem !important;
          border-radius: 999px !important;
          color: rgba(255, 255, 255, 0.78) !important;
          font-size: 0.88rem !important;
        }

        .site-header:not(.is-scrolled) .site-nav > a:not(.button)::before,
        .site-header:not(.is-scrolled) .nav-dropdown__toggle::before {
          display: none !important;
        }

        .site-header:not(.is-scrolled) .site-nav > a:not(.button):hover,
        .site-header:not(.is-scrolled) .site-nav > a:not(.button).is-active,
        .site-header:not(.is-scrolled) .nav-dropdown__toggle:hover,
        .site-header:not(.is-scrolled) .nav-dropdown[open] > .nav-dropdown__toggle,
        .site-header:not(.is-scrolled) .nav-dropdown--current > .nav-dropdown__toggle {
          color: #2f86ff !important;
          background: transparent !important;
          transform: translateY(-1px) !important;
        }

        .site-header.is-scrolled .site-nav > a:not(.button):hover,
        .site-header.is-scrolled .nav-dropdown__toggle:hover,
        .site-header.is-scrolled .nav-dropdown[open] > .nav-dropdown__toggle {
          color: #ffffff !important;
          background: rgba(255, 255, 255, 0.06) !important;
        }

        .site-header.is-scrolled .site-nav > a:not(.button).is-active,
        .site-header.is-scrolled .nav-dropdown--current > .nav-dropdown__toggle {
          color: #2f86ff !important;
        }

        .site-header .header-actions {
          gap: 1.25rem !important;
          transition: gap 400ms ease !important;
        }

        .site-header.is-scrolled .header-actions {
          gap: 0.62rem !important;
        }

        .site-header .header-actions .nav-login {
          padding: 0 !important;
          font-size: 0.95rem !important;
          background: transparent !important;
          transition: padding 400ms ease, font-size 400ms ease, color 180ms ease, transform 180ms ease !important;
        }

        .site-header.is-scrolled .header-actions .nav-login {
          padding: 0.58rem 0.62rem !important;
          font-size: 0.88rem !important;
        }

        .site-header .nav-cta {
          min-height: 2.75rem !important;
          padding: 0.72rem 1.15rem !important;
          transition: min-height 400ms ease, padding 400ms ease, transform 180ms ease, box-shadow 240ms ease !important;
        }

        .site-header.is-scrolled .nav-cta {
          min-height: 2.42rem !important;
          padding: 0.58rem 1rem !important;
        }
      }

      @media (max-width: 820px) {
        :root {
          --site-header-shell-height: 4.25rem;
          --header-float-offset: 0rem;
        }

        [data-site-header] {
          min-height: var(--site-header-shell-height) !important;
        }

        .site-header {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          min-height: var(--site-header-shell-height) !important;
          padding: 0.62rem 0.9rem !important;
          grid-template-columns: auto auto !important;
          border-width: 0 0 1px !important;
          border-radius: 0 !important;
          background: rgba(10, 18, 32, 0.96) !important;
          transform: translateY(0) !important;
          animation: headerDropMobile 520ms cubic-bezier(0.16, 1, 0.3, 1) both !important;
          transition:
            top 400ms ease,
            left 400ms ease,
            width 400ms ease,
            padding 400ms ease,
            border-radius 400ms ease,
            background 300ms ease,
            box-shadow 300ms ease,
            transform 400ms ease !important;
        }

        .site-header.is-scrolled:not(.is-open) {
          top: 0.45rem !important;
          left: 0.65rem !important;
          width: calc(100% - 1.3rem) !important;
          min-height: 3.85rem !important;
          padding: 0.5rem 0.7rem !important;
          border-width: 1px !important;
          border-radius: 1.35rem !important;
          background: rgba(8, 13, 24, 0.94) !important;
          box-shadow:
            0 14px 34px rgba(8, 13, 24, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
          transform: none !important;
        }

        .site-header.is-open {
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          border-radius: 0 !important;
          background: rgba(10, 18, 32, 0.98) !important;
        }

        .site-header.is-hidden:not(.is-open) {
          transform: translateY(-100%) !important;
        }

        .site-nav {
          position: absolute !important;
          top: 100% !important;
          left: 0 !important;
          right: 0 !important;
          display: none !important;
          padding: 0.75rem !important;
          border-radius: 0 !important;
          background: rgba(10, 18, 32, 0.98) !important;
          box-shadow: 0 20px 44px rgba(8, 13, 24, 0.26) !important;
        }

        .site-header.is-open .site-nav {
          display: grid !important;
          gap: 0.45rem !important;
        }

        .site-nav>a:not(.button),
        .nav-dropdown__toggle {
          width: 100% !important;
          justify-content: space-between !important;
          padding: 0.95rem 1rem !important;
          font-size: 0.95rem !important;
          background: transparent !important;
        }

        .nav-dropdown__menu,
        .nav-dropdown__menu--lg {
          position: static !important;
          width: 100% !important;
          min-width: 0 !important;
          max-width: none !important;
          margin-top: 0.35rem !important;
          transform: none !important;
          background: rgba(8, 15, 26, 0.94) !important;
          opacity: 1 !important;
          visibility: visible !important;
        }

        .header-actions {
          display: none !important;
        }

        .mobile-actions {
          display: grid !important;
          gap: 0.65rem !important;
          padding: 0.5rem !important;
        }

        .nav-toggle {
          display: inline-grid !important;
          place-items: center !important;
          width: 2.7rem !important;
          height: 2.7rem !important;
          border: 0 !important;
          border-radius: 999px !important;
          background: rgba(255, 255, 255, 0.1) !important;
          justify-self: end !important;
          cursor: pointer !important;
        }

        .nav-toggle span {
          display: block !important;
          width: 1rem !important;
          height: 2px !important;
          margin: 0.18rem auto !important;
          border-radius: 999px !important;
          background: #ffffff !important;
          transition: transform 220ms ease, opacity 220ms ease !important;
        }

        .site-header.is-open .nav-toggle span:first-child {
          transform: translateY(0.2rem) rotate(45deg) !important;
        }

        .site-header.is-open .nav-toggle span:last-child {
          transform: translateY(-0.2rem) rotate(-45deg) !important;
        }
      }

      /* Home-consistent global header */
      :root {
        --site-header-shell-height: 4.15rem;
        --header-float-offset: 0.65rem;
      }

      [data-site-header] {
        min-height: calc(var(--site-header-shell-height) + 0.25rem) !important;
      }

            .site-header {
        top: 0 !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        width: 100% !important;
        min-height: 5rem !important;
        padding: 0.8rem max(1.25rem, calc((100vw - var(--max-width, 1480px)) / 2 + 1.25rem)) !important;
        grid-template-columns: auto minmax(0, 1fr) auto !important;
        gap: clamp(0.55rem, 1.4vw, 1.1rem) !important;
        border: 1px solid transparent !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 0 !important;
        background: #111827 !important;
        box-shadow: none !important;
        transition:
          top 400ms cubic-bezier(0.16, 1, 0.3, 1),
          width 400ms cubic-bezier(0.16, 1, 0.3, 1),
          padding 400ms cubic-bezier(0.16, 1, 0.3, 1),
          border-radius 400ms cubic-bezier(0.16, 1, 0.3, 1),
          background 400ms cubic-bezier(0.16, 1, 0.3, 1),
          border-color 400ms cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 400ms cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 400ms cubic-bezier(0.16, 1, 0.3, 1), -webkit-backdrop-filter 400ms cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

      .site-header.is-scrolled {
        top: 0.65rem !important;
        width: min(calc(100% - clamp(1rem, 3vw, 3rem)), min(var(--max-width, 1200px), 1480px)) !important;
        min-height: auto !important;
        padding: 0.52rem 0.62rem 0.52rem 0.72rem !important;
        background: rgba(10, 18, 32, 0.84) !important;
        border-color: rgba(255, 255, 255, 0.12) !important;
        border-radius: 999px !important;
        box-shadow:
          0 18px 50px rgba(8, 13, 24, 0.18),
          inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
        backdrop-filter: blur(18px) !important;
        -webkit-backdrop-filter: blur(18px) !important;
      }
.site-header.is-hidden:not(.is-open) {
        transform: translateX(-50%) translateY(calc(-100% - 1.2rem)) !important;
      }

      .site-header .brand {
        gap: 0.62rem !important;
        transition: transform 220ms ease, opacity 220ms ease !important;
      }

      .site-header .brand:hover {
        transform: translateY(-1px) !important;
      }

      .site-header .brand__mark,
      .site-header.is-scrolled .brand__mark {
        width: 2.35rem !important;
        height: 2.35rem !important;
        border-radius: 0.82rem !important;
        transition: width 260ms ease, height 260ms ease, border-radius 260ms ease, box-shadow 260ms ease, transform 260ms ease !important;
      }

      .site-header .brand__mark--image {
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.14) !important;
      }

      .site-header .brand:hover .brand__mark {
        transform: rotate(-2deg) scale(1.03) !important;
      }

      .site-header .brand__text strong,
      .site-header.is-scrolled .brand__text strong {
        font-size: 0.94rem !important;
        letter-spacing: 0 !important;
      }

      .site-header .site-nav,
      .site-header.is-scrolled .site-nav {
        gap: 0.2rem !important;
        padding: 0.18rem !important;
        border-radius: 999px !important;
        background: rgba(255, 255, 255, 0.045) !important;
      }

      .site-header .site-nav > a:not(.button),
      .site-header .nav-dropdown__toggle,
      .site-header.is-scrolled .site-nav > a:not(.button),
      .site-header.is-scrolled .nav-dropdown__toggle {
        position: relative !important;
        isolation: isolate;
        min-height: 2.25rem !important;
        padding: 0.55rem 0.72rem !important;
        border-radius: 999px !important;
        color: rgba(255, 255, 255, 0.78) !important;
        font-size: 0.88rem !important;
        line-height: 1 !important;
        background: transparent !important;
        transition: color 200ms ease, background 200ms ease, transform 200ms ease !important;
      }

      .site-header .site-nav > a:not(.button)::before,
      .site-header .nav-dropdown__toggle::before {
        content: "" !important;
        position: absolute !important;
        inset: 0.22rem !important;
        z-index: -1 !important;
        display: block !important;
        border: 1px solid rgba(47, 134, 255, 0.1) !important;
        border-radius: inherit !important;
        background: rgba(47, 134, 255, 0.13) !important;
        opacity: 0 !important;
        transform: scale(0.82) !important;
        transition: opacity 220ms ease, transform 220ms ease !important;
      }

      .site-header .site-nav > a:not(.button):hover,
      .site-header .site-nav > a:not(.button).is-active,
      .site-header .nav-dropdown__toggle:hover,
      .site-header .nav-dropdown[open] > .nav-dropdown__toggle,
      .site-header .nav-dropdown--current > .nav-dropdown__toggle,
      .site-header.is-scrolled .site-nav > a:not(.button):hover,
      .site-header.is-scrolled .nav-dropdown__toggle:hover,
      .site-header.is-scrolled .nav-dropdown[open] > .nav-dropdown__toggle {
        color: #ffffff !important;
        background: rgba(255, 255, 255, 0.06) !important;
        transform: translateY(-1px) !important;
      }

      .site-header .site-nav > a:not(.button).is-active,
      .site-header .nav-dropdown[open] > .nav-dropdown__toggle,
      .site-header .nav-dropdown--current > .nav-dropdown__toggle,
      .site-header.is-scrolled .site-nav > a:not(.button).is-active,
      .site-header.is-scrolled .nav-dropdown--current > .nav-dropdown__toggle {
        color: #2f86ff !important;
      }

      .site-header .site-nav > a:not(.button):hover::before,
      .site-header .site-nav > a:not(.button).is-active::before,
      .site-header .nav-dropdown__toggle:hover::before,
      .site-header .nav-dropdown[open] > .nav-dropdown__toggle::before,
      .site-header .nav-dropdown--current > .nav-dropdown__toggle::before {
        opacity: 1 !important;
        transform: scale(1) !important;
      }

      .site-header .nav-dropdown__toggle::after {
        width: 0.4rem !important;
        height: 0.4rem !important;
        border-width: 1.8px !important;
      }

      .site-header .header-actions,
      .site-header.is-scrolled .header-actions {
        gap: 0.62rem !important;
      }

      .site-header .header-actions .nav-login,
      .site-header .mobile-actions .nav-login,
      .site-header.is-scrolled .header-actions .nav-login {
        padding: 0.58rem 0.62rem !important;
        border-radius: 999px !important;
        font-size: 0.88rem !important;
        background: transparent !important;
      }

      .site-header .header-actions .nav-login:hover,
      .site-header .mobile-actions .nav-login:hover {
        background: rgba(255, 255, 255, 0.07) !important;
        color: #2f86ff !important;
      }

      .site-header .nav-cta,
      .site-header.is-scrolled .nav-cta {
        min-height: 2.42rem !important;
        padding: 0.58rem 1rem !important;
        background: linear-gradient(135deg, #2f86ff, #0b6fff) !important;
        box-shadow: 0 10px 22px rgba(11, 111, 255, 0.22) !important;
      }

      .site-header .nav-cta:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 14px 28px rgba(11, 111, 255, 0.3) !important;
      }

      .site-header .nav-dropdown__menu {
        top: calc(100% + 0.72rem) !important;
        padding: 0.55rem !important;
        border-color: rgba(255, 255, 255, 0.12) !important;
        border-radius: 1.1rem !important;
        background: rgba(8, 15, 26, 0.94) !important;
        box-shadow:
          0 24px 60px rgba(0, 0, 0, 0.34),
          inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
        backdrop-filter: blur(22px) !important;
        -webkit-backdrop-filter: blur(22px) !important;
        transform: translateX(-50%) translateY(0.8rem) scale(0.97) !important;
        transition:
          opacity 220ms cubic-bezier(0.16, 1, 0.3, 1),
          transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
          visibility 220ms !important;
      }

      .site-header .nav-dropdown:hover .nav-dropdown__menu,
      .site-header .nav-dropdown[open] .nav-dropdown__menu {
        transform: translateX(-50%) translateY(0) scale(1) !important;
      }

      @media (min-width: 821px) {
        .site-header .nav-dropdown__menu.nav-dropdown__menu--mega {
          top: calc(100% + 0.78rem) !important;
          width: var(--mega-menu-header-width, min(calc(100vw - clamp(1rem, 3vw, 3rem)), min(var(--max-width, 1200px), 1480px))) !important;
          min-width: 0 !important;
          max-width: none !important;
          padding: 0.65rem !important;
          border-color: rgba(255, 255, 255, 0.14) !important;
          border-radius: 1.45rem !important;
          background:
            radial-gradient(circle at 18% 12%, rgba(47, 134, 255, 0.12), transparent 30%),
            radial-gradient(circle at 86% 18%, rgba(22, 183, 255, 0.1), transparent 32%),
            rgba(8, 15, 26, 0.96) !important;
          box-shadow:
            0 28px 70px rgba(0, 0, 0, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
          transform: translateX(calc(-50% + var(--mega-menu-shift-x, 0px))) translateY(0.95rem) scale(0.97) !important;
        }

        .site-header .nav-dropdown:hover .nav-dropdown__menu--mega,
        .site-header .nav-dropdown[open] .nav-dropdown__menu--mega {
          transform: translateX(calc(-50% + var(--mega-menu-shift-x, 0px))) translateY(0) scale(1) !important;
        }

        .site-header .mega-menu--solutions {
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 0.75rem !important;
        }

        .site-header .mega-menu--resources {
          grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(280px, 0.85fr) !important;
          gap: 0.75rem !important;
        }
      }

      .site-header .mega-menu {
        display: grid !important;
        gap: 0.65rem !important;
      }

      .site-header .mega-menu__feature,
      .site-header .mega-menu__column {
        border: 1px solid rgba(255, 255, 255, 0.09) !important;
        border-radius: 1.05rem !important;
        background: rgba(255, 255, 255, 0.055) !important;
      }

      .site-header .mega-menu__column {
        display: grid !important;
        align-content: start !important;
        gap: 0.35rem !important;
        padding: 0.65rem !important;
      }

      .site-header .mega-menu__feature {
        position: relative !important;
        min-height: 100% !important;
        padding: 1rem !important;
        display: grid !important;
        align-content: end !important;
        gap: 0.55rem !important;
        overflow: hidden !important;
      }

      .site-header .mega-menu__feature::before {
        content: "" !important;
        position: absolute !important;
        inset: auto -30% -35% 18% !important;
        height: 11rem !important;
        border-radius: 999px !important;
        background: radial-gradient(circle, rgba(47, 134, 255, 0.22), transparent 68%) !important;
      }

      .site-header .mega-menu__feature > * {
        position: relative !important;
        z-index: 1 !important;
      }

      .site-header .mega-menu__heading {
        padding: 0.35rem 0.35rem 0.2rem !important;
        color: rgba(47, 134, 255, 0.88) !important;
        font-size: 0.72rem !important;
        font-weight: 900 !important;
        letter-spacing: 0.08em !important;
        text-transform: uppercase !important;
      }

      .site-header .nav-dropdown__menu--mega .mega-menu__column a {
        display: grid !important;
        grid-template-columns: 2rem minmax(0, 1fr) !important;
        gap: 0.68rem !important;
        align-items: center !important;
        padding: 0.72rem !important;
        border-radius: 0.9rem !important;
        transition: background 180ms ease, transform 180ms ease !important;
      }

      .site-header .nav-dropdown__menu--mega .mega-menu__column a:hover,
      .site-header .nav-dropdown__menu--mega .mega-menu__column a.is-active {
        transform: translateY(-1px) !important;
        background: rgba(255, 255, 255, 0.08) !important;
      }

      .site-header .dropdown-item-icon,
      .site-header .nav-dropdown__menu--mega .dropdown-item-icon {
        width: 2rem !important;
        height: 2rem !important;
        display: inline-grid !important;
        place-items: center !important;
        border: 0 !important;
        border-radius: 0.75rem !important;
        background: rgba(47, 134, 255, 0.12) !important;
        color: #2f86ff !important;
        font-size: 0.65rem !important;
        font-weight: 900 !important;
        letter-spacing: 0 !important;
        box-shadow: inset 0 0 0 1px rgba(47, 134, 255, 0.12) !important;
      }

      @media (max-width: 1080px) {
        .site-header .site-nav {
          gap: 0.05rem !important;
        }

        .site-header .site-nav > a:not(.button),
        .site-header .nav-dropdown__toggle {
          padding-inline: 0.58rem !important;
          font-size: 0.84rem !important;
        }
      }

      @media (max-width: 820px) {
        :root {
          --site-header-shell-height: 4.25rem;
          --header-float-offset: 0rem;
        }

        [data-site-header] {
          min-height: var(--site-header-shell-height) !important;
        }

        .site-header,
        .site-header.is-scrolled {
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          min-height: var(--site-header-shell-height) !important;
          padding: 0.62rem 0.9rem !important;
          grid-template-columns: auto auto !important;
          border-width: 0 0 1px !important;
          border-radius: 0 !important;
          background: rgba(10, 18, 32, 0.96) !important;
          transform: translateY(0) !important;
          animation: headerDropMobile 520ms cubic-bezier(0.16, 1, 0.3, 1) both !important;
        }

        .site-header.is-hidden:not(.is-open) {
          transform: translateY(-100%) !important;
        }

        .site-header .nav-toggle {
          display: inline-grid !important;
          flex: 0 0 2.7rem !important;
          margin-left: auto !important;
        }

        .site-header .site-nav {
          top: calc(100% + 0.55rem) !important;
          right: 0.75rem !important;
          left: 0.75rem !important;
          width: auto !important;
          padding: 0.65rem !important;
          gap: 0.35rem !important;
          border-radius: 1.2rem !important;
          background: rgba(8, 15, 26, 0.96) !important;
          box-shadow: 0 22px 50px rgba(0, 0, 0, 0.34) !important;
          backdrop-filter: blur(22px) !important;
          -webkit-backdrop-filter: blur(22px) !important;
          transform: translateY(-0.5rem) scale(0.98) !important;
          transform-origin: top center !important;
        }

        .site-header.is-open .site-nav {
          transform: translateY(0) scale(1) !important;
        }

        .site-header .site-nav > a:not(.button),
        .site-header .nav-dropdown__toggle {
          min-height: 2.6rem !important;
          width: 100% !important;
          justify-content: space-between !important;
          padding: 0.82rem 0.9rem !important;
          border-radius: 0.9rem !important;
          background: rgba(255, 255, 255, 0.055) !important;
          font-size: 0.94rem !important;
        }

        .site-header .nav-dropdown__menu,
        .site-header .nav-dropdown:hover .nav-dropdown__menu,
        .site-header .nav-dropdown[open] .nav-dropdown__menu {
          position: static !important;
          width: 100% !important;
          min-width: 0 !important;
          max-width: none !important;
          margin-top: 0.42rem !important;
          padding: 0.38rem !important;
          border-radius: 0.9rem !important;
          background: rgba(255, 255, 255, 0.045) !important;
          opacity: 1 !important;
          visibility: visible !important;
          transform: none !important;
        }

        .site-header .mega-menu,
        .site-header .mega-menu--solutions,
        .site-header .mega-menu--resources {
          grid-template-columns: 1fr !important;
        }
      }

      /* Header Keyframe Animations */
      @keyframes headerDropDesktop {
        from {
          opacity: 0 !important;
          transform: translateX(-50%) translateY(-110%) scale(0.98) !important;
        }
        to {
          opacity: 1 !important;
          transform: translateX(-50%) translateY(0) scale(1) !important;
        }
      }

      @keyframes headerDropMobile {
        from {
          opacity: 0 !important;
          transform: translateY(-100%) !important;
        }
        to {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      }

      .whatsapp-connect-widget {
        position: fixed;
        right: clamp(1rem, 2.5vw, 1.6rem);
        bottom: clamp(1rem, 2.5vw, 1.6rem);
        z-index: 70;
        font-family: "Manrope", "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .whatsapp-connect-widget.is-open .whatsapp-connect-panel {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateY(0) scale(1);
      }

      .whatsapp-connect-button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.65rem;
        min-height: 3.65rem;
        padding: 0.8rem 1.1rem;
        border: 0;
        border-radius: 999px;
        background: linear-gradient(135deg, #25da7b, #14c76d);
        color: #ffffff;
        font-weight: 900;
        font-size: 0.94rem;
        line-height: 1;
        box-shadow: 0 18px 42px rgba(20, 199, 109, 0.34);
        transition: transform 180ms ease, box-shadow 180ms ease;
      }

      .whatsapp-connect-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 24px 52px rgba(20, 199, 109, 0.42);
      }

      .whatsapp-connect-button__icon {
        display: grid;
        place-items: center;
        width: 2.1rem;
        height: 2.1rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.18);
      }

      .whatsapp-connect-button__icon img {
        width: 1.25rem;
        height: 1.25rem;
        object-fit: contain;
        filter: brightness(0) invert(1);
      }

      .whatsapp-connect-panel {
        position: absolute;
        right: 0;
        bottom: calc(100% + 0.9rem);
        width: min(calc(100vw - 2rem), 380px);
        overflow: hidden;
        border: 1px solid rgba(19, 54, 41, 0.12);
        border-radius: 1.35rem;
        background: #f0f4ef;
        box-shadow: 0 28px 70px rgba(8, 13, 24, 0.24);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translateY(12px) scale(0.97);
        transform-origin: right bottom;
        transition:
          opacity 220ms ease,
          visibility 220ms ease,
          transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .whatsapp-connect-panel__header {
        display: flex;
        align-items: center;
        gap: 0.78rem;
        padding: 0.95rem 1rem;
        background: #075e54;
        color: #ffffff;
      }

      .whatsapp-connect-panel__avatar {
        display: grid;
        place-items: center;
        width: 2.65rem;
        height: 2.65rem;
        overflow: hidden;
        border: 2px solid rgba(255, 255, 255, 0.26);
        border-radius: 999px;
        background: #ffffff;
      }

      .whatsapp-connect-panel__avatar img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        padding: 0.14rem;
      }

      .whatsapp-connect-panel__identity {
        min-width: 0;
        flex: 1 1 auto;
      }

      .whatsapp-connect-panel__identity strong {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        color: #ffffff;
        font-size: 0.98rem;
        line-height: 1.18;
      }

      .whatsapp-connect-panel__identity span {
        display: block;
        margin-top: 0.18rem;
        color: rgba(255, 255, 255, 0.78);
        font-size: 0.78rem;
        font-weight: 700;
      }

      .whatsapp-verified-badge {
        display: inline-grid;
        place-items: center;
        flex: 0 0 auto;
        width: 1rem;
        height: 1rem;
        border-radius: 999px;
        background: #168aff;
      }

      .whatsapp-verified-badge svg {
        width: 0.68rem;
        height: 0.68rem;
        stroke: #ffffff;
        stroke-width: 3;
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .whatsapp-connect-panel__close {
        display: grid;
        place-items: center;
        flex: 0 0 2rem;
        width: 2rem;
        height: 2rem;
        border: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
        font-size: 1.25rem;
        line-height: 1;
      }

      .whatsapp-chat-surface {
        display: grid;
        gap: 0.7rem;
        min-height: 300px;
        padding: 1rem;
        background:
          linear-gradient(rgba(240, 244, 239, 0.82), rgba(240, 244, 239, 0.82)),
          radial-gradient(circle at 18% 18%, rgba(37, 218, 123, 0.18), transparent 13rem);
      }

      .whatsapp-message {
        width: fit-content;
        max-width: 88%;
        padding: 0.68rem 0.78rem;
        border-radius: 0.88rem;
        color: #1f2d24;
        font-size: 0.9rem;
        line-height: 1.45;
        box-shadow: 0 8px 18px rgba(19, 54, 41, 0.08);
      }

      .whatsapp-message--received {
        justify-self: start;
        border-top-left-radius: 0.24rem;
        background: #ffffff;
      }

      .whatsapp-message--sent {
        justify-self: end;
        border-top-right-radius: 0.24rem;
        background: #dcf8c6;
      }

      .whatsapp-message small {
        display: block;
        margin-top: 0.28rem;
        color: rgba(31, 45, 36, 0.52);
        font-size: 0.68rem;
        text-align: right;
      }

      .whatsapp-connect-form {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 2.8rem;
        gap: 0.55rem;
        padding: 0.75rem;
        background: #f8fbfa;
        border-top: 1px solid rgba(19, 54, 41, 0.09);
      }

      .whatsapp-connect-form input {
        width: 100%;
        min-height: 2.8rem;
        padding: 0.75rem 0.92rem;
        border: 1px solid rgba(19, 54, 41, 0.1);
        border-radius: 999px;
        background: #ffffff;
        color: #13241d;
        font: inherit;
        outline: none;
      }

      .whatsapp-connect-form input:focus {
        border-color: rgba(24, 191, 99, 0.54);
        box-shadow: 0 0 0 4px rgba(24, 191, 99, 0.12);
      }

      .whatsapp-connect-form button {
        display: grid;
        place-items: center;
        width: 2.8rem;
        min-height: 2.8rem;
        border: 0;
        border-radius: 999px;
        background: #25da7b;
        color: #ffffff;
        box-shadow: 0 10px 22px rgba(20, 199, 109, 0.26);
      }

      .whatsapp-connect-form button svg {
        width: 1.15rem;
        height: 1.15rem;
        fill: currentColor;
      }

      @media (max-width: 560px) {
        .whatsapp-connect-widget {
          right: 0.85rem;
          bottom: 0.85rem;
        }

        .whatsapp-connect-button {
          min-height: 3.25rem;
          padding: 0.65rem;
          border-radius: 999px;
        }

        .whatsapp-connect-button__text {
          display: none;
        }

        .whatsapp-connect-button__icon {
          width: 2rem;
          height: 2rem;
        }

        .whatsapp-connect-panel {
          width: calc(100vw - 1.7rem);
          bottom: calc(100% + 0.7rem);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function injectFooterStyles() {
    if (document.getElementById("connektly-footer-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "connektly-footer-styles";
    style.textContent = `
      .site-footer.custom-footer {
        width: 100%;
        max-width: none;
        margin: 0;
        padding: 5rem max(1.25rem, calc((100vw - var(--max-width, 1400px)) / 2)) 2rem;
        border: none;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 0;
        background-color: #0b1120;
        box-shadow: none;
        font-family: "Manrope", "Inter", system-ui, sans-serif;
        box-sizing: border-box;
      }

      .site-footer.custom-footer *,
      .site-footer.custom-footer *::before,
      .site-footer.custom-footer *::after {
        box-sizing: border-box;
      }

      .custom-footer .footer-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr 1fr !important;
        gap: 3rem;
        padding-bottom: 3rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .custom-footer .footer-brand-col {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 1.25rem;
      }

      .custom-footer .footer-brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
      }

      .custom-footer .footer-brand-logo {
        flex-shrink: 0;
      }

      .custom-footer .footer-brand-text {
        color: #ffffff;
        font-size: 1.35rem;
        font-weight: 700;
      }

      .custom-footer .footer-desc,
      .custom-footer .footer-copy,
      .custom-footer .footer-nav-col ul li a,
      .custom-footer .footer-legal li a {
        color: #94a3b8;
        font-size: 0.95rem;
        line-height: 1.6;
      }

      .custom-footer .footer-desc {
        max-width: 320px;
        margin: 0;
        text-align: left;
      }

      .custom-footer .footer-socials,
      .custom-footer .footer-bottom-flex,
      .custom-footer .footer-legal {
        display: flex;
        align-items: center;
      }

      .custom-footer .footer-socials {
        gap: 1.25rem;
        margin-top: 0.5rem;
      }

      .custom-footer .social-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
        transition: opacity 200ms;
      }

      .custom-footer .social-icon:hover {
        opacity: 1;
      }

      .custom-footer .social-icon img {
        width: 100%;
        height: auto;
      }

      .custom-footer .footer-nav-col h3 {
        margin: 0 0 1.25rem;
        color: #ffffff;
        font-size: 1.05rem;
        font-weight: 700;
      }

      .custom-footer .footer-nav-col ul,
      .custom-footer .footer-legal {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .custom-footer .footer-nav-col ul {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .custom-footer .footer-nav-col ul li a,
      .custom-footer .footer-legal li a {
        transition: color 200ms;
        text-decoration: none;
      }

      .custom-footer .footer-nav-col ul li a:hover,
      .custom-footer .footer-legal li a:hover {
        color: #ffffff;
      }

      .custom-footer .footer-bottom {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        margin: 2rem auto 0;
      }

      .custom-footer .footer-bottom-flex {
        justify-content: space-between;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 1.5rem;
      }

      .custom-footer .footer-copy {
        margin: 0;
      }

      .custom-footer .footer-legal {
        gap: 1.5rem;
      }

      .custom-footer .footer-disclaimer {
        margin: 0;
        color: #475569;
        font-size: 0.85rem;
        line-height: 1.5;
        text-align: left;
      }

      @media (max-width: 1080px) {
        .custom-footer .footer-grid {
          grid-template-columns: 1fr 1fr;
          gap: 3rem 2rem;
        }
      }

      @media (max-width: 600px) {
        .custom-footer .footer-grid {
          grid-template-columns: 1fr;
        }

        .custom-footer .footer-bottom-flex {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderHeader() {
    const mount = document.querySelector("[data-site-header]");

    if (!mount) {
      return;
    }

    mount.innerHTML = `
      <header class="site-header">
        <a class="brand" href="/" aria-label="Connektly home">
          <span class="brand__mark brand__mark--image"><img src="${fromRoot("logo.svg")}" alt="" /></span>
          <span class="brand__text"><strong>Connektly</strong></span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Toggle navigation">
          <span></span><span></span>
        </button>
        <nav class="site-nav" id="site-nav" aria-label="Primary">
          <a href="/">Home</a>
          <div class="nav-dropdown">
            <button class="nav-dropdown__toggle" type="button" aria-expanded="false">Product</button>
            <div class="nav-dropdown__menu nav-dropdown__menu--mega nav-dropdown__menu--solutions">
              <div class="mega-menu mega-menu--solutions">
                <div class="mega-menu__column">
                  <span class="mega-menu__heading">Channels</span>
                  <a href="/product/whatsapp/index.html">
                    <span class="dropdown-item-icon" style="padding: 4px;"><img src="${fromRoot("Social Media Icons/WhatsApp.svg")}" style="width: 100%; height: 100%; object-fit: contain;" alt="WhatsApp" /></span>
                    <span>
                      <span class="dropdown-item-label">WhatsApp Business</span>
                    </span>
                  </a>
                  <a href="/product/messenger/index.html">
                    <span class="dropdown-item-icon" style="padding: 4px;"><img src="${fromRoot("Social Media Icons/Messenger.svg")}" style="width: 100%; height: 100%; object-fit: contain;" alt="Messenger" /></span>
                    <span>
                      <span class="dropdown-item-label">Messenger</span>
                    </span>
                  </a>
                  <a href="/product/instagram/index.html">
                    <span class="dropdown-item-icon" style="padding: 4px;"><img src="${fromRoot("Social Media Icons/Instagram.png")}" style="width: 100%; height: 100%; object-fit: contain;" alt="Instagram" /></span>
                    <span>
                      <span class="dropdown-item-label">Instagram</span>
                    </span>
                  </a>
                </div>
                <div class="mega-menu__column">
                  <span class="mega-menu__heading">Features</span>
                  <a href="/whatsapp-business-calling-api/">
                    <span class="dropdown-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></span>
                    <span>
                      <span class="dropdown-item-label">WhatsApp Business Calling API</span>
                    </span>
                  </a>
                  <a href="/product/whatsapp/index.html"">
                    <span class="dropdown-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg></span>
                    <span>
                      <span class="dropdown-item-label">Broadcast Campaigns</span>
                    </span>
                  </a>
                  <a href="/product/whatsapp/index.html"">
                    <span class="dropdown-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg></span>
                    <span>
                      <span class="dropdown-item-label">Team Inbox</span>
                    </span>
                  </a>
                  <a href="/product/whatsapp/index.html"">
                    <span class="dropdown-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></span>
                    <span>
                      <span class="dropdown-item-label">Automation Builder</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <a href="/pricing/index.html">Pricing</a>
          <div class="nav-dropdown">
            <button class="nav-dropdown__toggle" type="button" aria-expanded="false">Resources</button>
            <div class="nav-dropdown__menu nav-dropdown__menu--mega nav-dropdown__menu--resources">
                                          <div class="mega-menu mega-menu--resources">
                <div class="mega-menu__column">
                  <span class="mega-menu__heading">Legal</span>
                  <a href="/privacy-policy/index.html">
                    <span class="dropdown-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></span>
                    <span>
                      <span class="dropdown-item-label">Privacy Policy</span>
                    </span>
                  </a>
                  <a href="/terms-of-service/index.html">
                    <span class="dropdown-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></span>
                    <span>
                      <span class="dropdown-item-label">Terms of Use</span>
                    </span>
                  </a>
                  <a href="/data-deletion/index.html">
                    <span class="dropdown-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6V20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></span>
                    <span>
                      <span class="dropdown-item-label">Data Deletion</span>
                    </span>
                  </a>
                </div>
                <div class="mega-menu__column">
                  <span class="mega-menu__heading">Learn</span>
                  <a href="/help">
                    <span class="dropdown-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line></svg></span>
                    <span>
                      <span class="dropdown-item-label">Help Centre</span>
                    </span>
                  </a>
                  <a href="/contact/index.html">
                    <span class="dropdown-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><text x="12" y="18" font-size="8" font-family="system-ui" font-weight="900" text-anchor="middle" fill="currentColor">24</text></svg></span>
                    <span>
                      <span class="dropdown-item-label">Contact Us</span>
                    </span>
                  </a>
                </div>
                <div class="mega-menu__column">
                  <span class="mega-menu__heading">Explore</span>
                  <a href="/blogs">
                    <span class="dropdown-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg></span>
                    <span>
                      <span class="dropdown-item-label">Blogs</span>
                    </span>
                  </a>
                  <a href="/help">
                    <span class="dropdown-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg></span>
                    <span>
                      <span class="dropdown-item-label">Video Guides</span>
                    </span>
                  </a>
                  <a href="/help">
                    <span class="dropdown-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></span>
                    <span>
                      <span class="dropdown-item-label">eBooks</span>
                    </span>
                  </a>
                </div>
                <a class="mega-menu__feature" href="/partners">
                  <div>
                    <div class="mega-menu__feature-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><circle cx="12" cy="11" r="3"></circle><path d="m9 17 2-1.5 2 1.5"></path></svg>
                    </div>
                    <h4 class="mega-menu__feature-heading">Partner with us</h4>
                  </div>
                  <span class="mega-menu__feature-link">
                    Explore Our Partner Program
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </span>
                </a>
              </div>
            </div>
          </div>
          <div class="mobile-actions">
            <a class="nav-login" href="https://app.connektly.in/login" target="_blank" rel="noopener noreferrer">Login</a>
            <a class="button button--sm nav-cta" href="https://app.connektly.in/signup" target="_blank" rel="noopener noreferrer">Get Started</a>
          </div>
        </nav>
        <div class="header-actions">
          <a class="nav-login" href="https://app.connektly.in/login" target="_blank" rel="noopener noreferrer">Login</a>
          <a class="button button--sm nav-cta" href="https://app.connektly.in/signup" target="_blank" rel="noopener noreferrer">Get Started</a>
        </div>
      </header>
    `;

    normalizeComponentLinks(mount);
  }

  function renderFooter() {
    const mount = document.querySelector("[data-site-footer]");

    if (!mount) {
      return;
    }

    mount.innerHTML = `
      <footer class="site-footer custom-footer">
        <div class="footer-grid">
          <div class="footer-brand-col">
            <a class="footer-brand" href="/">
              <img class="footer-brand-logo" src="https://connektly.in/logo.svg" alt="Connektly" width="48" height="48" />
              <span class="footer-brand-text">Connektly</span>
            </a>
             <div class="footer-meta-partner" style="margin-top: 0.25rem;">
              <img src="https://res.cloudinary.com/dqhdmvyeh/image/upload/c_limit,w_1200/f_webp/q_80/v1/website-images/en/0-common/logos/meta_business?_a=BAVAaqB00" alt="Meta Business Partner" style="height: 38px; width: auto; object-fit: contain; opacity: 0.9; transition: opacity 200ms ease;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.9" />
            </div>
            <p class="footer-desc">The modern infrastructure for WhatsApp Cloud API. Build better conversational experiences faster.</p>
            <div class="footer-socials">
              <a href="https://www.instagram.com/connektlyy/" aria-label="Instagram" target="_blank" rel="noopener noreferrer" class="social-icon"><img src="${fromRoot("Social Media Icons/Instagram.png")}" alt="Instagram" /></a>
              <a href="https://www.facebook.com/connektly" aria-label="Facebook" target="_blank" rel="noopener noreferrer" class="social-icon"><img src="${fromRoot("Social Media Icons/Facebook.svg")}" alt="Facebook" /></a>
              <a href="https://wa.me/12899070610" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer" class="social-icon"><img src="${fromRoot("Social Media Icons/WhatsApp.svg")}" alt="WhatsApp" /></a>
            </div>
            
          </div>
          <div class="footer-nav-col"><h3>Product</h3><ul>
            <li><a href="/features/index.html">Features</a></li>
            <li><a href="/pricing/index.html">Pricing</a></li>
            <li><a href="/product/whatsapp/index.html"">Unified Inbox</a></li>
            <li><a href="/product/whatsapp/index.html"">WhatsApp Business API</a></li>
          </ul></div>
          <div class="footer-nav-col"><h3>Resources</h3><ul>
            <li><a href="/faq/index.html">FAQ</a></li>
            <li><a href="/blogs">Blogs</a></li>
            <li><a href="/help">Help Center</a></li>
          </ul></div>
          <div class="footer-nav-col"><h3>Legal</h3><ul>
            <li><a href="/privacy-policy/index.html">Privacy Policy</a></li>
            <li><a href="/terms-of-service/index.html">Terms of Service</a></li>
            <li><a href="/data-deletion/index.html">Data Deletion</a></li>
          </ul></div>
          <div class="footer-nav-col"><h3>Company</h3><ul>
            <li><a href="/">Home</a></li>
            <li><a href="/contact/index.html">Contact Us</a></li>
            <li><a href="/partners/">Partner With Us</a></li>
            <li><a href="https://app.connektly.in/login" target="_blank" rel="noopener noreferrer">Login</a></li>
            <li><a href="https://app.connektly.in/signup" target="_blank" rel="noopener noreferrer">Get Started</a></li>
          </ul></div>
        </div>
        <div class="footer-bottom">
          <div class="footer-bottom-flex" style="justify-content: center !important; text-align: center !important;">
            <p class="footer-copy" style="text-align: center !important; width: 100% !important; margin: 0 !important;">&copy; 2026 Connektly. All rights reserved.</p>
          </div>
          <p class="footer-disclaimer" style="text-align: center !important; color: #ffffff !important; opacity: 0.8 !important; margin: 0.5rem 0 0 !important; font-size: 0.82rem !important; line-height: 1.6 !important;">WhatsApp is a trademark of WhatsApp LLC. Connektly is an independent provider and is not affiliated with, associated with, or endorsed by WhatsApp LLC or Meta Platforms Inc.</p>
        </div>
      </footer>
    `;

    normalizeComponentLinks(mount);
  }

  function renderWhatsAppWidget() {
    if (document.querySelector("[data-whatsapp-connect-widget]")) {
      return;
    }

    const widget = document.createElement("div");
    widget.className = "whatsapp-connect-widget";
    widget.dataset.whatsappConnectWidget = "true";
    widget.innerHTML = `
      <div class="whatsapp-connect-panel" id="whatsapp-connect-panel" role="dialog" aria-modal="false" aria-labelledby="whatsapp-connect-title">
        <div class="whatsapp-connect-panel__header">
          <span class="whatsapp-connect-panel__avatar" aria-hidden="true">
            <img src="${fromRoot("logo.svg")}" alt="" />
          </span>
          <span class="whatsapp-connect-panel__identity">
            <strong id="whatsapp-connect-title">
              Connektly Solutions Pvt Ltd
              <span class="whatsapp-verified-badge" aria-label="Meta verified">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4 4L19 7" /></svg>
              </span>
            </strong>
            <span>Typically replies instantly</span>
          </span>
          <button class="whatsapp-connect-panel__close" type="button" data-whatsapp-connect-close aria-label="Close WhatsApp chat">&times;</button>
        </div>
        <div class="whatsapp-chat-surface" aria-label="WhatsApp chat preview">
          <div class="whatsapp-message whatsapp-message--received">
            Hi, welcome to Connektly Solutions Pvt Ltd. How can we help you today?
            <small>now</small>
          </div>
          <div class="whatsapp-message whatsapp-message--sent">
            I want to know more about Connektly.
            <small>now</small>
          </div>
          <div class="whatsapp-message whatsapp-message--received">
            Send us a message and we will open WhatsApp so our team can continue the conversation.
            <small>now</small>
          </div>
        </div>
        <form class="whatsapp-connect-form" data-whatsapp-connect-form>
          <input type="text" name="message" aria-label="WhatsApp message" placeholder="Type your message" autocomplete="off" />
          <button type="submit" aria-label="Send message on WhatsApp">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.4 20.4 21.2 12 3.4 3.6 3 10.2l10.1 1.8L3 13.8l.4 6.6z" /></svg>
          </button>
        </form>
      </div>
      <button class="whatsapp-connect-button" type="button" data-whatsapp-connect-toggle aria-expanded="false" aria-controls="whatsapp-connect-panel">
        <span class="whatsapp-connect-button__icon" aria-hidden="true"><img src="${fromRoot("assets/whatsapp.svg")}" alt="" /></span>
        <span class="whatsapp-connect-button__text">Connect on WhatsApp</span>
      </button>
    `;

    document.body.appendChild(widget);
  }

  function normalizePathname(pathname) {
    const rawPath = pathname || "/";
    let normalized = rawPath.split("?")[0].split("#")[0] || "/";

    normalized = normalized.replace(/\/index\.html$/i, "/");
    normalized = normalized.replace(/\.html$/i, "");

    if (!normalized.startsWith("/")) {
      normalized = `/${normalized}`;
    }

    if (normalized.length > 1) {
      normalized = normalized.replace(/\/+$/, "");
    }

    return normalized || "/";
  }

  function setActiveNavLink() {
    const currentPath = normalizePathname(window.location.pathname);
    const navLinks = document.querySelectorAll(".site-nav a");
    const navDropdowns = document.querySelectorAll(".nav-dropdown");

    navLinks.forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");

      const linkUrl = new URL(link.href, window.location.href);

      if (normalizePathname(linkUrl.pathname) === currentPath) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });

    navDropdowns.forEach((dropdown) => {
      const hasActiveChild = dropdown.querySelector("a.is-active");
      dropdown.classList.toggle("nav-dropdown--current", Boolean(hasActiveChild));
    });
  }

  function closeNavDropdown(dropdown) {
    dropdown.removeAttribute("open");
    const toggle = dropdown.querySelector(".nav-dropdown__toggle");

    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }

    delete dropdown.dataset.pinned;
  }

  function openNavDropdown(dropdown, options = {}) {
    const navDropdowns = document.querySelectorAll(".nav-dropdown");

    updateMegaMenuMeasurements();

    navDropdowns.forEach((entry) => {
      if (entry !== dropdown) {
        closeNavDropdown(entry);
      }
    });

    dropdown.setAttribute("open", "");
    const toggle = dropdown.querySelector(".nav-dropdown__toggle");

    if (toggle) {
      toggle.setAttribute("aria-expanded", "true");
    }

    if (options.pinned) {
      dropdown.dataset.pinned = "true";
    }
  }

  function closeAllNavDropdowns() {
    document.querySelectorAll(".nav-dropdown").forEach((dropdown) => closeNavDropdown(dropdown));
  }

  function updateMegaMenuMeasurements() {
    const header = document.querySelector("\.site-header");
    document.documentElement.style.setProperty('--scroll-y', window.scrollY + 'px');

    if (!header || window.matchMedia("(max-width: 820px)").matches) {
      return;
    }

    const headerRect = header.getBoundingClientRect();
    const headerCenter = headerRect.left + headerRect.width / 2;

    document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
      const menu = dropdown.querySelector(".nav-dropdown__menu--mega");

      if (!menu) {
        return;
      }

      const dropdownRect = dropdown.getBoundingClientRect();
      const dropdownCenter = dropdownRect.left + dropdownRect.width / 2;

      menu.style.setProperty("--mega-menu-header-width", `${headerRect.width}px`);
      menu.style.setProperty("--mega-menu-shift-x", `${headerCenter - dropdownCenter}px`);
    });
  }

  function isMobileNavigation() {
    return window.matchMedia("(max-width: 820px)").matches;
  }

  function supportsDesktopHover() {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  function toggleMenu(forceState) {
    const header = document.querySelector(".site-header");
    document.documentElement.style.setProperty('--scroll-y', window.scrollY + 'px');
    const navToggle = document.querySelector(".nav-toggle");

    if (!header || !navToggle) {
      return;
    }

    const shouldOpen =
      typeof forceState === "boolean" ? forceState : !header.classList.contains("is-open");

    header.classList.toggle("is-open", shouldOpen);
    navToggle.setAttribute("aria-expanded", String(shouldOpen));
    document.documentElement.classList.toggle(
      "mobile-nav-open",
      shouldOpen && isMobileNavigation()
    );

    if (shouldOpen) {
      header.classList.remove("is-hidden");
    }

    if (!shouldOpen) {
      closeAllNavDropdowns();
    }
  }

  function updateHeaderScrollState() {
    const header = document.querySelector(".site-header");
    document.documentElement.style.setProperty('--scroll-y', window.scrollY + 'px');

    if (!header) {
      return;
    }

    const currentY = Math.max(window.scrollY || 0, 0);

      if (currentY > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
      header.classList.remove('is-hidden');

      lastHeaderScrollY = currentY;
    headerScrollInitialized = true;
  }

  function requestHeaderScrollStateUpdate() {
    if (headerScrollFrameId) {
      return;
    }

    headerScrollFrameId = window.requestAnimationFrame(() => {
      headerScrollFrameId = 0;
      updateHeaderScrollState();
    });
  }

  function bindWhatsAppWidgetInteractions() {
    const widget = document.querySelector("[data-whatsapp-connect-widget]");

    if (!widget || widget.dataset.whatsappBound === "true") {
      return;
    }

    const toggle = widget.querySelector("[data-whatsapp-connect-toggle]");
    const closeButton = widget.querySelector("[data-whatsapp-connect-close]");
    const form = widget.querySelector("[data-whatsapp-connect-form]");
    const input = form ? form.querySelector("input") : null;
    const whatsAppUrl = "https://wa.me/919953321314";

    widget.dataset.whatsappBound = "true";

    function setWidgetOpen(shouldOpen) {
      widget.classList.toggle("is-open", shouldOpen);

      if (toggle) {
        toggle.setAttribute("aria-expanded", String(shouldOpen));
      }

      if (shouldOpen && input) {
        window.setTimeout(() => input.focus({ preventScroll: true }), 120);
      }
    }

    if (toggle) {
      toggle.addEventListener("click", () => {
        setWidgetOpen(!widget.classList.contains("is-open"));
      });
    }

    if (closeButton) {
      closeButton.addEventListener("click", () => setWidgetOpen(false));
    }

    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        window.location.href = '/thank-you/';
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && widget.classList.contains("is-open")) {
        setWidgetOpen(false);
      }
    });

    document.addEventListener("click", (event) => {
      const target = event.target;

      if (target instanceof Element && !target.closest("[data-whatsapp-connect-widget]")) {
        setWidgetOpen(false);
      }
    });
  }

  function bindHeaderInteractions() {
    const header = document.querySelector(".site-header");
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelectorAll(".site-nav a");
    const navDropdowns = document.querySelectorAll(".nav-dropdown");

    if (!header || header.dataset.headerBound === "true") {
      return;
    }

    header.dataset.headerBound = "true";

    if (navToggle) {
      navToggle.addEventListener("click", () => toggleMenu());
    }

    navLinks.forEach((link) => {
      link.addEventListener("click", () => toggleMenu(false));
    });

    navDropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector(".nav-dropdown__toggle");

      if (toggle) {
        toggle.addEventListener("click", (event) => {
          event.preventDefault();

          if (dropdown.dataset.pinned === "true") {
            closeNavDropdown(dropdown);
            return;
          }

          openNavDropdown(dropdown, { pinned: true });
        });
      }

      dropdown.addEventListener("mouseenter", () => {
        if (isMobileNavigation() || !supportsDesktopHover()) {
          return;
        }

        openNavDropdown(dropdown);
      });

      dropdown.addEventListener("mouseleave", () => {
        if (isMobileNavigation() || !supportsDesktopHover()) {
          return;
        }

        if (dropdown.dataset.pinned === "true") {
          return;
        }

        closeNavDropdown(dropdown);
      });
    });

    if (document.documentElement.dataset.globalNavClickBound !== "true") {
      document.documentElement.dataset.globalNavClickBound = "true";

      document.addEventListener("click", (event) => {
        const target = event.target;

        if (target instanceof Element && !target.closest(".nav-dropdown")) {
          closeAllNavDropdowns();
        }

        if (
          target instanceof Element &&
          isMobileNavigation() &&
          header.classList.contains("is-open") &&
          !target.closest(".site-header")
        ) {
          toggleMenu(false);
        }
      });

      window.addEventListener("scroll", requestHeaderScrollStateUpdate, { passive: true });
      window.addEventListener("resize", () => {
        updateMegaMenuMeasurements();

        if (!isMobileNavigation()) {
          document.documentElement.classList.remove("mobile-nav-open");
          toggleMenu(false);
        }
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          toggleMenu(false);
          closeAllNavDropdowns();
        }
      });
    }

    updateMegaMenuMeasurements();
    updateHeaderScrollState();
  }

  function injectSocialBarStyles() {
    if (document.getElementById("connektly-social-bar-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "connektly-social-bar-styles";
    style.textContent = `
      /* Sticky Social Bar */
      .sticky-social-bar {
        position: fixed;
        top: 50%;
        right: 1.25rem;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        z-index: 100;
        background: rgba(10, 18, 32, 0.76); /* Dark premium glass capsule */
        padding: 1rem 0.75rem;
        border-radius: 999px;
        box-shadow: 
          0 20px 48px rgba(8, 13, 24, 0.26),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        transition:
          transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1),
          background 220ms ease,
          border-color 220ms ease,
          box-shadow 220ms ease;
      }

      .sticky-social-bar::before {
        content: "";
        position: absolute;
        left: 50%;
        top: -0.42rem;
        width: 1.25rem;
        height: 2px;
        border-radius: 999px;
        background: linear-gradient(90deg, #0b6fff, #16b7ff);
        transform: translateX(-50%);
        opacity: 0.72;
      }

      .sticky-social-bar:hover {
        background: rgba(10, 18, 32, 0.86);
        border-color: rgba(47, 134, 255, 0.35);
        box-shadow: 
          0 24px 58px rgba(8, 13, 24, 0.36),
          inset 0 1px 0 rgba(255, 255, 255, 0.15);
        transform: translateY(-50%) scale(1.03);
      }

      .sticky-social-link {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.08);
        opacity: 0.82;
        pointer-events: auto;
        transform: scale(1);
        transition:
          opacity 220ms ease,
          transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
          background 220ms ease,
          border-color 220ms ease,
          box-shadow 220ms ease;
      }

      .sticky-social-link img {
        width: 18px;
        height: 18px;
        object-fit: contain;
        transition: transform 220ms ease;
      }

      .sticky-social-link:hover {
        opacity: 1;
        transform: scale(1.14);
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(47, 134, 255, 0.42);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
      }

      .sticky-social-link:hover img {
        transform: scale(1.10);
      }

      @media (max-width: 820px) {
        .sticky-social-bar {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function injectReferenceThemeStyles() {
    if (document.getElementById("connektly-reference-theme-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "connektly-reference-theme-styles";
    style.textContent = `
      :root {
        --bg: #eef6ff;
        --bg-soft: #e7f1ff;
        --surface: rgba(255, 255, 255, 0.92);
        --surface-light: #ffffff;
        --surface-dark: #0b1426;
        --text: #071226;
        --muted: #50627d;
        --line: rgba(12, 31, 59, 0.1);
        --line-strong: rgba(12, 31, 59, 0.16);
        --green: #0b6fff;
        --green-bright: #1687ff;
        --green-deep: #064db8;
        --green-soft: #eaf2ff;
        --blue: #16b7ff;
        --shadow: 0 28px 70px rgba(24, 78, 146, 0.13);
      }

      html {
        background: #eef6ff;
      }

      body {
        color: var(--text) !important;
        background:
          radial-gradient(circle at 50% 0%, rgba(188, 219, 255, 0.72), transparent 28rem),
          radial-gradient(circle at 10% 25%, rgba(255, 255, 255, 0.82), transparent 24rem),
          linear-gradient(180deg, #f7fbff 0%, #edf6ff 42%, #eaf3ff 100%) !important;
      }

      main {
        background: transparent !important;
      }

      body::before {
        content: "";
        position: fixed;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        background-image: radial-gradient(rgba(8, 28, 58, 0.08) 0.7px, transparent 0.7px);
        background-size: 4px 4px;
        opacity: 0.28;
      }

      body {
        font-family: "Manrope", "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        overflow-x: hidden !important;
        -webkit-font-smoothing: antialiased;
        text-rendering: geometricPrecision;
      }

      .features-hero,
      .contact-hero,
      .demo-hero,
      .faq-hero,
      .api-hero,
      .messenger-hero,
      .policy-hero,
      .features-section,
      .capabilities-section,
      .studio-section,
      .dev-section,
      .trust-section,
      .feature-grid-section,
      .messenger-intro,
      .faq-section,
      .support-panel,
      .sales-cta,
      .policy-shell,
      .thank-you-panel {
        padding-top: 2rem !important;
        padding-bottom: 2rem !important;
        padding-block: 2rem !important;
      }

      .features-hero,
      .contact-hero,
      .demo-hero,
      .faq-hero,
      .api-hero,
      .messenger-hero,
      .policy-hero,
      .features-section,
      .capabilities-section,
      .studio-section,
      .dev-section,
      .trust-section,
      .feature-grid-section,
      .messenger-intro,
      .faq-section,
      .support-panel,
      .sales-cta,
      .policy-shell {
        width: min(calc(100% - clamp(1.5rem, 5vw, 6rem)), min(var(--max-width, 1200px), 1280px)) !important;
        margin-inline: auto !important;
      }

      .features-hero h1,
      .contact-hero h1,
      .demo-hero h1,
      .faq-hero h1,
      .api-hero h1,
      .messenger-hero h1,
      .policy-hero h1,
      .thank-you-panel h1 {
        max-width: 25ch !important;
        margin-inline: auto !important;
        color: #071226 !important;
        font-family: "Sora", sans-serif !important;
        font-size: clamp(2.05rem, 4.2vw, 4.45rem) !important;
        line-height: 1.14 !important;
        letter-spacing: 0 !important;
        text-wrap: balance;
      }

      .features-hero h1 span,
      .contact-hero h1 span,
      .demo-hero h1 span,
      .faq-hero h1 span,
      .api-hero h1 span,
      .messenger-hero h1 span,
      .policy-hero h1 span,
      .thank-you-panel h1 span,
      .blue-text {
        color: #0b6fff !important;
      }

      .features-section__head,
      .section-head,
      .intro-header,
      .faq-section,
      .features-cta,
      .final-cta__inner,
      .contact-band__content {
        text-align: center !important;
      }

      .features-section h2,
      .features-section__head h2,
      .section-head h2,
      .intro-header h2,
      .faq-section h2,
      .capabilities-section h2,
      .studio-section h2,
      .dev-section h2,
      .trust-section h2,
      .api-cta-card h2,
      .contact-form-panel h2,
      .demo-form-panel h2,
      .sales-cta h2,
      .policy-section h2,
      .policy-card h2,
      .contact-band h2 {
        max-width: 18ch !important;
        margin-inline: auto !important;
        color: #071226 !important;
        font-family: "Sora", sans-serif !important;
        font-size: clamp(1.55rem, 2.4vw, 2.6rem) !important;
        line-height: 1.08 !important;
        letter-spacing: 0 !important;
        text-wrap: balance;
      }

      .features-hero__lede,
      .contact-hero__lede,
      .demo-hero__lede,
      .faq-hero__lede,
      .api-hero__lede,
      .policy-hero__lede,
      .messenger-card p,
      .intro-header p,
      .intro-content p,
      .section-head p,
      .features-section__head p,
      .api-cta-card p,
      .thank-you-panel p {
        color: #50627d !important;
        line-height: 1.65 !important;
      }

      .features-hero__actions,
      .api-hero__actions,
      .sales-cta__actions,
      .contact-band__actions {
        justify-content: center !important;
      }

      [data-site-header] {
        min-height: 5.25rem !important;
      }

      .site-header,
      .site-header.is-scrolled {
        top: 0.75rem !important;
        left: 50% !important;
        width: min(calc(100% - clamp(1rem, 5vw, 6rem)), min(var(--max-width, 1200px), 1240px)) !important;
        min-height: 3.85rem !important;
        padding: 0.46rem 0.54rem 0.46rem 0.72rem !important;
        grid-template-columns: auto minmax(0, 1fr) auto !important;
        border: 1px solid rgba(12, 31, 59, 0.08) !important;
        border-radius: 999px !important;
        background: rgba(255, 255, 255, 0.86) !important;
        color: #071226 !important;
        box-shadow:
          0 22px 60px rgba(24, 78, 146, 0.18),
          inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
        backdrop-filter: blur(18px) saturate(1.2) !important;
        -webkit-backdrop-filter: blur(18px) saturate(1.2) !important;
        transform: translate3d(-50%, 0, 0) scale(1) !important;
      }

      .site-header.is-hidden:not(.is-open) {
        transform: translate3d(-50%, calc(-100% - 1.2rem), 0) scale(1) !important;
      }

      .site-header .brand__text strong,
      .site-header.is-scrolled .brand__text strong,
      .site-header .site-nav > a:not(.button),
      .site-header .nav-dropdown__toggle,
      .site-header.is-scrolled .site-nav > a:not(.button),
      .site-header.is-scrolled .nav-dropdown__toggle,
      .site-header .header-actions .nav-login,
      .site-header.is-scrolled .header-actions .nav-login {
        color: #071226 !important;
      }

      .site-header .brand__text small {
        color: rgba(7, 18, 38, 0.56) !important;
      }

      .site-header .site-nav,
      .site-header.is-scrolled .site-nav {
        padding: 0.18rem !important;
        border-radius: 999px !important;
        background: rgba(238, 246, 255, 0.76) !important;
      }

      .site-header .site-nav > a:not(.button):hover,
      .site-header .site-nav > a:not(.button).is-active,
      .site-header .nav-dropdown__toggle:hover,
      .site-header .nav-dropdown[open] > .nav-dropdown__toggle,
      .site-header .nav-dropdown--current > .nav-dropdown__toggle,
      .site-header.is-scrolled .site-nav > a:not(.button):hover,
      .site-header.is-scrolled .site-nav > a:not(.button).is-active,
      .site-header.is-scrolled .nav-dropdown__toggle:hover,
      .site-header.is-scrolled .nav-dropdown[open] > .nav-dropdown__toggle,
      .site-header.is-scrolled .nav-dropdown--current > .nav-dropdown__toggle {
        color: #0b6fff !important;
        background: #ffffff !important;
      }

      .site-header .nav-toggle {
        background: rgba(7, 18, 38, 0.08) !important;
      }

      .site-header .nav-toggle span {
        background: #071226 !important;
      }

      h1,
      h2,
      h3,
      .section-heading h2,
      .included-copy h2,
      .compare h2,
      .faq h2,
      .final-cta h2 {
        color: #071226;
        letter-spacing: 0 !important;
      }

      p,
      li,
      .section-heading p,
      .price-card__lede,
      .included-copy p,
      .compare-copy,
      .faq-card p,
      .included-card p {
        color: #50627d;
      }

      .button,
      .price-card__action,
      .compact-price-card__btn,
      .pricing-plan__action,
      .messenger-cta,
      .template-cta-btn,
      .form-submit-btn,
      .contact-form__submit,
      .broad-modal-btn,
      .catalog-btn-add,
      .site-header .nav-cta,
      .site-header.is-scrolled .nav-cta {
        border-radius: 999px !important;
        border: 1px solid rgba(11, 111, 255, 0.18) !important;
        background: linear-gradient(180deg, #1687ff 0%, #0b6fff 100%) !important;
        color: #ffffff !important;
        box-shadow: 0 12px 28px rgba(11, 111, 255, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15) !important;
        transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1) !important;
      }

      .button:hover,
      .price-card__action:hover,
      .compact-price-card__btn:hover,
      .pricing-plan__action:hover,
      .messenger-cta:hover,
      .template-cta-btn:hover,
      .form-submit-btn:hover,
      .contact-form__submit:hover,
      .broad-modal-btn:hover,
      .catalog-btn-add:hover,
      .site-header .nav-cta:hover {
        box-shadow: 0 18px 40px rgba(11, 111, 255, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.25) !important;
        transform: translateY(-2px) !important;
      }

      .button--ghost,
      .compact-price-card__btn--light,
      .compact-price-card__btn--ghost,
      .price-card:not(.price-card--featured) .button,
      .price-card:not(.price-card--featured) .price-card__action {
        background: #ffffff !important;
        color: #0b6fff !important;
        border: 1px solid rgba(11, 111, 255, 0.2) !important;
        box-shadow: 0 4px 12px rgba(11, 111, 255, 0.05) !important;
        transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      .button--ghost:hover,
      .compact-price-card__btn--light:hover,
      .compact-price-card__btn--ghost:hover,
      .price-card:not(.price-card--featured) .button:hover,
      .price-card:not(.price-card--featured) .price-card__action:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 24px rgba(11, 111, 255, 0.12) !important;
        border-color: rgba(11, 111, 255, 0.3) !important;
      }

      .eyebrow,
      .section-label,
      .pricing-plan__badge,
      .price-card__badge,
      .compact-price-card__badge {
        background: linear-gradient(180deg, #36a0ff, #1687ff) !important;
        border: 0 !important;
        color: #ffffff !important;
        box-shadow: 0 10px 22px rgba(11, 111, 255, 0.22) !important;
      }

      .pricing-panel {
        padding-top: 0 !important;
      }

      .pricing-panel::before,
      .compare::before {
        border: 0 !important;
        background: transparent !important;
      }

      .section-heading {
        max-width: 760px !important;
        gap: 0.85rem !important;
        padding-block: 2rem !important;
      }

      .hero.section {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        min-height: auto !important;
        text-align: center !important;
      }

      .hero.section::before,
      .hero__visual {
        display: none !important;
      }

      .hero__content {
        max-width: min(100%, 1120px) !important;
        margin-inline: auto !important;
        text-align: center !important;
      }

      .hero h1 {
        font-family: "Sora", sans-serif !important;
        max-width: 25ch !important;
        margin-inline: auto !important;
        text-align: center !important;
        justify-content: center !important;
        line-height: 1.14 !important;
      }

      .omnichannel .copy-panel h2 {
        font-size: clamp(1.55rem, 2.4vw, 2.6rem) !important;
      }

      .hero__lede {
        max-width: 76ch !important;
        margin-inline: auto !important;
        text-align: center !important;
      }

      .hero__actions,
      .hero__proof-row,
      .hero__note {
        justify-content: center !important;
        text-align: center !important;
      }

      .hero__metrics {
        margin-inline: auto !important;
      }

      .home-contact .contact__details dd {
        color: #000000 !important;
      }

      main > section,
      main > .section,
      main > .section:not(.hero),
      .section,
      .hero.section,
      .broadcast,
      .solutions,
      .omnichannel.section,
      .pricing,
      .pricing-panel,
      .pricing-hero,
      .pricing-value,
      .pricing-compare,
      .faq.section,
      .contact.section--bright,
      .home-contact.contact.section--bright {
        padding-top: 2rem !important;
        padding-bottom: 2rem !important;
        padding-block: 2rem !important;
      }

      .section-heading h2 {
        max-width: 100% !important;
        font-size: clamp(1.55rem, 2.4vw, 2.6rem) !important;
        line-height: 1.08 !important;
        margin-inline: auto !important;
      }

      .solutions > .section-heading h2 {
        white-space: nowrap !important;
        text-wrap: nowrap;
      }

      .section-heading p {
        font-size: 0.98rem !important;
        line-height: 1.6 !important;
      }

      .billing-toggle {
        padding: 0.22rem !important;
        border-color: rgba(12, 31, 59, 0.1) !important;
        background: #ffffff !important;
        box-shadow: 0 14px 32px rgba(24, 78, 146, 0.1) !important;
      }

      .billing-toggle button {
        min-height: 2.3rem !important;
        color: #1d3354 !important;
      }

      .billing-toggle button[aria-pressed="true"] {
        background: #071226 !important;
        color: #ffffff !important;
      }

      .pricing-grid,
      .compact-pricing-grid {
        gap: clamp(1.3rem, 2.2vw, 1.8rem) !important;
      }

      .price-card,
      .compact-price-card,
      .included-card,
      .faq-card,
      .faq-item,
      .faq-category,
      .feature-card,
      .capability-card,
      .pc-card,
      .pf-card,
      .pf-block,
      .summary-card,
      .sync-card,
      .campaign-card,
      .broadcast-card,
      .meta-badge-card,
      .template-hero,
      .composer-panel,
      .email-composer,
      .dev-console,
      .studio-board,
      .product-console,
      .platform-compare,
      .whatsapp-phone,
      .ecosystem-card,
      .workflow-step,
      .benefit-card,
      .trust-card,
      .api-cta-card,
      .messenger-card,
      .contact-form-panel,
      .demo-form-panel,
      .support-card,
      .sales-cta__inner,
      .solution-card,
      .contact-card,
      .contact__card,
      .policy-status,
      .policy-nav,
      .policy-card,
      .policy-section,
      .pricing-plan,
      .compare-table-wrap {
        border: 1px solid rgba(12, 31, 59, 0.08) !important;
        border-radius: 1rem !important;
        background: rgba(255, 255, 255, 0.9) !important;
        box-shadow: 0 18px 50px rgba(24, 78, 146, 0.1) !important;
      }

      .feature-card:hover,
      .capability-card:hover,
      .pc-card:hover,
      .pf-card:hover,
      .pf-block:hover,
      .summary-card:hover,
      .sync-card:hover,
      .campaign-card:hover,
      .broadcast-card:hover,
      .meta-badge-card:hover,
      .template-hero:hover,
      .ecosystem-card:hover,
      .workflow-step:hover,
      .benefit-card:hover,
      .trust-card:hover,
      .faq-item:hover,
      .support-card:hover,
      .policy-section:hover {
        transform: translateY(-0.25rem) !important;
        border-color: rgba(11, 111, 255, 0.22) !important;
        box-shadow: 0 24px 64px rgba(24, 78, 146, 0.14) !important;
      }

      .feature-card,
      .capability-card,
      .pc-card,
      .pf-card,
      .pf-block,
      .summary-card,
      .sync-card,
      .campaign-card,
      .broadcast-card,
      .meta-badge-card,
      .template-hero,
      .ecosystem-card,
      .workflow-step,
      .benefit-card,
      .trust-card,
      .faq-item,
      .support-card,
      .policy-section {
        transition:
          transform 240ms cubic-bezier(0.16, 1, 0.3, 1),
          border-color 240ms ease,
          box-shadow 240ms ease !important;
      }

      .form-field input,
      .form-field select,
      .form-field textarea,
      .search-input,
      .var-input,
      .form-input {
        border: 1px solid rgba(12, 31, 59, 0.12) !important;
        border-radius: 0.9rem !important;
        background: rgba(255, 255, 255, 0.92) !important;
        color: #071226 !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
      }

      .form-field input:focus,
      .form-field select:focus,
      .form-field textarea:focus,
      .search-input:focus,
      .var-input:focus,
      .form-input:focus {
        border-color: rgba(11, 111, 255, 0.45) !important;
        box-shadow: 0 0 0 0.25rem rgba(11, 111, 255, 0.12) !important;
        outline: none !important;
      }

      .price-card,
      .compact-price-card {
        padding: clamp(1.65rem, 2.4vw, 2.25rem) !important;
      }

      .price-card--featured,
      .compact-price-card--dark,
      .pricing-plan--featured {
        background:
          radial-gradient(circle at 86% 8%, rgba(22, 183, 255, 0.16), transparent 18rem),
          linear-gradient(155deg, #263d77 0%, #0b1426 88%) !important;
        color: #ffffff !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 26px 64px rgba(8, 18, 38, 0.32) !important;
      }

      .price-card--featured *,
      .compact-price-card--dark *,
      .pricing-plan--featured * {
        color: inherit;
      }

      .price-card--featured p,
      .price-card--featured li,
      .compact-price-card--dark p,
      .compact-price-card--dark li,
      .pricing-plan--featured p,
      .pricing-plan--featured li {
        color: rgba(232, 240, 255, 0.78) !important;
      }

      .price-card--featured h3,
      .price-card--featured strong,
      .compact-price-card--dark h3,
      .compact-price-card--dark strong,
      .pricing-plan--featured h3,
      .pricing-plan--featured strong {
        color: #ffffff !important;
      }

      .price-card__header,
      .compact-price-card__header,
      .pricing-plan__header {
        border-bottom-color: rgba(12, 31, 59, 0.08) !important;
      }

      .price-card--featured .price-card__header {
        border-bottom-color: rgba(255, 255, 255, 0.1) !important;
      }

      .price-card__billing,
      .compact-price-card__addon,
      .pricing-plan__meta {
        color: #0b6fff !important;
      }

      .price-card--featured .price-card__billing,
      .compact-price-card--dark .compact-price-card__addon,
      .pricing-plan--featured .pricing-plan__meta {
        color: #dceaff !important;
      }

      .check-icon,
      .compact-price-card__features li::before {
        color: #0b6fff !important;
      }

      .included,
      .faq,
      .compare,
      .pricing-value,
      .pricing-compare,
      .section--raised {
        background: transparent !important;
      }

      .included-grid,
      .faq-grid {
        gap: clamp(2.4rem, 6vw, 6rem) !important;
      }

      .included-list,
      .faq-list {
        gap: 1.1rem !important;
      }

      .included-card,
      .faq-card {
        padding: clamp(1.1rem, 1.8vw, 1.45rem) !important;
      }

      .final-cta,
      .features-cta,
      .cta-section,
      .demo-popup__dialog {
        border-radius: clamp(1.6rem, 3vw, 2.5rem) !important;
        background:
          radial-gradient(circle at 14% 12%, rgba(11, 111, 255, 0.28), transparent 24rem),
          radial-gradient(circle at 86% 22%, rgba(22, 183, 255, 0.18), transparent 28rem),
          linear-gradient(135deg, #062118 0%, #071226 48%, #092d4b 100%) !important;
        color: #ffffff !important;
        box-shadow: 0 28px 74px rgba(8, 18, 38, 0.18) !important;
      }

      .final-cta *,
      .features-cta *,
      .cta-section *,
      .demo-popup__dialog * {
        color: inherit;
      }

      .final-cta h1,
      .final-cta h2,
      .final-cta h3,
      .features-cta h1,
      .features-cta h2,
      .features-cta h3,
      .cta-section h1,
      .cta-section h2,
      .cta-section h3,
      .demo-popup__dialog h1,
      .demo-popup__dialog h2,
      .demo-popup__dialog h3 {
        color: #ffffff !important;
      }

      .final-cta p,
      .features-cta p,
      .cta-section p,
      .demo-popup__dialog p {
        color: rgba(234, 242, 255, 0.78) !important;
      }

      .custom-footer,
      .site-footer.custom-footer {
        background:
          radial-gradient(circle at 10% 0%, rgba(11, 111, 255, 0.18), transparent 28rem),
          linear-gradient(180deg, #06162e 0%, #041025 100%) !important;
      }

      .custom-footer .footer-nav-col h3,
      .custom-footer .footer-brand-text,
      .custom-footer strong {
        color: #ffffff !important;
      }

      .custom-footer .footer-desc,
      .custom-footer .footer-copy,
      .custom-footer .footer-nav-col a,
      .custom-footer .footer-disclaimer {
        color: rgba(225, 236, 255, 0.72) !important;
      }

      .sticky-social-bar {
        background: rgba(7, 18, 38, 0.78) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
      }

      @media (max-width: 820px) {
        .site-header,
        .site-header.is-scrolled,
        .site-header.is-open {
          width: min(calc(100% - 1rem), 680px) !important;
          grid-template-columns: auto auto !important;
          background: rgba(255, 255, 255, 0.94) !important;
        }

        .site-header.is-open .site-nav,
        .site-header.is-open .mobile-actions {
          background: rgba(238, 246, 255, 0.92) !important;
        }

        .section-heading h2 {
          max-width: 100% !important;
          font-size: clamp(0.95rem, 4vw, 1.3rem) !important;
        }

        .price-card--featured,
        .compact-price-card--dark,
        .pricing-plan--featured {
          transform: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function injectMobileOptimizationStyles() {
    if (document.getElementById("connektly-mobile-optimization-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "connektly-mobile-optimization-styles";
    style.textContent = `
      @media (max-width: 820px) {
        :root {
          --site-header-shell-height: 4.25rem !important;
          --site-mobile-gutter: clamp(0.75rem, 4vw, 1.25rem);
        }

        html,
        body {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden !important;
        }

        html.mobile-nav-open,
        html.mobile-nav-open body {
          overflow: hidden !important;
          overscroll-behavior: none;
        }

        body :where(main, section, article, aside, div, form, fieldset, ul, li) {
          min-width: 0;
        }

        img,
        video,
        iframe,
        canvas,
        svg {
          max-width: 100%;
        }

        input,
        select,
        textarea,
        button {
          max-width: 100%;
          font-size: 16px;
        }

        [data-site-header] {
          min-height: var(--site-header-shell-height) !important;
        }

        .site-header,
        .site-header.is-scrolled,
        .site-header.is-scrolled:not(.is-open),
        .site-header.is-open {
          position: fixed !important;
          top: 0 !important;
          right: auto !important;
          left: 0 !important;
          width: 100% !important;
          max-width: none !important;
          min-height: var(--site-header-shell-height) !important;
          margin: 0 !important;
          padding: 0.55rem var(--site-mobile-gutter) !important;
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) auto !important;
          gap: 0.75rem !important;
          border: 0 !important;
          border-bottom: 1px solid rgba(12, 31, 59, 0.09) !important;
          border-radius: 0 !important;
          background: rgba(255, 255, 255, 0.97) !important;
          color: #071226 !important;
          box-shadow: 0 8px 26px rgba(24, 78, 146, 0.12) !important;
          backdrop-filter: blur(18px) saturate(1.15) !important;
          -webkit-backdrop-filter: blur(18px) saturate(1.15) !important;
          transform: none !important;
          animation: none !important;
        }

        .site-header.is-hidden:not(.is-open) {
          transform: none !important;
        }

        .site-header .brand {
          width: fit-content !important;
          max-width: 100% !important;
          gap: 0.55rem !important;
          color: #071226 !important;
          transform: none !important;
        }

        .site-header .brand__mark,
        .site-header.is-scrolled .brand__mark {
          flex: 0 0 2.35rem !important;
          width: 2.35rem !important;
          height: 2.35rem !important;
        }

        .site-header .brand__text strong,
        .site-header.is-scrolled .brand__text strong {
          color: #071226 !important;
          font-size: 0.94rem !important;
        }

        .site-header .nav-toggle {
          position: relative !important;
          display: inline-grid !important;
          place-items: center !important;
          justify-self: end !important;
          flex: 0 0 2.75rem !important;
          width: 2.75rem !important;
          height: 2.75rem !important;
          margin: 0 !important;
          border: 1px solid rgba(12, 31, 59, 0.08) !important;
          background: #eef4ff !important;
          box-shadow: none !important;
          transform: none !important;
        }

        .site-header .nav-toggle span {
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          margin: 0 !important;
          background: #071226 !important;
        }

        .site-header .nav-toggle span:first-child {
          transform: translate(-50%, calc(-50% - 0.22rem)) !important;
        }

        .site-header .nav-toggle span:last-child {
          transform: translate(-50%, calc(-50% + 0.22rem)) !important;
        }

        .site-header.is-open .nav-toggle span:first-child {
          transform: translate(-50%, -50%) rotate(45deg) !important;
        }

        .site-header.is-open .nav-toggle span:last-child {
          transform: translate(-50%, -50%) rotate(-45deg) !important;
        }

        .site-header .site-nav,
        .site-header.is-scrolled .site-nav {
          position: fixed !important;
          top: var(--site-header-shell-height) !important;
          right: 0 !important;
          bottom: auto !important;
          left: 0 !important;
          width: 100% !important;
          max-width: none !important;
          max-height: calc(100vh - var(--site-header-shell-height)) !important;
          max-height: calc(100dvh - var(--site-header-shell-height)) !important;
          margin: 0 !important;
          padding: 0.75rem var(--site-mobile-gutter) 1.25rem !important;
          display: none !important;
          gap: 0.45rem !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          overscroll-behavior: contain;
          border: 0 !important;
          border-bottom: 1px solid rgba(12, 31, 59, 0.09) !important;
          border-radius: 0 0 1.25rem 1.25rem !important;
          background: rgba(255, 255, 255, 0.99) !important;
          box-shadow: 0 20px 42px rgba(24, 78, 146, 0.18) !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transform: none !important;
          -webkit-overflow-scrolling: touch;
        }

        .site-header.is-open .site-nav,
        .site-header.is-scrolled.is-open .site-nav {
          display: grid !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transform: none !important;
        }

        .site-header .site-nav > a:not(.button),
        .site-header.is-scrolled .site-nav > a:not(.button),
        .site-header .nav-dropdown__toggle,
        .site-header.is-scrolled .nav-dropdown__toggle {
          width: 100% !important;
          min-height: 2.85rem !important;
          padding: 0.8rem 0.9rem !important;
          justify-content: space-between !important;
          border: 1px solid rgba(12, 31, 59, 0.07) !important;
          border-radius: 0.85rem !important;
          background: #f5f8ff !important;
          color: #071226 !important;
          font-size: 0.95rem !important;
          line-height: 1.25 !important;
          transform: none !important;
        }

        .site-header .site-nav > a:not(.button)::before,
        .site-header .nav-dropdown__toggle::before {
          display: none !important;
        }

        .site-header .site-nav > a:not(.button):hover,
        .site-header .site-nav > a:not(.button).is-active,
        .site-header .nav-dropdown__toggle:hover,
        .site-header .nav-dropdown[open] > .nav-dropdown__toggle,
        .site-header .nav-dropdown--current > .nav-dropdown__toggle {
          background: #eaf2ff !important;
          color: #0b6fff !important;
          transform: none !important;
        }

        .site-header .nav-dropdown {
          position: static !important;
          width: 100% !important;
        }

        .site-header .nav-dropdown:not([open]) > .nav-dropdown__menu,
        .site-header .nav-dropdown:not([open]):hover > .nav-dropdown__menu {
          display: none !important;
        }

        .site-header .nav-dropdown[open] > .nav-dropdown__menu,
        .site-header .nav-dropdown[open]:hover > .nav-dropdown__menu {
          position: static !important;
          display: block !important;
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          margin: 0.45rem 0 0 !important;
          padding: 0.45rem !important;
          overflow: visible !important;
          border: 1px solid rgba(12, 31, 59, 0.07) !important;
          border-radius: 0.9rem !important;
          background: #f5f8ff !important;
          box-shadow: none !important;
          opacity: 1 !important;
          visibility: visible !important;
          transform: none !important;
        }

        .site-header .mega-menu,
        .site-header .mega-menu--solutions,
        .site-header .mega-menu--features,
        .site-header .mega-menu--resources {
          grid-template-columns: minmax(0, 1fr) !important;
          gap: 0.5rem !important;
        }

        .site-header .mega-menu__column {
          width: 100% !important;
          padding: 0.25rem !important;
        }

        .site-header .mega-menu__heading {
          padding-inline: 0.55rem !important;
        }

        .site-header .nav-dropdown__menu--mega .mega-menu__column a {
          width: 100% !important;
          grid-template-columns: 2rem minmax(0, 1fr) !important;
          padding: 0.65rem !important;
          color: #071226 !important;
          background: #ffffff !important;
          border: 1px solid rgba(12, 31, 59, 0.06) !important;
          transform: none !important;
        }

        .site-header .dropdown-item-label,
        .site-header .mega-menu__feature-heading {
          color: #071226 !important;
        }

        .site-header .dropdown-item-desc,
        .site-header .mega-menu__feature-desc {
          color: #50627d !important;
        }

        .site-header .mega-menu__feature {
          min-height: 0 !important;
          margin: 0 !important;
          padding: 1rem !important;
          border-color: rgba(12, 31, 59, 0.07) !important;
          background: #ffffff !important;
          box-shadow: none !important;
        }

        .site-header .mobile-actions {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
          gap: 0.5rem !important;
          width: 100% !important;
          margin: 0.25rem 0 0 !important;
          padding: 0.75rem 0 0 !important;
          border-top: 1px solid rgba(12, 31, 59, 0.08) !important;
          background: transparent !important;
        }

        .site-header .mobile-actions .nav-login,
        .site-header .mobile-actions .nav-cta {
          width: 100% !important;
          min-height: 2.8rem !important;
          margin: 0 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .site-header .mobile-actions .nav-login {
          border: 1px solid rgba(12, 31, 59, 0.08) !important;
          background: #f5f8ff !important;
          color: #071226 !important;
        }

        .site-header .mobile-actions .nav-login:hover {
          background: #eaf2ff !important;
          color: #0b6fff !important;
        }

        form,
        fieldset,
        .form-grid,
        .form-field,
        .contact-form,
        .demo-form,
        .partner-form,
        .contact-form-panel,
        .demo-form-panel,
        .partner-form-card {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
        }

        .form-grid,
        .contact-form,
        .demo-form,
        .contact-form__row,
        .contact__grid,
        .home-contact .contact__grid {
          grid-template-columns: minmax(0, 1fr) !important;
        }

        .form-field input,
        .form-field select,
        .form-field textarea,
        form input,
        form select,
        form textarea {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
        }

        .section-heading h1,
        .section-heading h2,
        .features-section__head h2,
        .section-head h2,
        .solutions > .section-heading h2 {
          max-width: 100% !important;
          white-space: normal !important;
          overflow-wrap: anywhere;
          text-wrap: balance;
        }

        .comparison__table-wrapper,
        .compare-table-wrap,
        .policy-nav,
        .faq-nav,
        .solution-tabs,
        .article-content,
        pre {
          max-width: 100% !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch;
        }
      }

      @media (max-width: 640px) {
        .section,
        .page-section,
        .partner-section,
        .partner-form-section,
        .features-section,
        .api-section,
        .calling-section,
        .contact-showcase,
        .sales-cta,
        .final-cta {
          width: min(calc(100% - 1.25rem), 100%) !important;
          max-width: 100% !important;
        }

        .hero__actions,
        .features-hero__actions,
        .api-hero__actions,
        .sales-cta__actions,
        .contact-band__actions {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) !important;
          width: 100% !important;
        }

        .hero__actions > *,
        .features-hero__actions > *,
        .api-hero__actions > *,
        .sales-cta__actions > *,
        .contact-band__actions > *,
        form [type="submit"] {
          width: 100% !important;
          max-width: 100% !important;
        }

        .contact-form-panel,
        .demo-form-panel,
        .partner-form-card {
          padding: 1rem !important;
          border-radius: 1.1rem !important;
        }

        .home-contact.contact.section--bright {
          padding-inline: var(--site-mobile-gutter) !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderSocialBar() {
    let bar = document.querySelector(".sticky-social-bar");
    if (!bar) {
      bar = document.createElement("nav");
      bar.className = "sticky-social-bar";
      bar.setAttribute("aria-label", "Social links");
      document.body.appendChild(bar);
    }

    bar.innerHTML = `
      <a class="sticky-social-link" href="https://wa.me/12899070610" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
        <img src="${fromRoot("Social Media Icons/WhatsApp.svg")}" alt="WhatsApp" width="18" height="18" />
      </a>
      <a class="sticky-social-link" href="https://www.instagram.com/connektlyy/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <img src="${fromRoot("Social Media Icons/Instagram.png")}" alt="Instagram" width="18" height="18" />
      </a>
      <a class="sticky-social-link" href="https://www.facebook.com/connektly" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
        <img src="${fromRoot("Social Media Icons/Facebook.svg")}" alt="Facebook" width="18" height="18" />
      </a>
    `;
  }

  function renderComponents() {
    injectHeaderStyles();
    injectFooterStyles();
    injectSocialBarStyles();
    injectReferenceThemeStyles();
    injectMobileOptimizationStyles();
    renderHeader();
    renderFooter();
    renderSocialBar();
    renderWhatsAppWidget();
    setActiveNavLink();
    bindHeaderInteractions();
    bindWhatsAppWidgetInteractions();
    document.dispatchEvent(new Event("componentsLoaded"));
  }

  window.ConnektlyComponents = {
    render: renderComponents
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderComponents, { once: true });
  } else {
    renderComponents();
  }
})();
