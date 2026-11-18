"""Student journey: register, hold a seat, pay (test mode), ticket, add luggage."""
import re

from conftest import BASE, new_page, unique


def register(page, email):
    page.goto(f"{BASE}/auth/register")
    page.wait_for_load_state("networkidle")
    page.fill("input[name=fullName]", "Esi Test")
    page.fill("input[name=email]", email)
    page.fill("input[name=phone]", "024 555 7788")
    page.fill("input[name=studentId]", "PS/E2E/" + email.split("@")[0][-10:])
    page.fill("input[name=password]", "strongpass1")
    page.click("button[type=submit]")
    page.wait_for_url("**/dashboard")


def test_registration_validation_focuses_first_error(browser):
    page = new_page(browser)
    page.goto(f"{BASE}/auth/register")
    page.wait_for_load_state("networkidle")
    page.click("button[type=submit]")
    page.wait_for_selector("text=Enter your full name")
    assert page.evaluate("document.activeElement.name") == "fullName"
    # show/hide password
    pw = page.locator("input[name=password]")
    page.get_by_role("button", name="Show password").click()
    assert pw.get_attribute("type") == "text"


def test_book_pay_ticket_and_add_luggage(browser, page_errors):
    page = new_page(browser, page_errors, viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    register(page, f"{unique('book')}@student.test")
    page.goto(f"{BASE}/trips?destination=Accra")
    page.locator("article a").first.click()
    page.wait_for_selector("[aria-label='Seat map']")
    seat = page.locator("button[aria-label$=', Available']").nth(12)
    number = re.search(r"Seat (\w+)", seat.get_attribute("aria-label")).group(1)
    seat.click()
    page.wait_for_selector("[role=timer]")
    page.wait_for_selector(f"text=Seat {number} selected")
    page.get_by_text("Luggage rules").wait_for()
    page.get_by_role("button", name=re.compile("Continue to payment")).click()
    page.wait_for_url("**/checkout/test/**")
    page.get_by_role("button", name="Simulate successful payment").click()
    page.wait_for_selector("text=Your booking is confirmed.")
    assert page.locator("[aria-label^='QR code']").count() == 1
    page.get_by_role("link", name=re.compile("Go to My tickets")).click()
    page.locator("a[href^='/tickets/']").first.click()
    page.get_by_role("button", name="Add luggage").click()
    page.get_by_role("button", name=re.compile(r"Pay GH")).click()
    page.wait_for_url("**/checkout/test/**")
    page.get_by_role("button", name="Simulate successful payment").click()
    page.wait_for_selector("text=Luggage added to your ticket.")
    assert not page_errors


def test_failed_payment_keeps_seat_held(browser):
    page = new_page(browser)
    register(page, f"{unique('fail')}@student.test")
    page.goto(f"{BASE}/trips?destination=Takoradi")
    page.locator("article a").first.click()
    page.locator("button[aria-label$=', Available']").nth(20).click()
    page.wait_for_selector("[role=timer]")
    page.get_by_role("button", name=re.compile("Continue to payment")).click()
    page.get_by_role("button", name="Simulate failed payment").click()
    page.wait_for_selector("text=Payment wasn't completed.")
    page.wait_for_selector("text=Your seat is still held")
