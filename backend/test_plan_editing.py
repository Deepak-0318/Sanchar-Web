#!/usr/bin/env python3
"""
Test script for the enhanced Sanchar chatbot with plan editing capabilities.
"""

import json
import requests
import time

BASE_URL = "http://localhost:8000"

def test_plan_editing_flow():
    """Test the complete plan editing flow"""
    
    print("🚀 Testing Sanchar AI Plan Editing System")
    print("=" * 50)
    
    # Step 1: Start a session
    print("\n📍 Step 1: Starting chat session...")
    response = requests.post(f"{BASE_URL}/chat/start", json={
        "start_lat": 12.9716,
        "start_lon": 77.5946
    })
    
    if response.status_code != 200:
        print(f"❌ Failed to start session: {response.text}")
        return
        
    session_data = response.json()
    session_id = session_data["session_id"]
    print(f"✅ Session created: {session_id}")
    
    # Step 2: Generate initial plan from survey
    print("\n🗓️ Step 2: Generating initial plan...")
    survey_response = requests.post(f"{BASE_URL}/plan/generate", json={
        "session_id": session_id,
        "time_hours": 4.0,
        "budget": "moderate",
        "vibe": "chill", 
        "preferred_location": "MG Road, Bengaluru"
    })
    
    if survey_response.status_code != 200:
        print(f"❌ Failed to generate plan: {survey_response.text}")
        return
        
    initial_plan = survey_response.json()
    print("✅ Initial plan generated:")
    print(json.dumps(initial_plan, indent=2))
    
    # Step 3: Test plan editing
    print("\n✏️ Step 3: Testing plan edits...")
    
    edit_tests = [
        "Make the plan more relaxed",
        "Replace the first place with Cubbon Park",
        "Move lunch to 3pm"
    ]
    
    for i, edit_instruction in enumerate(edit_tests, 1):
        print(f"\n   Edit {i}: '{edit_instruction}'")
        
        edit_response = requests.post(f"{BASE_URL}/chat", json={
            "session_id": session_id,
            "message": edit_instruction
        })
        
        if edit_response.status_code != 200:
            print(f"   ❌ Edit failed: {edit_response.text}")
            continue
            
        updated_plan = edit_response.json()
        print(f"   ✅ Plan updated successfully")
        
        # Show the change
        if "optimized_plan" in updated_plan:
            places = [p["place_name"] for p in updated_plan["optimized_plan"]]
            print(f"   📍 Places: {', '.join(places)}")
    
    # Step 4: Test informational query
    print("\n💬 Step 4: Testing informational query...")
    
    info_response = requests.post(f"{BASE_URL}/chat", json={
        "session_id": session_id,
        "message": "Tell me about Lalbagh Botanical Garden"
    })
    
    if info_response.status_code == 200:
        info_result = info_response.json()
        print("✅ Info query successful:")
        print(f"   Response: {info_result.get('response', 'No response')[:200]}...")
    else:
        print(f"❌ Info query failed: {info_response.text}")
    
    print("\n🎉 Test completed!")

if __name__ == "__main__":
    try:
        test_plan_editing_flow()
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Test failed with error: {e}")