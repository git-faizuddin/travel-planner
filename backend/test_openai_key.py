#!/usr/bin/env python3
"""
Simple script to test OpenAI API key
"""
import os
import sys
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

def test_openai_key():
    """Test if OpenAI API key is valid and working"""
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        print("❌ ERROR: OPENAI_API_KEY not found in environment variables")
        print("   Make sure you have a .env file with OPENAI_API_KEY set")
        return False
    
    print(f"✓ Found API key: {api_key[:20]}...{api_key[-10:]}")
    print("\nTesting API key...")
    
    try:
        client = OpenAI(api_key=api_key)
        
        # Simple test call
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": "Say 'API key is working' if you can read this."}
            ],
            max_tokens=20
        )
        
        message = response.choices[0].message.content
        print(f"✓ API Response: {message}")
        print("\n✅ SUCCESS: OpenAI API key is valid and working!")
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: API key test failed")
        print(f"   Error type: {type(e).__name__}")
        print(f"   Error message: {str(e)}")
        
        if "insufficient_quota" in str(e).lower() or "429" in str(e):
            print("\n   → This means your API key has no credits/quota")
            print("   → Visit https://platform.openai.com/account/billing to add credits")
        elif "invalid_api_key" in str(e).lower() or "401" in str(e):
            print("\n   → This means your API key is invalid or expired")
            print("   → Get a new key from https://platform.openai.com/api-keys")
        elif "rate_limit" in str(e).lower():
            print("\n   → You've hit the rate limit, wait a moment and try again")
        
        return False

if __name__ == "__main__":
    success = test_openai_key()
    sys.exit(0 if success else 1)

