class ZuploBanner extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    const toolsData = {
      zudoku: {
        name: "Zudoku",
        logo: "https://cdn.zuplo.com/uploads/zudoku-logo-only.svg",
        description: "API documentation should be free.",
        url: "https://zudoku.dev?utm_source=mockbin&utm_medium=web&utm_campaign=header&ref=mockbin",
      },
      ratemyopenapi: {
        name: "Rate My OpenAPI",
        logo: "https://cdn.zuplo.com/uploads/rmoa-logo-only.svg",
        description: "Get feedback and a rating on your OpenAPI spec",
        url: "https://ratemyopenapi.com?utm_source=mockbin&utm_medium=web&utm_campaign=header&ref=mockbin",
      },
      mockbin: {
        name: "Mockbin",
        logo: "https://cdn.zuplo.com/uploads/mockbin-logo-only.svg",
        description: "Mock an API from OpenAPI in seconds",
        url: "https://mockbin.io",
      },
      uuid: {
        name: "UUID.new",
        logo: "https://cdn.zuplo.com/uploads/uuidnew-logo-only.svg",
        description: "Generate UUIDs in your browser",
        url: "https://uuid.new",
      },
    };

    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "zuplo-banner");

    const leftDiv = document.createElement("div");
    leftDiv.setAttribute("class", "left");

    const openSourceText = document.createElement("span");
    openSourceText.setAttribute("class", "tagline");
    openSourceText.textContent = "Open source by";

    const zuploLogoContainer = document.createElement("a");
    zuploLogoContainer.setAttribute(
      "href",
      "https://zuplo.com?utm_source=mockbin",
    );
    zuploLogoContainer.setAttribute("target", "_blank");
    zuploLogoContainer.setAttribute("rel", "noopener noreferrer");
    zuploLogoContainer.setAttribute("class", "zuplo-logo");
    zuploLogoContainer.setAttribute("aria-label", "Zuplo");
    zuploLogoContainer.innerHTML = this.getZuploLogoSVG();

    leftDiv.appendChild(openSourceText);
    leftDiv.appendChild(zuploLogoContainer);

    const rightDiv = document.createElement("div");
    rightDiv.setAttribute("class", "right");

    const menuButton = document.createElement("button");
    menuButton.setAttribute("class", "menu-button");
    menuButton.setAttribute("type", "button");
    menuButton.setAttribute("aria-haspopup", "true");
    menuButton.setAttribute("aria-expanded", "false");

    const gripIconSVG = `
      <svg xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 256 256"
           fill="currentColor"
           fill-rule="evenodd"
           aria-hidden="true">
        <path d="M84,64A12,12,0,1,1,72,52,12,12,0,0,1,84,64Zm44,12a12,12,0,1,0-12-12A12,12,0,0,0,128,76Zm56,0a12,12,0,1,0-12-12A12,12,0,0,0,184,76ZM72,116a12,12,0,1,0,12,12A12,12,0,0,0,72,116Zm56,0a12,12,0,1,0,12,12A12,12,0,0,0,128,116Zm56,0a12,12,0,1,0,12,12A12,12,0,0,0,184,116ZM72,180a12,12,0,1,0,12,12A12,12,0,0,0,72,180Zm56,0a12,12,0,1,0,12,12A12,12,0,0,0,128,180Zm56,0a12,12,0,1,0,12,12A12,12,0,0,0,184,180Z"/>
      </svg>
    `;

    const buttonContent = document.createElement("span");
    buttonContent.setAttribute("class", "button-content");
    buttonContent.innerHTML = `${gripIconSVG}<span class="button-text">View Tools</span>`;

    menuButton.appendChild(buttonContent);
    rightDiv.appendChild(menuButton);

    wrapper.appendChild(leftDiv);
    wrapper.appendChild(rightDiv);

    shadow.appendChild(wrapper);

    const menu = document.createElement("div");
    menu.setAttribute("class", "menu");
    menu.setAttribute("role", "menu");

    for (const key in toolsData) {
      const tool = toolsData[key];

      const menuItem = document.createElement("a");
      menuItem.setAttribute("href", tool.url);
      menuItem.setAttribute("class", "menu-item");
      menuItem.setAttribute("target", "_blank");
      menuItem.setAttribute("rel", "noopener noreferrer");
      menuItem.setAttribute("role", "menuitem");

      const logoWrap = document.createElement("span");
      logoWrap.setAttribute("class", "menu-item-logo");

      const logo = document.createElement("img");
      logo.setAttribute("src", tool.logo);
      logo.setAttribute("alt", "");
      logo.setAttribute("loading", "lazy");

      logoWrap.appendChild(logo);

      const textContainer = document.createElement("div");
      textContainer.setAttribute("class", "text-container");

      const name = document.createElement("div");
      name.setAttribute("class", "tool-name");
      name.textContent = tool.name;

      const description = document.createElement("div");
      description.setAttribute("class", "tool-description");
      description.textContent = tool.description;

      textContainer.appendChild(name);
      textContainer.appendChild(description);

      menuItem.appendChild(logoWrap);
      menuItem.appendChild(textContainer);

      menu.appendChild(menuItem);
    }

    const menuFooter = document.createElement("div");
    menuFooter.setAttribute("class", "menu-footer");
    menuFooter.textContent = "Crafted by Zuplo";
    menu.appendChild(menuFooter);

    rightDiv.appendChild(menu);

    menuButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = menu.classList.toggle("visible");
      menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.addEventListener("click", (event) => {
      if (!this.contains(event.target)) {
        menu.classList.remove("visible");
        menuButton.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        menu.classList.remove("visible");
        menuButton.setAttribute("aria-expanded", "false");
      }
    });

    const style = document.createElement("style");
    style.textContent = `
      :host {
        all: initial;
        display: block;
      }

      * {
        box-sizing: border-box;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .zuplo-banner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        background-color: #ffffff;
        color: #111827;
        border-bottom: 1px solid #e5e7eb;
        padding: 10px 24px;
        width: 100%;
        flex-wrap: nowrap;
      }

      .left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .tagline {
        font-size: 13px;
        font-weight: 500;
        color: #6b7280;
        white-space: nowrap;
      }

      .zuplo-logo {
        display: inline-flex;
        align-items: center;
        line-height: 0;
        text-decoration: none;
        color: #111827;
        transition: color 0.15s ease;
      }
      .zuplo-logo:hover {
        color: #ff00bd;
      }
      .zuplo-logo svg {
        height: 20px;
        width: auto;
      }

      .right {
        position: relative;
        display: flex;
        align-items: center;
      }

      .menu-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background-color: #ffffff;
        color: #111827;
        border: 1px solid #e5e7eb;
        height: 36px;
        padding: 0 14px;
        border-radius: 10px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        line-height: 1;
        white-space: nowrap;
        transition: background-color 0.15s ease, border-color 0.15s ease;
      }
      .menu-button:hover {
        background-color: #f9fafb;
      }
      .menu-button:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(255, 0, 189, 0.15);
      }

      .menu-button .button-content {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .menu-button svg {
        width: 16px;
        height: 16px;
        display: block;
        color: #6b7280;
      }

      .menu {
        display: none;
        position: absolute;
        right: 0;
        top: calc(100% + 8px);
        background-color: #ffffff;
        color: #111827;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.10);
        z-index: 9999;
        width: 340px;
        padding: 10px;
        overflow: hidden;
      }
      .menu.visible {
        display: block;
      }

      .menu-item {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        text-decoration: none;
        color: #111827;
        padding: 10px;
        border-radius: 10px;
        transition: background-color 0.15s ease;
      }
      .menu-item:hover,
      .menu-item:focus-visible {
        background-color: #f9fafb;
        outline: none;
      }

      .menu-item-logo {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .menu-item-logo img {
        width: 40px;
        height: 40px;
        display: block;
        object-fit: contain;
      }

      .text-container {
        display: flex;
        flex-direction: column;
        min-width: 0;
        gap: 2px;
        padding-top: 2px;
      }
      .tool-name {
        font-size: 15px;
        font-weight: 700;
        color: #111827;
        white-space: nowrap;
        line-height: 1.2;
      }
      .tool-description {
        font-size: 13px;
        font-weight: 400;
        color: #6b7280;
        line-height: 1.4;
      }

      .menu-footer {
        text-align: center;
        margin-top: 4px;
        padding: 10px 8px 4px;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: #9ca3af;
        border-top: 1px solid #e5e7eb;
      }

      @media (max-width: 640px) {
        .zuplo-banner {
          padding: 10px 16px;
        }
        .tagline {
          display: none;
        }
        .menu {
          width: min(320px, calc(100vw - 32px));
        }
      }
    `;

    const mode = this.getAttribute("mode") || "light";

    if (mode === "dark") {
      style.textContent += `
        .zuplo-banner {
          background-color: #111827;
          color: #ffffff;
          border-bottom-color: #1f2937;
        }
        .tagline {
          color: #9ca3af;
        }
        .zuplo-logo {
          color: #ffffff;
        }
        .menu-button {
          background-color: transparent;
          color: #ffffff;
          border-color: #1f2937;
        }
        .menu-button:hover {
          background-color: #1f2937;
        }
        .menu-button svg {
          color: #9ca3af;
        }
        .menu {
          background-color: #111827;
          color: #ffffff;
          border-color: #1f2937;
        }
        .menu-item {
          color: #ffffff;
        }
        .menu-item:hover,
        .menu-item:focus-visible {
          background-color: #1f2937;
        }
        .menu-item-logo {
          background-color: #1f2937;
        }
        .tool-name {
          color: #ffffff;
        }
        .tool-description {
          color: #9ca3af;
        }
        .menu-footer {
          color: #6b7280;
          border-top-color: #1f2937;
        }
      `;
    }

    shadow.appendChild(style);
  }

  getZuploLogoSVG() {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true" viewBox="0 0 147 33"><path fill="currentColor" d="M27.142 19.978H16.62L27.83 8.746a.758.758 0 0 0-.534-1.293H9.488V0h19.534a7.57 7.57 0 0 1 4.065 1.125 7.6 7.6 0 0 1 2.836 3.126 7.4 7.4 0 0 1-1.461 8.398l-7.32 7.328z"></path><path fill="currentColor" d="M9.489 11.042h10.524l-11.19 11.21a.772.772 0 0 0 .543 1.316h17.759v7.452H7.61a7.57 7.57 0 0 1-4.065-1.125A7.6 7.6 0 0 1 .71 26.768a7.4 7.4 0 0 1 1.462-8.397zm73.297 5.728c0 2.657-1.034 4.283-3.46 4.244-2.227-.04-3.38-1.666-3.38-4.283V6.696h-5.488v10.43c0 5.038 3.142 8.607 8.868 8.647 5.25.04 8.948-3.807 8.948-8.606V6.697h-5.488zm53.306-10.512c-5.925 0-10.098 4.204-10.098 9.757 0 5.552 4.175 9.756 10.098 9.756s10.099-4.204 10.099-9.756-4.173-9.757-10.099-9.757m0 14.794c-2.744 0-4.69-2.063-4.69-5.037 0-2.975 1.948-5.038 4.69-5.038s4.691 2.063 4.691 5.038-1.947 5.037-4.691 5.037M101.966 6.258c-5.926 0-10.099 4.204-10.099 9.757 0 .073.009.144.01.22h-.01v15.772h5.408V24.75a10.9 10.9 0 0 0 4.691 1.02c5.926 0 10.099-4.204 10.099-9.756s-4.173-9.756-10.099-9.756m0 14.794c-2.744 0-4.69-2.063-4.69-5.037 0-2.975 1.948-5.038 4.69-5.038s4.691 2.063 4.691 5.038-1.947 5.037-4.691 5.037M49.868 11.41h10.814l-10.814 8.452v5.473h17.514v-4.716h-10.84l10.84-8.473V6.694H49.868zm74.501 13.925h-1.831a7.46 7.46 0 0 1-5.262-2.177 7.42 7.42 0 0 1-2.183-5.248V.005h5.518V17.91a1.927 1.927 0 0 0 1.927 1.921h1.831z"></path></svg>
    `;
  }
}

if (!customElements.get("zuplo-banner")) {
  customElements.define("zuplo-banner", ZuploBanner);
}
