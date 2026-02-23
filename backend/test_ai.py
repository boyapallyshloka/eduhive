from google import genai
import os

# --- PASTE YOUR API KEY HERE ---
API_KEY = "AIzaSyDmEVLOOb8FNmh9OnqsO62HF6On00ab9Is" 

print("Attempting to connect with google-genai...")

try:
    # 1. Initialize Client
    client = genai.Client(api_key=API_KEY)

    print("✅ Connection Successful! Fetching models...\n")
    print("Available Gemini Models:")
    print("-" * 30)

    # 2. List Models
    # The new SDK returns an iterator
    for model in client.models.list():
        # Filter only for 'gemini' models to keep the list clean
        if "gemini" in model.name:
            print(f"Model ID: {model.name}")
            print(f"   Name: {model.display_name}")
            print("-" * 30)

except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nTroubleshooting:")
    print("1. Did you run 'pip install google-genai'?")
    print("2. Is your API Key correct?")