from playwright.sync_api import sync_playwright
import time

def take_screenshots():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Screenshot Zomato
        page.goto("http://localhost:5173/score/zomato")
        time.sleep(2) # wait for fetch and render
        page.screenshot(path="screenshot_zomato.png", full_page=True)
        
        # Screenshot Byjus
        page.goto("http://localhost:5173/score/byjus")
        time.sleep(2)
        page.screenshot(path="screenshot_byjus.png", full_page=True)
        
        # Screenshot randomapp
        page.goto("http://localhost:5173/score/randomapp")
        time.sleep(2)
        page.screenshot(path="screenshot_randomapp.png", full_page=True)
        
        browser.close()

if __name__ == "__main__":
    take_screenshots()
