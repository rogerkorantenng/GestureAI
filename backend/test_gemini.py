#!/usr/bin/env python3
"""Test script to verify Gemini API connection using the GenAI SDK."""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from google import genai


def test_gemini_connection():
    """Test the Gemini API connection."""
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        print("ERROR: GEMINI_API_KEY not found in environment")
        return False

    print(f"API Key found: {api_key[:10]}...{api_key[-4:]}")

    try:
        # Create client
        client = genai.Client(api_key=api_key)

        # List available models
        print("\nAvailable models:")
        for model in client.models.list():
            print(f"  - {model.name}")

        # Test generation with Gemini 2.0 Flash
        print("\nTesting text generation with Gemini 2.0 Flash...")
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents="Say 'Hello, GestureAI!' in a friendly way.",
        )

        print(f"Response: {response.text}")
        print("\nGemini API connection successful!")
        return True

    except Exception as e:
        print(f"ERROR: {e}")
        return False


if __name__ == "__main__":
    test_gemini_connection()
