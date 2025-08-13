from playwright.sync_api import sync_playwright
import time

def run(playwright):
    electron_app = playwright._electron.launch(
        executable_path="/app/the-makers-hub/out/make/zip/linux/x64/unzipped/the-makers-hub-linux-x64/the-makers-hub"
    )

    # Get the first window that the app opens
    window = electron_app.first_window()

    # Wait for the window to load
    time.sleep(5)

    # Take a screenshot
    window.screenshot(path="jules-scratch/verification/screenshot.png")

    # Close the application
    electron_app.close()

with sync_playwright() as playwright:
    run(playwright)
