"""Public pages: home, 3D hero controls, trip search, themes and small screens."""
from conftest import BASE, new_page


def test_home_hero_search_and_pause(browser, page_errors):
    page = new_page(browser, page_errors, reduced_motion="no-preference")
    page.goto(BASE)
    page.wait_for_load_state("networkidle")
    assert page.get_by_role("heading", level=1).inner_text().startswith("Your journey")
    pause = page.get_by_role("button", name="Pause motion")
    pause.click()
    assert page.get_by_role("button", name="Play motion").get_attribute("aria-pressed") == "true"
    page.get_by_label("To", exact=True).fill("Kumasi")
    page.get_by_role("button", name="Find available trips").first.click()
    page.wait_for_url("**/trips?destination=Kumasi")
    page.wait_for_selector("article")
    assert "Kumasi" in page.locator("article").first.inner_text()
    assert not page_errors


def test_reduced_motion_hides_pause_control(browser):
    page = new_page(browser, reduced_motion="reduce")
    page.goto(BASE)
    page.wait_for_load_state("networkidle")
    assert page.get_by_role("button", name="Pause motion").count() == 0


def test_filters_and_empty_state(browser):
    page = new_page(browser)
    page.goto(f"{BASE}/trips")
    page.wait_for_selector("article")
    page.get_by_role("button", name="Campus shuttle").click()
    page.wait_for_timeout(500)
    texts = page.locator("article").all_inner_texts()
    assert texts and all("Campus shuttle" in t for t in texts)
    page.goto(f"{BASE}/trips?destination=Nowhere")
    page.wait_for_selector("text=No trips match those details.")


def test_dark_theme_applies(browser):
    page = new_page(browser, color_scheme="dark")
    page.goto(f"{BASE}/trips")
    page.wait_for_load_state("networkidle")
    assert page.evaluate("document.documentElement.dataset.theme") == "dark"
    bg = page.evaluate("getComputedStyle(document.body).backgroundColor")
    assert bg in ("rgb(11, 16, 38)",), bg


def test_no_horizontal_scroll_on_small_phones(browser):
    for vp in ({"width": 375, "height": 740}, {"width": 740, "height": 375}):
        page = new_page(browser, viewport=vp)
        for path in ("/", "/trips", "/auth/register", "/help"):
            page.goto(BASE + path)
            page.wait_for_load_state("networkidle")
            over = page.evaluate("document.documentElement.scrollWidth - innerWidth")
            assert over <= 1, f"{path} overflows by {over}px at {vp}"
