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

function textToParagraphs(text) {
  return (text || "")
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
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
      pageTitle: "tekstit/etusivu/01-sivun-otsikko.txt",
      introText: "tekstit/etusivu/02-leipateksti.txt",
    },
    defaults: {
      pageTitle: "Tervetuloa",
      introText: "",
    },
    textTargets: [["content-page-title", "pageTitle"]],
    paragraphTextTargets: [["intro-text", "introText"]],
  },
  about: {
    files: {
      pageTitle: "tekstit/tietoa/01-sivun-otsikko.txt",
      introText: "tekstit/tietoa/02-leipateksti.txt",
      historyTitle: "tekstit/tietoa/03-osion-otsikko.txt",
      historyText: "tekstit/tietoa/04-osion-teksti.txt",
      workTitle: "tekstit/tietoa/05-tyoskentelytapa-otsikko.txt",
      workText: "tekstit/tietoa/06-tyoskentelytapa-teksti.txt",
    },
    defaults: {
      pageTitle: "Tausta ja työote",
      introText: "",
      historyTitle: "Tausta ja koulutus",
      historyText: "",
      workTitle: "Tyoskentelytapani",
      workText: "",
    },
    textTargets: [
      ["content-page-title", "pageTitle"],
      ["about-history-title", "historyTitle"],
      ["about-work-title", "workTitle"],
    ],
    paragraphTextTargets: [
      ["intro-text", "introText"],
      ["about-history-text", "historyText"],
      ["about-work-text", "workText"],
    ],
  },
  contact: {
    files: {
      pageTitle: "tekstit/yhteystiedot/01-sivun-otsikko.txt",
      introText: "tekstit/yhteystiedot/02-leipateksti.txt",
      street: "tekstit/yhteystiedot/03-katuosoite.txt",
      postalCity: "tekstit/yhteystiedot/04-postinumero-ja-kaupunki.txt",
      openingHours: "tekstit/yhteystiedot/05-ajanvaraus.txt",
      email: "tekstit/yhteystiedot/06-sahkoposti.txt",
      phoneDisplay: "tekstit/yhteystiedot/07-puhelin-nakyva.txt",
      phoneIntl: "tekstit/yhteystiedot/08-puhelin-linkki.txt",
    },
    defaults: {
      pageTitle: "Ota yhteyttä",
      introText: "",
      street: "",
      postalCity: "",
      openingHours: "",
      email: "",
      phoneDisplay: "",
      phoneIntl: "",
    },
    textTargets: [["content-page-title", "pageTitle"]],
    paragraphTextTargets: [["intro-text", "introText"]],
    hasContact: true,
  },
};

async function renderPageContent(page) {
  const config = PAGE_CONFIGS[page] || PAGE_CONFIGS.home;
  const content = await loadTextMap(config.files, config.defaults);

  for (const [id, key] of config.textTargets || []) {
    setText(id, content[key]);
  }

  for (const [containerId, key] of config.paragraphTextTargets || []) {
    renderParagraphs(containerId, textToParagraphs(content[key]));
  }

  if (config.hasContact) {
    renderContact(content);
  }
}

async function renderSharedHero() {
  const hero = await loadTextMap(
    {
      companyName: "tekstit/vasen-palsta/01-toiminimen-otsikko.txt",
      subtitle: "tekstit/vasen-palsta/02-alaotsikko.txt",
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
