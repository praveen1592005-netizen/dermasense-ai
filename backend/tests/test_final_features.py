import pytest
from fastapi.testclient import TestClient
from main import app
import os
import hmac
import hashlib
import json

client = TestClient(app)

def test_hospital_mock_nearby(monkeypatch):
    import routers.hospital_router as hr
    monkeypatch.setattr(hr, "HOSPITAL_PROVIDER", "mock")
    
    response = client.get("/api/v1/hospitals/nearby?latitude=12.9716&longitude=77.5946&radius_km=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["name"] == "DermaCare Specialized Clinic"
    assert "distance_km" in data[0]

def test_hospital_mock_search(monkeypatch):
    import routers.hospital_router as hr
    monkeypatch.setattr(hr, "HOSPITAL_PROVIDER", "mock")
    response = client.get("/api/v1/hospitals/search?query=Apollo")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert "Apollo" in data[0]["name"]

def test_payment_webhook_missing_signature():
    response = client.post("/api/v1/payments/razorpay/webhook", json={})
    assert response.status_code == 400
    assert "Missing Razorpay signature" in response.json()["detail"]

def test_payment_webhook_invalid_signature(monkeypatch):
    import routers.payment_router as pr
    monkeypatch.setattr(pr, "RAZORPAY_WEBHOOK_SECRET", "real_secret")
    response = client.post(
        "/api/v1/payments/razorpay/webhook", 
        json={"event": "payment.captured"},
        headers={"X-Razorpay-Signature": "invalid_signature"}
    )
    assert response.status_code == 400
    assert "Invalid Razorpay signature" in response.json()["detail"]

def test_payment_webhook_valid_signature_ignored_event(monkeypatch):
    import routers.payment_router as pr
    secret = "mock_secret"
    monkeypatch.setattr(pr, "RAZORPAY_WEBHOOK_SECRET", secret)
    
    payload = {"event": "payment.failed"}
    body = json.dumps(payload, separators=(',', ':')).encode('utf-8')
    
    signature = hmac.new(
        key=secret.encode("utf-8"),
        msg=body,
        digestmod=hashlib.sha256
    ).hexdigest()
    
    response = client.post(
        "/api/v1/payments/razorpay/webhook", 
        json=payload,
        headers={"X-Razorpay-Signature": "dummy_signature"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ignored"

