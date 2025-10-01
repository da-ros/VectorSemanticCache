#!/usr/bin/env python3
"""
Test script to verify the Vector Semantic Cache integration
"""
import requests
import json
import time

# Configuration
BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:8080"

def test_backend_health():
    """Test backend health endpoint"""
    print("🔍 Testing backend health...")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend is healthy: {data['status']}")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend health check error: {e}")
        return False

def test_backend_ask():
    """Test backend ask endpoint"""
    print("🔍 Testing backend ask endpoint...")
    try:
        payload = {
            "query": "What is a semantic cache?",
            "threshold": 0.70
        }
        response = requests.post(f"{BACKEND_URL}/ask", json=payload, timeout=30)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Ask endpoint working:")
            print(f"   Response: {data['response'][:100]}...")
            print(f"   Meta: {data['meta']}")
            return True
        else:
            print(f"❌ Ask endpoint failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Ask endpoint error: {e}")
        return False

def test_backend_stats():
    """Test backend stats endpoint"""
    print("🔍 Testing backend stats endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/stats", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Stats endpoint working:")
            print(f"   Hit Rate: {data['hitRate']}")
            print(f"   Total Queries: {data['totalQueries']}")
            return True
        else:
            print(f"❌ Stats endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Stats endpoint error: {e}")
        return False

def test_frontend_connection():
    """Test if frontend is accessible"""
    print("🔍 Testing frontend connection...")
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
            return True
        else:
            print(f"❌ Frontend connection failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend connection error: {e}")
        return False

def main():
    """Run all integration tests"""
    print("🚀 Starting Vector Semantic Cache Integration Tests")
    print("=" * 50)
    
    tests = [
        ("Backend Health", test_backend_health),
        ("Backend Ask", test_backend_ask),
        ("Backend Stats", test_backend_stats),
        ("Frontend Connection", test_frontend_connection),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        result = test_func()
        results.append((test_name, result))
        time.sleep(1)  # Small delay between tests
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tests passed! Integration is working correctly.")
        print(f"\n🌐 You can now access:")
        print(f"   Frontend: {FRONTEND_URL}")
        print(f"   Backend API: {BACKEND_URL}")
        print(f"   API Docs: {BACKEND_URL}/docs")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
        print("\n💡 Make sure both frontend and backend are running:")
        print("   Backend: cd Backend && uvicorn app:server --reload")
        print("   Frontend: cd Frontend && npm run dev")

if __name__ == "__main__":
    main()
