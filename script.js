async function fetchText(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) return "";
  return (await response.text()).trim();
}

async function loadTextMap(files, defaults) {
  const entries = await Promise.all(
    Object.entries(files).map(async ([key, path]) => [key, await fetchText(path)]),
  );
  const loaded = Object.fromEntries(entries);
  return Object.fromEntries(
    Object.keys(defaults).map((key) => [key, loaded[key] || defaults[key] || ""]),
  );
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "";
}

function renderParagraphs(containerId, paragraphs) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  for (const paragraph of paragraphs.filter(Boolean)) {
    const p = document.createElement("p");
    p.textContent = paragraph;
    container.appendChild(p);
  }
}

function renderContact(content) {
  const street = document.getElementById("street");
  const postalCity = document.getElementById("postal-city");
  const openingHours = document.getElementById("opening-hours");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  if (!street || !postalCity || !openingHours || !email || !phone) return;

  street.textContent = content.street || "";
  postalCity.textContent = content.postalCity || "";
  openingHours.textContent = content.openingHours || "";
  openingHours.style.display = content.openingHours ? "block" : "none";

  if (content.email) {
    email.textContent = content.email;
    email.href = `mailto:${content.email}`;
    email.parentElement.style.display = "block";
  } else {
    email.textContent = "";
    email.removeAttribute("href");
    email.parentElement.style.display = "none";
  }

  const phoneHref = content.phoneIntl || content.phoneDisplay || "";
  if (phoneHref && content.phoneDisplay) {
    phone.textContent = content.phoneDisplay;
    phone.href = `tel:${phoneHref}`;
    phone.parentElement.style.display = "block";
  } else {
    phone.textContent = "";
    phone.removeAttribute("href");
    phone.parentElement.style.display = "none";
  }
}

const PAGE_CONFIGS = {
  home: {
    files: {
      pageTitle: "texts/home/page-title.txt",
      intro1: "texts/home/intro-1.txt",
      intro2: "texts/home/intro-2.txt",
    },
    defaults: {
      pageTitle: "Tervetuloa",
      intro1: "",
      intro2: "",
    },
    textTargets: [["content-page-title", "pageTitle"]],
    paragraphTargets: [["intro-text", ["intro1", "intro2"]]],
  },
  about: {
    files: {
      pageTitle: "texts/about/page-title.txt",
      intro1: "texts/about/intro-1.txt",
      intro2: "texts/about/intro-2.txt",
      historyTitle: "texts/about/history-title.txt",
      history1: "texts/about/history-1.txt",
      history2: "texts/about/history-2.txt",
    },
    defaults: {
      pageTitle: "Tausta ja työote",
      intro1: "",
      intro2: "",
      historyTitle: "Tausta ja koulutus",
      history1: "",
      history2: "",
    },
    textTargets: [
      ["content-page-title", "pageTitle"],
      ["about-history-title", "historyTitle"],
    ],
    paragraphTargets: [
      ["intro-text", ["intro1", "intro2"]],
      ["about-history-text", ["history1", "history2"]],
    ],
  },
  contact: {
    files: {
      pageTitle: "texts/contact/page-title.txt",
      intro1: "texts/contact/intro-1.txt",
      intro2: "texts/contact/intro-2.txt",
      street: "texts/contact/street.txt",
      postalCity: "texts/contact/postal-city.txt",
      openingHours: "texts/contact/opening-hours.txt",
      email: "texts/contact/email.txt",
      phoneDisplay: "texts/contact/phone-display.txt",
      phoneIntl: "texts/contact/phone-intl.txt",
    },
    defaults: {
      pageTitle: "Ota yhteyttä",
      intro1: "",
      intro2: "",
      street: "",
      postalCity: "",
      openingHours: "",
      email: "",
      phoneDisplay: "",
      phoneIntl: "",
    },
    textTargets: [["content-page-title", "pageTitle"]],
    paragraphTargets: [["intro-text", ["intro1", "intro2"]]],
    hasContact: true,
  },
};

async function renderPageContent(page) {
  const config = PAGE_CONFIGS[page] || PAGE_CONFIGS.home;
  const content = await loadTextMap(config.files, config.defaults);

  for (const [id, key] of config.textTargets || []) {
    setText(id, content[key]);
  }

  for (const [containerId, keys] of config.paragraphTargets || []) {
    renderParagraphs(
      containerId,
      keys.map((key) => content[key]),
    );
  }

  if (config.hasContact) {
    renderContact(content);
  }
}

async function renderSharedHero() {
  const hero = await loadTextMap(
    {
      companyName: "texts/shared-hero/title.txt",
      subtitle: "texts/shared-hero/subtitle.txt",
    },
    {
      companyName: "PSYKOTERAPIA MIELIKUVA",
      subtitle: "Psykoterapiapalvelut",
    },
  );

  setText("company-name", hero.companyName);
  setText("page-subtitle", hero.subtitle);
}

function renderFallback() {
  const intro = document.getElementById("intro-text");
  if (!intro) return;
  intro.innerHTML =
    "<p>Sivun sisallon latauksessa tapahtui virhe. Yrita paivittaa sivu uudelleen.</p>";
}

async function initPage() {
  try {
    await renderSharedHero();
    const page = document.body.dataset.page || "home";
    await renderPageContent(page);
  } catch (error) {
    renderFallback();
  } finally {
    document.body.classList.remove("content-loading");
    document.body.classList.add("content-ready");
  }
}

initPage();
