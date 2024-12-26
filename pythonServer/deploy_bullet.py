from mira_sdk import MiraClient, Flow
from dotenv import load_dotenv
import os
from mira_sdk.exceptions import FlowError

load_dotenv()

client = MiraClient(config={"API_KEY": os.getenv("API_KEY")})

flow = Flow(source="./flow.yaml")

try:
    client.flow.deploy(flow)
except FlowError as e:
    print(f"Error: (str{e})")