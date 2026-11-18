"""Shared fixtures for MOVA browser tests (Python Playwright, per the webapp-testing skill).

Run with e2e/run.sh, which starts the API and web servers via with_server.py.
"""
import os
import subprocess
import time

import pytest
from playwright.sync_api import Browser, sync_playwright

BASE = os.environ.get("MOVA_WEB", "http://localhost:3000")
API = os.environ.get("MOVA_API", "http://localhost:4000")
DEMO_PASSWORD = "MovaDemo2026!"
CHROME = os.environ.get("CHROME_PATH") or next(
    (p for p in ["/opt/pw-browsers/chromium-1243/chrome-linux64/chrome"] if os.path.exists(p)), None
)


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        b: Browser = p.chromium.launch(headless=True, executable_path=CHROME) if CHROME else p.chromium.launch(headless=True)
        yield b
        b.close()


@pytest.fixture
def page_errors():
    return []


def new_page(browser, errors=None, **ctx):
    ctx.setdefault("viewport", {"width": 1280, "height": 860})
    ctx.setdefault("reduced_motion", "reduce")
    context = browser.new_context(**ctx)
    page = context.new_page()
    if errors is not None:
        page.on("pageerror", lambda e: errors.append(str(e)))
    return page


def sign_in(page, email):
    page.goto(f"{BASE}/auth/sign-in")
    page.wait_for_load_state("networkidle")
    page.fill("input[name=email]", email)
    page.fill("input[name=password]", DEMO_PASSWORD)
    page.click("button[type=submit]")
    page.wait_for_url(lambda url: "/auth/sign-in" not in url, timeout=20000)
    page.wait_for_load_state("networkidle")


def unique(prefix="t"):
    return f"{prefix}{int(time.time() * 1000)}"


def psql(sql):
    """Read a value from the dev database (used only to fetch a ticket token for the driver scan)."""
    return subprocess.check_output(["su", "postgres", "-c", f'psql -d mova -tAc "{sql}"']).decode().strip()
