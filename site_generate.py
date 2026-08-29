from pathlib import Path
import re
from bs4 import BeautifulSoup

# ============================================================
# CONFIGURATION
# ============================================================

SOURCE_FILE = Path("site.html")
BASE_URL = "https://devbrazil.com"
DEFAULT_LANGUAGE = "en"

LANGUAGES = {
    "en": {"html_lang": "en",    "folder": "en", "url": "/en/"},
    "pt": {"html_lang": "pt-BR", "folder": "pt", "url": "/pt/"},
    "es": {"html_lang": "es",    "folder": "es", "url": "/es/"},
    "fr": {"html_lang": "fr",    "folder": "fr", "url": "/fr/"},
    "de": {"html_lang": "de",    "folder": "de", "url": "/de/"},
}

# ============================================================
# TRANSLATIONS
# ============================================================

def apply_translation(soup, language):
    """
    Replace only elements that have data-XX attributes.
    The original HTML is parsed again for every language,
    so no language is lost during generation.

    This intentionally uses inner HTML from the translation
    value, preserving things such as:
        <i class="fab fa-windows"></i>
        <strong>...</strong>
        &nbsp;
    """

    attr = f"data-{language}"

    for element in soup.find_all():

        if not element.has_attr(attr):
            continue

        value = element.get(attr)

        if value is None:
            continue

        translated = BeautifulSoup(value, "html.parser")

        # Do NOT use element.clear() before extracting the value.
        # The translated value has already been parsed independently.
        element.clear()

        for child in list(translated.contents):
            element.append(child)

    # Once the correct language has been inserted, remove the
    # multilingual data attributes from the generated page.
    for element in soup.find_all():

        for lang in LANGUAGES:
            data_attr = f"data-{lang}"

            if element.has_attr(data_attr):
                del element.attrs[data_attr]


def apply_placeholders(soup, language):
    """
    Supports data-placeholder-en, data-placeholder-pt, etc.,
    if they exist in the source HTML.
    """

    attr = f"data-placeholder-{language}"

    for element in soup.find_all():

        if element.has_attr(attr):
            element["placeholder"] = element.get(attr)

    for element in soup.find_all():

        for lang in LANGUAGES:
            data_attr = f"data-placeholder-{lang}"

            if element.has_attr(data_attr):
                del element.attrs[data_attr]


# ============================================================
# LANGUAGE / URL
# ============================================================

def set_html_language(soup, language):
    if soup.html:
        soup.html["lang"] = LANGUAGES[language]["html_lang"]


def fix_language_menu(soup):
    """
    Convert the existing onclick="changeLanguage('xx')"
    menu entries into real URLs.

    This is important for SEO and also makes language switching
    work even without JavaScript.
    """

    for link in soup.find_all("a"):

        onclick = link.get("onclick", "")

        for language in LANGUAGES:

            if f"changeLanguage('{language}')" not in onclick:
                continue

            if language == DEFAULT_LANGUAGE:
                link["href"] = "/"
            else:
                link["href"] = f"/{language}/"

            # Remove javascript navigation.
            # The visible flag/text/icon remain untouched.
            if "onclick" in link.attrs:
                del link.attrs["onclick"]

            break


# ============================================================
# PATHS
# ============================================================

def is_relative_asset(value):
    if not value:
        return False

    excluded = (
        "http://",
        "https://",
        "//",
        "/",
        "#",
        "mailto:",
        "javascript:",
        "data:",
        "../",
    )

    return not value.startswith(excluded)


def fix_relative_paths(soup, nested):
    """
    Pages inside /en/, /pt/, etc. need ../ for local assets.
    Root /site.html does not.
    """

    if not nested:
        return

    for element in soup.find_all():

        for attribute in ("src", "href"):

            if not element.has_attr(attribute):
                continue

            value = element.get(attribute)

            if is_relative_asset(value):
                element[attribute] = "../" + value


# ============================================================
# LANGUAGE PILL (active state)
# ============================================================

def set_active_language_pill(soup, language):
    """
    Marks the <a class="lang-pill" data-lang="xx"> that matches the
    page's language with class="active", so the correct pill is
    highlighted server-side (works even without JavaScript).
    """

    for pill in soup.find_all("a", class_="lang-pill"):

        classes = pill.get("class", [])

        if "active" in classes:
            classes.remove("active")

        if pill.get("data-lang") == language:
            classes.append("active")

        pill["class"] = classes


# ============================================================
# SEO
# ============================================================

def add_seo(soup, language):
    if not soup.head:
        return

    # Remove existing canonical/hreflang tags so generation is repeatable.
    for link in list(soup.head.find_all("link")):

        rel = link.get("rel", [])

        if "canonical" in rel or link.has_attr("hreflang"):
            link.decompose()

    canonical_url = BASE_URL + LANGUAGES[language]["url"]

    canonical = soup.new_tag(
        "link",
        rel="canonical",
        href=canonical_url
    )

    soup.head.append(canonical)

    for lang, info in LANGUAGES.items():

        alternate = soup.new_tag(
            "link",
            rel="alternate",
            hreflang=info["html_lang"],
            href=BASE_URL + info["url"]
        )

        soup.head.append(alternate)

    # Default version = English root URL.
    x_default = soup.new_tag(
        "link",
        rel="alternate",
        hreflang="x-default",
        href=BASE_URL + "/"
    )

    soup.head.append(x_default)


# ============================================================
# PAGE GENERATION
# ============================================================

def generate_page(source_html, language, output_file, nested):
    print(f"Generating {output_file} -> {language}")

    # IMPORTANT:
    # Every page starts from the ORIGINAL source HTML.
    soup = BeautifulSoup(source_html, "html.parser")

    set_html_language(soup, language)

    apply_translation(soup, language)

    apply_placeholders(soup, language)

    fix_language_menu(soup)

    set_active_language_pill(soup, language)

    fix_relative_paths(soup, nested)

    add_seo(soup, language)

    output_file.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    output_file.write_text(
        str(soup),
        encoding="utf-8"
    )


# ============================================================
# SITEMAP
# ============================================================

def generate_sitemap():
    print("Generating sitemap.xml")

    urls = [BASE_URL + "/"]

    for language, info in LANGUAGES.items():

        if language != DEFAULT_LANGUAGE:
            urls.append(BASE_URL + info["url"])

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    for url in urls:
        lines.append("    <url>")
        lines.append(f"        <loc>{url}</loc>")
        lines.append("    </url>")

    lines.append("</urlset>")

    Path("sitemap.xml").write_text(
        "\n".join(lines),
        encoding="utf-8"
    )


# ============================================================
# ROBOTS
# ============================================================

def generate_robots():
    print("Generating robots.txt")

    Path("robots.txt").write_text(
        f"""User-agent: *
Allow: /

Sitemap: {BASE_URL}/sitemap.xml
""",
        encoding="utf-8"
    )


# ============================================================
# MAIN
# ============================================================

def main():

    if not SOURCE_FILE.exists():
        print("ERROR: site.html was not found.")
        print("Put generate_site.py in the same folder as your original site.html.")
        return

    # Read the ORIGINAL file once.
    # Never read a generated page as the source.
    source_html = SOURCE_FILE.read_text(
        encoding="utf-8"
    )

    print()
    print("==========================================")
    print(" DevBrazil multilingual site generator")
    print("==========================================")
    print()

    # Root = English default
    generate_page(
        source_html,
        "en",
        Path("index.html"),
        nested=False
    )

    # English
    generate_page(
        source_html,
        "en",
        Path("en/index.html"),
        nested=True
    )

    # Portuguese
    generate_page(
        source_html,
        "pt",
        Path("pt/index.html"),
        nested=True
    )

    # Spanish
    generate_page(
        source_html,
        "es",
        Path("es/index.html"),
        nested=True
    )

    # French
    generate_page(
        source_html,
        "fr",
        Path("fr/index.html"),
        nested=True
    )

    # German
    generate_page(
        source_html,
        "de",
        Path("de/index.html"),
        nested=True
    )

    generate_sitemap()
    generate_robots()

    print()
    print("==========================================")
    print(" Generation completed.")
    print("==========================================")
    print()
    print("Generated:")
    print("  /          English")
    print("  /en/       English")
    print("  /pt/       Portuguese")
    print("  /es/       Spanish")
    print("  /fr/       French")
    print("  /de/       German")
    print()


if __name__ == "__main__":
    main()
