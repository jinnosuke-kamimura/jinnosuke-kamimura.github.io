(function () {
  "use strict";

  const siteContent = window.siteContent || {};
  let content = siteContent;
  const languageStorageKey = "jinnosuke-language";

  function query(selector) {
    return document.querySelector(selector);
  }

  function setText(selector, value) {
    const element = query(selector);
    if (element && value) {
      element.textContent = value;
    }
  }

  function getStoredLanguage() {
    try {
      const storedLanguage = window.localStorage.getItem(languageStorageKey);
      return siteContent.languages && siteContent.languages[storedLanguage] ? storedLanguage : null;
    } catch (error) {
      return null;
    }
  }

  function getTranslation(key) {
    return key.split(".").reduce(function (value, part) {
      return value && value[part];
    }, content.ui || {});
  }

  function getLinks() {
    return Array.isArray(siteContent.links) ? siteContent.links : Array.isArray(content.links) ? content.links : [];
  }

  function getActiveLanguage() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function updateLanguageToggle() {
    const languageToggle = query("[data-language-toggle]");
    if (!languageToggle) {
      return;
    }
    const englishActive = getActiveLanguage() === "en";
    languageToggle.setAttribute("aria-pressed", String(englishActive));
    languageToggle.setAttribute(
      "aria-label",
      englishActive ? getTranslation("language.toJapanese") : getTranslation("language.toEnglish")
    );
    const label = languageToggle.querySelector("[data-language-label]");
    if (label) {
      label.textContent = englishActive ? "日本語" : "English";
    }
  }

  function renderLanguage() {
    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      const value = getTranslation(element.dataset.i18n);
      if (value === undefined || value === null) {
        return;
      }
      const attribute = element.dataset.i18nAttr;
      if (attribute) {
        element.setAttribute(attribute, value);
      } else {
        element.textContent = value;
      }
    });
    updateLanguageToggle();
  }

  function setLanguage(nextLanguage) {
    const language = siteContent.languages && siteContent.languages[nextLanguage] ? nextLanguage : "ja";
    content = siteContent.languages[language];
    document.documentElement.lang = language;
    renderLanguage();
    renderProfile();
    renderThemes();
    renderPublications();
    renderFellowships();
    renderAwards();
    renderProjects();
    renderTimeline();
    renderContact();
    try {
      window.localStorage.setItem(languageStorageKey, language);
    } catch (error) {
      // Private browsing can deny localStorage; the current page still changes.
    }
  }

  function initLanguage() {
    const storedLanguage = getStoredLanguage();
    const initialLanguage = storedLanguage || siteContent.defaultLanguage || "ja";
    setLanguage(initialLanguage);
    const languageToggle = query("[data-language-toggle]");
    if (languageToggle) {
      languageToggle.addEventListener("click", function () {
        setLanguage(getActiveLanguage() === "en" ? "ja" : "en");
      });
    }
  }

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (text) {
      element.textContent = text;
    }
    return element;
  }

  function createExternalArrow() {
    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    arrow.classList.add("link-arrow");
    arrow.setAttribute("viewBox", "0 0 24 24");
    arrow.setAttribute("aria-hidden", "true");
    arrow.setAttribute("focusable", "false");
    arrow.setAttribute("fill", "none");
    arrow.setAttribute("stroke", "currentColor");
    arrow.setAttribute("stroke-width", "2");
    arrow.setAttribute("stroke-linecap", "round");
    arrow.setAttribute("stroke-linejoin", "round");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M5 19L19 5M9 5H19V15");
    arrow.append(path);
    return arrow;
  }

  function createExternalLink(label, href, className) {
    if (!href) {
      return null;
    }
    const link = createElement("a", className || "inline-link");
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.append(document.createTextNode(label));
    link.append(createExternalArrow());
    return link;
  }

  function emptyState(message, className) {
    return createElement("p", className || "empty-state", message);
  }

  function renderCollection(target, items, renderItem, message, className) {
    if (!target) {
      return;
    }
    target.replaceChildren();
    if (!Array.isArray(items) || items.length === 0) {
      target.append(emptyState(message, className));
      return;
    }
    items.forEach(function (item) {
      const rendered = renderItem(item);
      if (rendered) {
        target.append(rendered);
      }
    });
  }

  function renderProfile() {
    const profile = content.profile || {};
    setText("[data-profile-role]", profile.role);
    renderProfileAffiliation(profile);
    setText("[data-profile-summary]", profile.summary);
    setText("[data-profile-position]", profile.positionLabel || profile.role);
    setText("[data-profile-affiliation-short]", profile.affiliation);
    setText("[data-profile-lab]", profile.lab);
    setText("[data-profile-email-text]", profile.email);
    const labLink = query("[data-profile-lab]");
    if (labLink && profile.labUrl) {
      labLink.href = profile.labUrl;
    }

    const linksTarget = query("[data-profile-links]");
    const links = getLinks();
    if (linksTarget) {
      linksTarget.replaceChildren();
      links.forEach(function (item) {
        const link = createExternalLink(item.label, item.href, "button button--primary");
        if (link) {
          linksTarget.append(link);
        }
      });
    }
  }

  function renderProfileAffiliation(profile) {
    const target = query("[data-profile-affiliation]");
    if (!target) {
      return;
    }
    target.replaceChildren();
    if (profile.affiliation) {
      target.append(document.createTextNode(profile.affiliation));
    }
    if (profile.department) {
      target.append(document.createElement("br"));
      target.append(document.createTextNode(profile.department));
    }
  }

  function renderThemes() {
    renderCollection(
      query("[data-research-themes]"),
      content.researchThemes,
      function (item) {
        const article = createElement("article", "theme-card");
        article.append(createElement("p", "theme-card__index", item.index || "01"));
        article.append(createElement("h3", "theme-card__title", item.title));
        if (item.description) {
          article.append(createElement("p", "theme-card__description", item.description));
        }
        return article;
      },
      content.ui.research.empty
    );
  }

  function createPublicationCard(item, featured) {
    const article = createElement("article", featured ? "publication-card publication-card--featured" : "publication-card");
    const reference = createElement("p", "publication-card__reference");
    const japanese = getActiveLanguage() === "ja";
    const separator = japanese ? "，" : ", ";
    const englishTitle = /^[\x00-\x7F]+$/.test(String(item.title || "").trim());
    const openQuote = japanese && !englishTitle ? "「" : "“";
    const closeQuote = japanese && !englishTitle ? "」" : "”";
    reference.append(renderPublicationAuthors(item.authors));
    reference.append(document.createTextNode(separator));
    reference.append(createElement("span", "publication-card__title", openQuote + item.title + closeQuote));
    if (item.citation) {
      reference.append(document.createTextNode(separator));
      reference.append(createElement("span", "publication-card__citation", item.citation));
    }
    article.append(reference);
    const visibleLinks = Array.isArray(item.links)
      ? item.links.filter(function (linkItem) {
          return linkItem.label !== "researchmap";
        })
      : [];
    if (visibleLinks.length) {
      const links = createElement("div", "card-links");
      visibleLinks.forEach(function (linkItem) {
        const link = createExternalLink(linkItem.label, linkItem.href, "text-link");
        if (link) {
          links.append(link);
        }
      });
      article.append(links);
    }
    return article;
  }

  function renderPublicationAuthors(authors) {
    const authorsElement = createElement("span", "publication-card__authors");
    const highlightedNames = ["上村仁之介", "Jinnosuke Kamimura"];
    let remainingAuthors = String(authors || "");
    while (remainingAuthors) {
      const nextMatch = highlightedNames
        .map(function (name) {
          return { name: name, index: remainingAuthors.indexOf(name) };
        })
        .filter(function (match) {
          return match.index >= 0;
        })
        .sort(function (left, right) {
          return left.index - right.index;
        })[0];
      if (!nextMatch) {
        authorsElement.append(document.createTextNode(remainingAuthors));
        break;
      }
      authorsElement.append(document.createTextNode(remainingAuthors.slice(0, nextMatch.index)));
      authorsElement.append(createElement("strong", null, nextMatch.name));
      remainingAuthors = remainingAuthors.slice(nextMatch.index + nextMatch.name.length);
    }
    return authorsElement;
  }

  function renderPublications() {
    renderCollection(
      query("[data-international-conferences]"),
      content.internationalConferences,
      function (item) {
        return createPublicationCard(item, true);
      },
      content.ui.publications.featuredEmpty
    );
    renderCollection(
      query("[data-domestic-conferences]"),
      content.domesticConferences,
      function (item) {
        return createPublicationCard(item, false);
      },
      content.ui.publications.empty,
      "empty-state empty-state--line"
    );
    renderCollection(
      query("[data-journals]"),
      content.journals,
      function (item) {
        return createPublicationCard(item, false);
      },
      content.ui.publications.empty,
      "empty-state empty-state--line"
    );
  }

  function createRecognitionCard(item) {
    const article = createElement("article", "award-card");
    const reference = createElement("p", "award-reference");
    const japanese = getActiveLanguage() === "ja";
    const separator = japanese ? "，" : ", ";
    const openQuote = japanese ? "「" : "“";
    const closeQuote = japanese ? "」" : "”";
    const punctuation = japanese ? "．" : ".";
    const detailValue = item.theme || item.detail;
    const detailLabel = item.detailLabel || (item.theme ? content.ui.awards.themeLabel : content.ui.awards.issuedBy);
    const normalizedDetailLabel = japanese ? String(detailLabel || "").replace(/[：:]$/, "") : detailLabel;

    if (item.issuer) {
      reference.append(createElement("span", "award-reference__issuer", item.issuer));
      reference.append(document.createTextNode(separator));
    }
    reference.append(createElement("span", "award-reference__title", item.title));
    if (detailValue) {
      reference.append(document.createTextNode(separator));
      if (normalizedDetailLabel) {
        reference.append(createElement("span", "award-reference__label", normalizedDetailLabel));
        reference.append(document.createTextNode(japanese ? "" : " "));
      }
      reference.append(createElement("span", "award-reference__detail", openQuote + detailValue + closeQuote));
    }
    if (item.year) {
      reference.append(document.createTextNode(separator));
      reference.append(createElement("span", "award-reference__year", item.year + punctuation));
    }
    article.append(reference);
    if (item.source) {
      const sourceLink = createExternalLink(content.ui.awards.sourceLink, item.source, "text-link");
      if (sourceLink) {
        article.append(sourceLink);
      }
    }
    return article;
  }

  function renderFellowships() {
    renderCollection(
      query("[data-fellowships]"),
      content.fellowships,
      createRecognitionCard,
      content.ui.fellowships.empty
    );
  }

  function renderAwards() {
    renderCollection(
      query("[data-awards]"),
      content.awards,
      createRecognitionCard,
      content.ui.awards.empty
    );
  }

  function renderProjects() {
    renderCollection(
      query("[data-projects]"),
      content.projects,
      function (item) {
        const article = createElement("article", "project-card");
        article.append(createElement("p", "project-card__type", item.type || "Project"));
        article.append(createElement("h3", "project-card__title", item.title));
        article.append(createElement("p", "project-card__summary", item.summary));
        if (item.href) {
          const link = createExternalLink(item.linkLabel || "View project", item.href, "text-link");
          if (link) {
            article.append(link);
          }
        }
        return article;
      },
      content.ui.projects.empty
    );
  }

  function renderTimeline() {
    renderCollection(
      query("[data-timeline]"),
      content.timeline,
      function (item) {
        const article = createElement("article", "timeline-item");
        article.append(createElement("p", "timeline-item__period", item.period));
        const body = createElement("div", "timeline-item__body");
        body.append(createElement("h3", null, item.title));
        body.append(createElement("p", null, item.organization));
        if (item.detail) {
          body.append(createElement("p", "timeline-item__detail", item.detail));
        }
        article.append(body);
        return article;
      },
      content.ui.experience.empty
    );
  }

  function renderContact() {
    const target = query("[data-contact-links]");
    if (!target) {
      return;
    }
    target.replaceChildren();
    const links = getLinks();
    links.forEach(function (item) {
      const link = createExternalLink(item.label, item.href, "contact-link");
      if (link) {
        target.append(link);
      }
    });
    if (links.length === 0) {
      target.append(createElement("p", "contact-note", content.ui.contact.empty));
    }
  }

  function init() {
    initLanguage();
    setText("[data-current-year]", String(new Date().getFullYear()));
  }

  document.addEventListener("DOMContentLoaded", init);
})();
