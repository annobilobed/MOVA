"""Driver, operator and admin journeys, plus role protection."""
import re

from conftest import BASE, new_page, psql, sign_in, unique
from test_booking import register


def book_kumasi(browser):
    page = new_page(browser)
    email = f"{unique('drv')}@student.test"
    register(page, email)
    page.goto(f"{BASE}/trips?destination=Kumasi")
    page.locator("article a").first.click()
    page.locator("button[aria-label$=', Available']").nth(5).click()
    page.wait_for_selector("[role=timer]")
    page.get_by_role("button", name=re.compile("Continue to payment")).click()
    page.get_by_role("button", name="Simulate successful payment").click()
    page.wait_for_selector("text=Your booking is confirmed.")
    row = psql(f"SELECT b.qr_token||'|'||b.trip_id FROM bookings b JOIN users u ON u.id=b.user_id WHERE u.email='{email}'")
    return row.split("|")


def test_driver_scans_once_and_sees_identity(browser):
    token, trip_id = book_kumasi(browser)
    page = new_page(browser, viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    sign_in(page, "driver2@demo.mova")
    page.goto(f"{BASE}/driver/scan?trip={trip_id}")
    page.fill("#manual-code", f"MOVA1:{token}")
    page.get_by_role("button", name="Check").click()
    page.wait_for_selector("text=Valid ticket")
    assert page.get_by_text(re.compile("Student ID PS/E2E/")).count() == 1
    page.get_by_role("button", name="Scan next ticket").click()
    page.fill("#manual-code", f"MOVA1:{token}")
    page.get_by_role("button", name="Check").click()
    page.wait_for_selector("text=Scanned before")
    page.get_by_role("button", name="Scan next ticket").click()
    page.fill("#manual-code", "MOVA1:not-a-ticket")
    page.get_by_role("button", name="Check").click()
    page.wait_for_selector("text=Invalid ticket")


def test_driver_passenger_list(browser):
    page = new_page(browser)
    sign_in(page, "driver2@demo.mova")
    page.get_by_role("button", name=re.compile("Passenger list")).first.click()
    page.wait_for_selector("text=Reference only")


def test_operator_creates_and_cancels_a_trip(browser):
    page = new_page(browser, viewport={"width": 1440, "height": 900})
    sign_in(page, "operator@demo.mova")
    page.goto(f"{BASE}/operator/trips")
    page.wait_for_selector("table")
    page.locator("select[name=busId]").select_option(index=1)
    dest = f"Winneba {unique('')[-5:]}"
    page.fill("input[name=origin]", "Cape Coast (UCC)")
    page.fill("input[name=destination]", dest)
    page.fill("input[name=departureAt]", "2027-03-01T08:00")
    page.fill("input[name=fareGhs]", "45")
    page.get_by_role("button", name="Create trip").click()
    page.wait_for_selector(f"text=Trip to {dest} created.")
    row = page.locator("tr", has_text=dest)
    row.get_by_role("button", name="Cancel trip").click()
    page.get_by_label("Reason passengers will see").fill("Bus breakdown")
    page.get_by_role("button", name="Cancel and refund").click()
    page.wait_for_timeout(800)
    assert "Cancelled" in page.locator("tr", has_text=dest).inner_text()


def test_operator_manifest_and_admin(browser):
    page = new_page(browser, viewport={"width": 1440, "height": 900})
    sign_in(page, "operator@demo.mova")
    page.goto(f"{BASE}/operator/trips")
    page.locator("tr", has_text="Kumasi").get_by_role("link", name="Manifest").first.click()
    page.wait_for_selector("text=MOVA passenger manifest")
    admin = new_page(browser, viewport={"width": 1440, "height": 900})
    sign_in(admin, "admin@demo.mova")
    admin.goto(f"{BASE}/admin/users")
    admin.wait_for_selector("table")
    assert admin.locator("tbody tr").count() > 3


def test_students_cannot_open_staff_areas(browser):
    page = new_page(browser)
    sign_in(page, "student@demo.mova")
    for path in ("/operator", "/admin", "/driver"):
        page.goto(BASE + path)
        page.wait_for_selector("text=This area isn't available for your account")
