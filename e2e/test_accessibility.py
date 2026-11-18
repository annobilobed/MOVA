"""Automated WCAG 2.2 AA checks (axe-core) on key screens, light and dark."""
import pytest
from axe_playwright_python.sync_playwright import Axe

from conftest import BASE, new_page, sign_in

PUBLIC = ["/", "/trips", "/auth/sign-in", "/auth/register", "/help"]
STAFF = [("student@demo.mova", "/dashboard"), ("student@demo.mova", "/tickets"), ("driver2@demo.mova", "/driver"), ("operator@demo.mova", "/operator/trips"), ("admin@demo.mova", "/admin/users")]
axe = Axe()
OPTIONS = {"runOnly": {"type": "tag", "values": ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]}}


def serious(results):
    return [v for v in results.response["violations"] if v["impact"] in ("serious", "critical")]


@pytest.mark.parametrize("scheme", ["light", "dark"])
@pytest.mark.parametrize("path", PUBLIC)
def test_public_pages(browser, scheme, path):
    page = new_page(browser, color_scheme=scheme, viewport={"width": 375, "height": 740})
    page.goto(BASE + path)
    page.wait_for_load_state("networkidle")
    found = serious(axe.run(page, options=OPTIONS))
    assert not found, [(v["id"], v["nodes"][0]["target"]) for v in found]


@pytest.mark.parametrize("user,path", STAFF)
def test_signed_in_pages(browser, user, path):
    page = new_page(browser, viewport={"width": 1280, "height": 860})
    sign_in(page, user)
    page.goto(BASE + path)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(600)
    found = serious(axe.run(page, options=OPTIONS))
    assert not found, [(v["id"], v["nodes"][0]["target"]) for v in found]
