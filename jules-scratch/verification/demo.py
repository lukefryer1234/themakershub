from playwright.sync_api import sync_playwright
import time

def run(playwright):
    electron_app = playwright._electron.launch(
        executable_path="/app/the-makers-hub/out/make/zip/linux/x64/unzipped/the-makers-hub-linux-x64/the-makers-hub",
        record_video_dir="jules-scratch/verification/videos"
    )

    # Get the first window that the app opens
    window = electron_app.first_window()

    # Wait for the window to load
    time.sleep(5)

    # Navigate to Filament Inventory
    window.click('text=Filament Inventory')
    time.sleep(1)

    # Add a new filament
    window.fill('input[placeholder="Manufacturer"]', 'Polymaker')
    window.fill('input[placeholder="Material Type"]', 'PLA')
    window.fill('input[placeholder="Color"]', 'Blue')
    window.fill('input[placeholder="Spool Weight (g)"]', '1000')
    window.fill('input[placeholder="Purchase Price"]', '25')
    window.fill('input[placeholder="Remaining Weight (g)"]', '1000')
    window.fill('input[placeholder="Density (g/cm³)"]', '1.24')
    window.fill('input[placeholder="Diameter (mm)"]', '1.75')
    window.click('button:text("Add Filament")')
    time.sleep(2)

    # Navigate to Printer Manager
    window.click('text=Printer Manager')
    time.sleep(1)

    # Add a new printer
    window.fill('input[placeholder="Name"]', 'Prusa MK3S+')
    window.fill('input[placeholder="Model"]', 'MK3S+')
    window.click('button:text("Add Printer")')
    time.sleep(2)

    # Navigate to Print History
    window.click('text=Print History')
    time.sleep(1)

    # Add a new print log
    window.fill('input[placeholder="Title"]', 'Benchy')
    window.select_option('select', index=1) # Select printer
    window.select_option('select', index=1) # Select filament
    window.click('button:text("Add Log")')
    time.sleep(2)

    # Navigate to Failure Log
    window.click('text=Failure Log')
    time.sleep(1)

    # Add a new failure log
    window.fill('input[placeholder="Title"]', 'Failed Benchy')
    window.select_option('select', index=1) # Select printer
    window.select_option('select', index=1) # Select filament
    window.fill('textarea[placeholder="Suspected Cause & Notes"]', 'Spaghetti')
    window.click('button:text("Add Failure Log")')
    time.sleep(2)

    # Navigate to Calibration Lab
    window.click('text=Calibration Lab')
    time.sleep(1)

    # Generate G-code
    window.select_option('select', value='temperature')
    window.fill('input[placeholder="Start Value"]', '220')
    window.fill('input[placeholder="End Value"]', '190')
    window.fill('input[placeholder="Step Value"]', '-5')
    window.click('button:text("Generate G-Code")')
    time.sleep(2)
    window.click('button:text("Save G-Code")')
    time.sleep(2)

    # Navigate to Dashboard
    window.click('text=Dashboard')
    time.sleep(5)

    # Navigate to Settings
    window.click('text=Settings')
    time.sleep(2)

    # Close the application
    electron_app.close()

with sync_playwright() as playwright:
    run(playwright)
