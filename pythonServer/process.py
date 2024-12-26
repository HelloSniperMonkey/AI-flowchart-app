from flask import Flask, request, jsonify
from flask_cors import CORS 
from mira_sdk import MiraClient, Flow
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173"],  # Your React dev server
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

def initialize_mira_client():
    """Initialize Mira client with API key from environment variables"""
    api_key = os.getenv("API_KEY")
    if not api_key:
        raise ValueError("API_KEY not found in environment variables")
    return MiraClient(config={"API_KEY": api_key})

def process_with_mira(input_data):
    """Process input data using Mira SDK"""
    try:
        client = initialize_mira_client()
        flow = Flow(source="./flow.yaml")
        
        # Validate input data
        if not isinstance(input_data, dict):
            raise ValueError("Input data must be a dictionary")
        
        required_fields = ["input"]
        for field in required_fields:
            if field not in input_data:
                raise ValueError(f"Missing required field: {field}")
        
        # Process with Mira
        response = client.flow.test(flow, input_data)
        
        if 'result' not in response:
            raise ValueError("Unexpected response format from Mira SDK")
        
        return response['result']
    
    except Exception as e:
        raise Exception(f"Mira processing error: {str(e)}")

@app.route('/api/process', methods=['POST'])
def process_data():
    try:
        # Get and validate input data
        input_data = request.get_json()
        if not input_data:
            return jsonify({'error': 'No input data provided'}), 400
        
        # Process the data
        result = process_with_mira(input_data)
        
        return jsonify({
            'success': True,
            'result': result
        })

    except ValueError as e:
        # Handle validation errors
        return jsonify({
            'success': False,
            'error': str(e),
            'error_type': 'validation_error'
        }), 400
    
    except Exception as e:
        # Handle unexpected errors
        return jsonify({
            'success': False,
            'error': str(e),
            'error_type': 'processing_error'
        }), 500

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.getenv('PORT', 5000))
    # Run the Flask app
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_DEBUG', 'False').lower() == 'true')