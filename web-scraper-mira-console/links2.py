import csv
import json
import re
import urllib.parse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def read_urls_from_csv(input_csv):
    urls = []
    with open(input_csv, 'r') as file:
        reader = csv.reader(file)
        for row in reader:
            urls.append(row[0])
    return urls

def extract_fields(text):
    # Extract all field names and their empty values
    matches = re.finditer(r'"([^"]+)":\s*"([^"]*)"', text)
    fields = {}
    for match in matches:
        field_name = match.group(1)
        field_value = match.group(2)
        fields[field_name] = field_value
    return fields

def write_results_to_csv(output_csv, results):
    # Get all unique field names from all results
    all_fields = set()
    for result in results:
        all_fields.update(result.get("fields", {}).keys())
    
    with open(output_csv, 'w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["URL"] + list(all_fields))
        for result in results:
            row = [result["URL"]]
            fields = result.get("fields", {})
            row.extend(fields.get(field, "") for field in all_fields)
            writer.writerow(row)

def extract_span_data(driver, url):
    try:
        driver.get(url)
        wait = WebDriverWait(driver, 10)
        pre = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "shiki.dark-plus")))
        
        spans = pre.find_elements(By.CLASS_NAME, "line")
        
        # Initialize result dictionary
        result = {"URL": url}
        
        # Combine relevant spans into a single string
        combined_text = ""
        for i, span in enumerate(spans):
            if i >= 5 and i < len(spans) - 2:
                span_text = span.text.strip()
                combined_text += " " + span_text
        
        # Extract all fields
        fields = extract_fields(combined_text)
        result["fields"] = fields
        
        return result
    
    except Exception as e:
        print(f"Error processing URL {url}: {e}")
        return {"URL": url, "Error": str(e)}

def update_nodes_with_urls(urls, results):
    nodes = []
    for i, url in enumerate(urls):
        base_url = url.split('/')[5]
        decoded_url = urllib.parse.unquote(base_url)
        
        # Get the corresponding result for this URL
        result = next((r for r in results if r["URL"] == url), {})
        
        # Create node with base structure
        node = {
            "type": "ainode",
            "label": decoded_url,
            "url": url
        }
        
        # Add all fields from the result
        fields = result.get("fields", {})
        node.update(fields)
        
        nodes.append(node)
    return nodes

def main(input_csv, output_csv, nodes_output_file):
    driver = webdriver.Chrome()
    
    try:
        urls = read_urls_from_csv(input_csv)
        results = []
        
        for url in urls:
            print(f"Processing: {url}")
            result = extract_span_data(driver, url)
            results.append(result)
        
        # Write results to CSV
        write_results_to_csv(output_csv, results)
        
        # Update and save nodes with additional data
        nodes = update_nodes_with_urls(urls, results)
        json_output = json.dumps(nodes, indent=4, ensure_ascii=False)
        with open(nodes_output_file, "w", encoding='utf-8') as file:
            file.write(json_output)
        
        print("Processing complete. Results saved to:", output_csv)
        print("Nodes saved to:", nodes_output_file)
    
    finally:
        driver.quit()

# File paths
input_csv = "output.csv"
output_csv = "output_results.csv"
nodes_output_file = "nodes_with_urls.json"

if __name__ == "__main__":
    main(input_csv, output_csv, nodes_output_file)