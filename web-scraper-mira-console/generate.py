import csv
import json
import urllib.parse

# The input node structure
nodes = [
    {"type": "ainode", "label": "Input Node"},
    {"type": "ainode", "label": "Default Node"},
    {"type": "ainode", "label": "Output Node"},
    # Add more nodes as needed
]

# File path to the CSV containing the URLs
csv_file_path = "output.csv"  # Replace with the path to your CSV file

# Read URLs from the CSV file
urls = []
with open(csv_file_path, "r") as file:
    csv_reader = csv.reader(file)
    for row in csv_reader:
        # Assuming each URL is in its own row
        if row:  # Check if the row is not empty
            item = row[0].split('/')
            decoded_url = urllib.parse.unquote(item[5])
            urls.append(decoded_url)

# Replace the labels in the nodes with the URLs
for i in range(len(urls)):
    if i < len(nodes):
        nodes[i]["label"] = urls[i]
    else:
        nodes.append({"type": "ainode", "label": urls[i]})

# Convert to JSON
json_output = json.dumps(nodes, indent=4)

# Save to a file or print to the console
output_file = "nodes_with_urls.json"
with open(output_file, "w") as file:
    file.write(json_output)

print(f"JSON object created successfully and saved to {output_file}:")
print(json_output)
