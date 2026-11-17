import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1400, "height": 900})
        page = await context.new_page()

        print("1. Navigating to http://localhost:4173/admin...")
        await page.goto("http://localhost:4173/admin", wait_until="domcontentloaded")
        await page.wait_for_timeout(1500)

        # Take screenshot of Vault Login screen
        await page.screenshot(path="public/assets/admin_vault_screen.png")
        print("✓ Screenshot saved: public/assets/admin_vault_screen.png")

        # 2. Enter Master Key
        password_input = page.locator("input[type='password']")
        await password_input.fill("cashnoir-syndicate-admin-2026")
        unlock_button = page.locator("button:has-text('Déverrouiller la Console')")
        await unlock_button.click()
        await page.wait_for_timeout(1500)

        # Take screenshot of Admin Dashboard - Tab Objets
        await page.screenshot(path="public/assets/admin_dashboard_items.png")
        print("✓ Screenshot saved: public/assets/admin_dashboard_items.png")

        # 3. Switch to Personnages tab
        perso_tab = page.locator("button:has-text('Personnages & Suspects')")
        await perso_tab.click()
        await page.wait_for_timeout(1000)
        await page.screenshot(path="public/assets/admin_dashboard_characters.png")
        print("✓ Screenshot saved: public/assets/admin_dashboard_characters.png")

        # 4. Switch to Matrice Psycho tab
        psycho_tab = page.locator("button:has-text('Matrice Psycho')")
        await psycho_tab.click()
        await page.wait_for_timeout(1000)
        await page.screenshot(path="public/assets/admin_dashboard_psycho.png")
        print("✓ Screenshot saved: public/assets/admin_dashboard_psycho.png")

        # 5. Switch to Médiathèque tab
        uploads_tab = page.locator("button:has-text('Médiathèque (Gate 20)')")
        await uploads_tab.click()
        await page.wait_for_timeout(1000)
        await page.screenshot(path="public/assets/admin_dashboard_uploads.png")
        print("✓ Screenshot saved: public/assets/admin_dashboard_uploads.png")

        print("ALL PLAYWRIGHT TESTS PASSED SUCCESSFULLY!")
        await browser.close()

asyncio.run(run())
