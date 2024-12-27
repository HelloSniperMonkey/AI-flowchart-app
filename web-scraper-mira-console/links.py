from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys

# Configure Chrome options
# chrome_options = Options()
# # chrome_options.add_argument("--headless")  # Run in headless mode (optional)
# chrome_options.add_argument("--disable-gpu")
# chrome_options.add_argument("--no-sandbox")

# # Set the path to your ChromeDriver
# driver_path = "chromedriver"

# # Initialize the WebDriver
# service = Service(executable_path="chromedriver")
# driver = webdriver.Chrome(service=service, options=chrome_options)

# Open the URL
url = "https://console.mira.network/"
# driver.get(url)

service = Service(executable_path="chromedriver")
driver = webdriver.Chrome()
driver.get(url)

# Wait for the page to load (you can adjust time as needed)
driver.implicitly_wait(60)

# Locate all links inside the specified class path
link_elements = driver.find_elements(By.CSS_SELECTOR, "div.grid a")

# Extract the href attribute from each link
links = [link.get_attribute("href") for link in link_elements]

# Print the scraped links
for link in links:
    print(link)

# Quit the WebDriver
driver.quit()
