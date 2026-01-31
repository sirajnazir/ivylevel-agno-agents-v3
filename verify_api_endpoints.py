
import sys
import os
import pytest
from fastapi.testclient import TestClient

# Path setup
sys.path.append(os.getcwd())

from backend.main import app

client = TestClient(app)

# Mock Data
MOCK_PROFILE = {
    "id": "test-student-api-001",
    "name": "Alex API",
    "academic": {
        "gpa": 3.9,
        "sat": 1520,
        "taken_aps": 6
    },
    "interests": ["Robotics", "Physics"],
    "target_schools": ["MIT", "Stanford"]
}

def test_narrative_endpoint():
    print("\n🧪 Testing POST /agents/narrative/synthesize...")
    response = client.post("/agents/narrative/synthesize", json={
        "student_id": "test-student-api-001",
        "profile": MOCK_PROFILE,
        "context": {}
    })
    if response.status_code != 200:
        print(f"❌ Failed: {response.text}")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    data = res_json["data"]
    assert "narrative_dna" in data
    assert "archetype" in data
    print("✅ Narrative Endpoint Passed")

def test_gameplan_endpoint():
    print("\n🧪 Testing POST /agents/gameplan/generate...")
    response = client.post("/agents/gameplan/generate", json={
        "student_id": "test-student-api-001",
        "profile": MOCK_PROFILE
    })
    if response.status_code != 200:
        print(f"❌ Failed: {response.text}")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    data = res_json["data"]["game_plan"]
    assert "identity_synthesis" in data
    assert "portfolio_analysis" in data
    print("✅ GamePlan Endpoint Passed")

def test_awards_endpoint():
    print("\n🧪 Testing POST /agents/awards/match...")
    response = client.post("/agents/awards/match", json={
        "student_id": "test-student-api-001",
        "profile": MOCK_PROFILE
    })
    assert response.status_code == 200
    res_json = response.json()
    data = res_json["data"] if "data" in res_json else res_json
    assert "portfolio" in data
    print("✅ Awards Endpoint Passed")

def test_programs_endpoint():
    print("\n🧪 Testing POST /agents/programs/match...")
    response = client.post("/agents/programs/match", json={
        "student_id": "test-student-api-001",
        "profile": MOCK_PROFILE
    })
    assert response.status_code == 200
    res_json = response.json()
    data = res_json["data"] if "data" in res_json else res_json
    assert "recommended_programs" in data or "top_recommendations" in data 
    print("✅ Programs Endpoint Passed")

def test_execution_endpoint():
    print("\n🧪 Testing POST /agents/execution/debt-score...")
    # 2 Overdue (20) + 1 Stalled (20) = 40 (>30 => At Risk)
    response = client.post("/agents/execution/debt-score", json={
        "tasks": [{"status": "overdue"}, {"status": "overdue"}, {"days_inactive": 10}],
        "deadline_proximity": 0.8
    })
    assert response.status_code == 200
    res_json = response.json()
    data = res_json["data"] if "data" in res_json else res_json
    assert "execution_debt_score" in data
    assert data["status"] == "At Risk"
    print("✅ Execution Endpoint Passed")

def test_opportunity_endpoint():
    print("\n🧪 Testing POST /agents/opportunity/find...")
    response = client.post("/agents/opportunity/find", json={
        "student_id": "test-student-api-001",
        "profile": MOCK_PROFILE
    })
    assert response.status_code == 200
    res_json = response.json()
    data = res_json["data"] if "data" in res_json else res_json
    assert "matches" in data
    assert isinstance(data["matches"], list)
    print("✅ Opportunity Endpoint Passed")

from unittest.mock import patch

def test_auto_fetch_logic():
    print("\n🧪 Testing POST /agents/narrative/synthesize (Auto-Fetch via Mock)...")
    
    # Mock the database call
    with patch("backend.api.routers.agents_bridge.read_student_profile", return_value=MOCK_PROFILE):
        response = client.post("/agents/narrative/synthesize", json={
            "student_id": "test-student-db-001"
            # No profile provided!
        })
        
        if response.status_code != 200:
            print(f"❌ Failed: {response.text}")
        assert response.status_code == 200
        res_json = response.json()
        assert res_json["success"] is True
        data = res_json["data"]
        assert "narrative_dna" in data
        print("✅ Auto-Fetch Logic Passed")

if __name__ == "__main__":
    try:
        test_narrative_endpoint()
        test_gameplan_endpoint()
        test_awards_endpoint()
        test_programs_endpoint()
        test_execution_endpoint()
        test_opportunity_endpoint()
        test_auto_fetch_logic() # New test
        print("\n🎉 ALL API TESTS PASSED!")
    except Exception as e:
        print(f"\n❌ FAIL: {e}")
        import traceback
        traceback.print_exc()
