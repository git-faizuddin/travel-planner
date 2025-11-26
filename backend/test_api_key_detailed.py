#!/usr/bin/env python3
"""
Detailed test script to check OpenAI API key configuration
"""
import os
import sys
from pathlib import Path

# Try different ways to load the key
print("=" * 60)
print("OpenAI API Key Configuration Test")
print("=" * 60)

# Method 1: Check .env file directly
env_file = Path(".env")
if env_file.exists():
    print("\n✓ .env file exists")
    with open(env_file) as f:
        for line in f:
            if line.strip().startswith("OPENAI_API_KEY"):
                key_value = line.split("=", 1)[1].strip()
                if key_value:
                    print(f"✓ Found key in .env: {key_value[:20]}...{key_value[-10:]}")
                    print(f"  Key length: {len(key_value)} characters")
                else:
                    print("❌ OPENAI_API_KEY is empty in .env file")
else:
    print("❌ .env file not found")

# Method 2: Check environment variable
env_key = os.getenv("OPENAI_API_KEY")
if env_key:
    print(f"\n✓ Found key in environment: {env_key[:20]}...{env_key[-10:]}")
else:
    print("\n⚠ OPENAI_API_KEY not in environment variables")

# Method 3: Try loading with python-dotenv
try:
    from dotenv import load_dotenv
    load_dotenv()
    dotenv_key = os.getenv("OPENAI_API_KEY")
    if dotenv_key:
        print(f"\n✓ Loaded key with dotenv: {dotenv_key[:20]}...{dotenv_key[-10:]}")
    else:
        print("\n⚠ Could not load key with dotenv")
except ImportError:
    print("\n⚠ python-dotenv not installed")

# Method 4: Test with OpenAI client
print("\n" + "=" * 60)
print("Testing API Key with OpenAI...")
print("=" * 60)

try:
    from dotenv import load_dotenv
    from openai import OpenAI
    
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        print("❌ No API key found")
        sys.exit(1)
    
    client = OpenAI(api_key=api_key)
    
    print("Making test API call...")
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Hello"}],
        max_tokens=5
    )
    
    print("✅ SUCCESS: API key is valid and working!")
    print(f"Response: {response.choices[0].message.content}")
    
except Exception as e:
    error_str = str(e)
    print(f"\n❌ Error: {error_str}")
    
    if "insufficient_quota" in error_str or "429" in error_str:
        print("\n" + "=" * 60)
        print("DIAGNOSIS: API Key is VALID but has NO CREDITS")
        print("=" * 60)
        print("\nTo fix this:")
        print("1. Visit: https://platform.openai.com/account/billing")
        print("2. Add payment method and purchase credits")
        print("3. Wait a few minutes for the credits to activate")
        print("4. Try again")
    elif "invalid" in error_str.lower() or "401" in error_str:
        print("\n" + "=" * 60)
        print("DIAGNOSIS: API Key is INVALID or EXPIRED")
        print("=" * 60)
        print("\nTo fix this:")
        print("1. Visit: https://platform.openai.com/api-keys")
        print("2. Create a new API key")
        print("3. Update OPENAI_API_KEY in your .env file")
        print("4. Restart the server")
    else:
        print(f"\nUnexpected error type: {type(e).__name__}")

