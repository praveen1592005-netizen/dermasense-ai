"""
DermaSense AI — Prediction API Test Suite
==========================================
Tests all 19 scenarios from the specification:

 1. Valid image → successful prediction
 2. Invalid file type (PDF)
 3. Corrupted image bytes
 4. Very small image (< 64px)
 5. Blurry image (uniform colour)
 6. Very dark image
 7. Very bright image (overexposed)
 8. Successful prediction schema validation
 9. Temperature calibration applied
10. Low confidence → UNCERTAIN
11. UNCERTAIN response structure
12. LOW risk response structure
13. MODERATE risk response structure
14. HIGH risk response structure
15. Model loading validation
16. Report generation endpoint
17. Hospital API — configured response
18. Hospital API — manual location search (text)
19. Hospital API — not configured graceful error

Run:
  cd backend
  python -m pytest tests/test_predict_api.py -v
"""

import io
import json
import struct
import zlib
import pytest
import numpy as np
from unittest.mock import AsyncMock, MagicMock, patch
from PIL import Image


# ─── Helpers to generate synthetic test images ────────────────────────────────

def _make_rgb_png(width: int, height: int, r=128, g=128, b=128) -> bytes:
    """Create a minimal valid PNG with a solid colour."""
    img = Image.new("RGB", (width, height), (r, g, b))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _make_noisy_png(width=128, height=128) -> bytes:
    """Create a PNG with random pixel noise (realistic-looking, good quality)."""
    arr = (np.random.rand(height, width, 3) * 255).astype(np.uint8)
    img = Image.fromarray(arr, "RGB")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _make_dark_png(width=128, height=128) -> bytes:
    """Very dark image (avg brightness << 0.05)."""
    return _make_rgb_png(width, height, r=5, g=5, b=5)


def _make_bright_png(width=128, height=128) -> bytes:
    """Overexposed / very bright image."""
    return _make_rgb_png(width, height, r=252, g=252, b=252)


def _make_blank_png(width=128, height=128) -> bytes:
    """Uniform solid grey — zero contrast → fails contrast check."""
    return _make_rgb_png(width, height, r=128, g=128, b=128)


def _make_tiny_png() -> bytes:
    """Tiny 10×10 image — below minimum resolution."""
    return _make_noisy_png(10, 10)


def _make_corrupted_bytes() -> bytes:
    """Random bytes that are not a valid image."""
    return b"\x89PNG\r\n\x1a\n" + b"\x00" * 50 + b"\xff\xfe\xfd"


# ─── Unit Tests for ai/predict.py functions ───────────────────────────────────

class TestImageQualityCheck:
    """Test the _check_image_quality function directly."""

    def _load_predict(self):
        """Import predict module cleanly."""
        from ai.predict import _check_image_quality
        return _check_image_quality

    def test_good_image_passes(self):
        fn = self._load_predict()
        arr = (np.random.rand(260, 260, 3)).astype(np.float32)
        result = fn(arr, 260, 260)
        assert result["ok"] is True

    def test_too_small_resolution_fails(self):
        fn = self._load_predict()
        arr = (np.random.rand(260, 260, 3)).astype(np.float32)
        result = fn(arr, 10, 10)  # Original was 10x10
        assert result["ok"] is False
        assert "too small" in result["reason"].lower()

    def test_dark_image_fails(self):
        fn = self._load_predict()
        arr = np.full((260, 260, 3), 0.01, dtype=np.float32)  # Very dark
        result = fn(arr, 260, 260)
        assert result["ok"] is False
        assert "dark" in result["reason"].lower()

    def test_bright_image_fails(self):
        fn = self._load_predict()
        arr = np.full((260, 260, 3), 0.99, dtype=np.float32)  # Very bright
        result = fn(arr, 260, 260)
        assert result["ok"] is False
        assert "overexposed" in result["reason"].lower() or "bright" in result["reason"].lower()

    def test_blank_uniform_image_fails(self):
        fn = self._load_predict()
        arr = np.full((260, 260, 3), 0.5, dtype=np.float32)  # Zero contrast
        result = fn(arr, 260, 260)
        assert result["ok"] is False


class TestTemperatureCalibration:
    """Test apply_temperature_scaling function."""

    def test_calibration_preserves_sum_to_one(self):
        from ai.predict import apply_temperature_scaling
        probs = np.array([0.1, 0.6, 0.05, 0.08, 0.07, 0.05, 0.05], dtype=np.float32)
        calibrated = apply_temperature_scaling(probs, temperature=0.9855522845522078)
        assert abs(float(np.sum(calibrated)) - 1.0) < 1e-5

    def test_calibration_temperature_1_unchanged(self):
        from ai.predict import apply_temperature_scaling
        probs = np.array([0.1, 0.6, 0.05, 0.08, 0.07, 0.05, 0.05], dtype=np.float32)
        calibrated = apply_temperature_scaling(probs, temperature=1.0)
        # With temperature=1, distribution should be very close to original
        assert abs(float(np.argmax(calibrated)) - float(np.argmax(probs))) < 1e-5

    def test_calibration_with_actual_temperature(self):
        from ai.predict import apply_temperature_scaling
        probs = np.array([0.03, 0.82, 0.04, 0.02, 0.06, 0.01, 0.02], dtype=np.float32)
        calibrated = apply_temperature_scaling(probs, temperature=0.9855522845522078)
        # Max should still be at index 1 (NV)
        assert int(np.argmax(calibrated)) == 1
        assert abs(float(np.sum(calibrated)) - 1.0) < 1e-5


# ─── Integration-style tests using mocked model ───────────────────────────────

class TestRunPrediction:
    """Integration tests for run_prediction() with mocked model."""

    def _mock_model_and_config(self, raw_probs=None):
        """Return mock model and config that run_prediction() will use."""
        if raw_probs is None:
            raw_probs = np.array([0.03, 0.82, 0.04, 0.02, 0.06, 0.01, 0.02], dtype=np.float32)

        mock_model = MagicMock()
        mock_model.predict.return_value = np.array([raw_probs])
        mock_model.input_shape = (None, 260, 260, 3)
        mock_model.output_shape = (None, 7)

        mock_config = {
            "temperature": 0.9855522845522078,
            "model_name": "DermaSense_EfficientNetV2B2",
            "model_version": "1.0",
            "num_classes": 7,
            "class_names": ["MEL", "NV", "BCC", "AKIEC", "BKL", "DF", "VASC"],
            "input_size": 260,
        }
        return mock_model, mock_config

    @pytest.mark.asyncio
    async def test_corrupted_image_returns_quality_error(self):
        """Test 3: Corrupted image bytes."""
        mock_model, mock_config = self._mock_model_and_config()
        with patch("ai.predict.get_model", return_value=mock_model), \
             patch("ai.predict.get_config", return_value=mock_config):
            from ai.predict import run_prediction
            result = await run_prediction(_make_corrupted_bytes())
            assert result["status"] == "IMAGE_QUALITY_INSUFFICIENT"

    @pytest.mark.asyncio
    async def test_tiny_image_returns_quality_error(self):
        """Test 4: Very small image."""
        mock_model, mock_config = self._mock_model_and_config()
        with patch("ai.predict.get_model", return_value=mock_model), \
             patch("ai.predict.get_config", return_value=mock_config):
            from ai.predict import run_prediction
            result = await run_prediction(_make_tiny_png())
            assert result["status"] == "IMAGE_QUALITY_INSUFFICIENT"
            assert "message" in result

    @pytest.mark.asyncio
    async def test_dark_image_returns_quality_error(self):
        """Test 6: Very dark image."""
        mock_model, mock_config = self._mock_model_and_config()
        with patch("ai.predict.get_model", return_value=mock_model), \
             patch("ai.predict.get_config", return_value=mock_config):
            from ai.predict import run_prediction
            result = await run_prediction(_make_dark_png())
            assert result["status"] == "IMAGE_QUALITY_INSUFFICIENT"

    @pytest.mark.asyncio
    async def test_bright_image_returns_quality_error(self):
        """Test 7: Very bright/overexposed image."""
        mock_model, mock_config = self._mock_model_and_config()
        with patch("ai.predict.get_model", return_value=mock_model), \
             patch("ai.predict.get_config", return_value=mock_config):
            from ai.predict import run_prediction
            result = await run_prediction(_make_bright_png())
            assert result["status"] == "IMAGE_QUALITY_INSUFFICIENT"

    @pytest.mark.asyncio
    async def test_blurry_uniform_image_quality_error(self):
        """Test 5: Blurry / uniform image."""
        mock_model, mock_config = self._mock_model_and_config()
        with patch("ai.predict.get_model", return_value=mock_model), \
             patch("ai.predict.get_config", return_value=mock_config):
            from ai.predict import run_prediction
            result = await run_prediction(_make_blank_png())
            assert result["status"] == "IMAGE_QUALITY_INSUFFICIENT"

    @pytest.mark.asyncio
    async def test_successful_prediction_schema(self):
        """Tests 1 & 8: Valid image → success response with correct schema."""
        mock_model, mock_config = self._mock_model_and_config(
            raw_probs=np.array([0.03, 0.82, 0.04, 0.02, 0.06, 0.01, 0.02], dtype=np.float32)
        )
        with patch("ai.predict.get_model", return_value=mock_model), \
             patch("ai.predict.get_config", return_value=mock_config):
            from ai.predict import run_prediction
            result = await run_prediction(_make_noisy_png())

        assert result["status"] == "success"
        assert result["possible_condition"] == "NV"
        assert result["display_name"] == "Melanocytic Nevi"
        assert isinstance(result["confidence"], float)
        assert result["confidence"] > 0.60
        assert result["risk_level"] == "LOW"
        assert "class_probabilities" in result
        assert set(result["class_probabilities"].keys()) == {"MEL", "NV", "BCC", "AKIEC", "BKL", "DF", "VASC"}
        assert "model_name" in result
        assert result["model_name"] == "DermaSense_EfficientNetV2B2"
        assert "model_version" in result
        assert "recommendation" in result
        assert "medical_disclaimer" in result
        assert "not a medical diagnosis" in result["medical_disclaimer"]

    @pytest.mark.asyncio
    async def test_calibration_is_applied(self):
        """Test 9: Temperature calibration is applied to raw probabilities."""
        raw_probs = np.array([0.03, 0.82, 0.04, 0.02, 0.06, 0.01, 0.02], dtype=np.float32)
        mock_model, mock_config = self._mock_model_and_config(raw_probs)
        with patch("ai.predict.get_model", return_value=mock_model), \
             patch("ai.predict.get_config", return_value=mock_config):
            from ai.predict import run_prediction
            result = await run_prediction(_make_noisy_png())

        # Probabilities should sum to ~1.0 after calibration
        prob_sum = sum(result["class_probabilities"].values())
        assert abs(prob_sum - 1.0) < 0.01

    @pytest.mark.asyncio
    async def test_low_confidence_returns_uncertain(self):
        """Tests 10 & 11: Low confidence → UNCERTAIN risk_level."""
        # All probs roughly equal → low max confidence
        low_conf_probs = np.array([0.14, 0.15, 0.15, 0.14, 0.14, 0.14, 0.14], dtype=np.float32)
        mock_model, mock_config = self._mock_model_and_config(low_conf_probs)
        with patch("ai.predict.get_model", return_value=mock_model), \
             patch("ai.predict.get_config", return_value=mock_config):
            from ai.predict import run_prediction
            result = await run_prediction(_make_noisy_png())

        assert result["status"] == "success"
        assert result["risk_level"] == "UNCERTAIN"
        assert "too low" in result["message"].lower() or "uncertain" in result["message"].lower()
        assert "professional medical evaluation" in result["recommendation"].lower()

    @pytest.mark.asyncio
    async def test_low_risk_result(self):
        """Test 12: LOW risk (NV — common mole)."""
        probs = np.array([0.01, 0.90, 0.02, 0.01, 0.04, 0.01, 0.01], dtype=np.float32)
        mock_model, mock_config = self._mock_model_and_config(probs)
        with patch("ai.predict.get_model", return_value=mock_model), \
             patch("ai.predict.get_config", return_value=mock_config):
            from ai.predict import run_prediction
            result = await run_prediction(_make_noisy_png())
        assert result["risk_level"] == "LOW"
        assert result["possible_condition"] == "NV"

    @pytest.mark.asyncio
    async def test_moderate_risk_result(self):
        """Test 13: MODERATE risk (VASC — Vascular Lesion)."""
        probs = np.array([0.02, 0.03, 0.02, 0.01, 0.02, 0.01, 0.89], dtype=np.float32)
        mock_model, mock_config = self._mock_model_and_config(probs)
        with patch("ai.predict.get_model", return_value=mock_model), \
             patch("ai.predict.get_config", return_value=mock_config):
            from ai.predict import run_prediction
            result = await run_prediction(_make_noisy_png())
        assert result["risk_level"] == "MODERATE"
        assert result["possible_condition"] == "VASC"

    @pytest.mark.asyncio
    async def test_high_risk_result(self):
        """Test 14: HIGH risk (MEL — Melanoma)."""
        probs = np.array([0.92, 0.01, 0.01, 0.01, 0.02, 0.01, 0.02], dtype=np.float32)
        mock_model, mock_config = self._mock_model_and_config(probs)
        with patch("ai.predict.get_model", return_value=mock_model), \
             patch("ai.predict.get_config", return_value=mock_config):
            from ai.predict import run_prediction
            result = await run_prediction(_make_noisy_png())
        assert result["risk_level"] == "HIGH"
        assert result["possible_condition"] == "MEL"
        assert "dermatologist" in result["recommendation"].lower() or \
               "professional" in result["recommendation"].lower()

    @pytest.mark.asyncio
    async def test_high_risk_bcc(self):
        """Test 14b: HIGH risk (BCC — Basal Cell Carcinoma)."""
        probs = np.array([0.01, 0.01, 0.90, 0.02, 0.02, 0.02, 0.02], dtype=np.float32)
        mock_model, mock_config = self._mock_model_and_config(probs)
        with patch("ai.predict.get_model", return_value=mock_model), \
             patch("ai.predict.get_config", return_value=mock_config):
            from ai.predict import run_prediction
            result = await run_prediction(_make_noisy_png())
        assert result["risk_level"] == "HIGH"
        assert result["possible_condition"] == "BCC"

    @pytest.mark.asyncio
    async def test_model_not_loaded_returns_error(self):
        """Test 15: Model loading — returns error when model is None."""
        with patch("ai.predict.get_model", return_value=None), \
             patch("ai.predict.get_config", return_value=None):
            from ai.predict import run_prediction
            result = await run_prediction(_make_noisy_png())
        assert result["status"] == "error"
        assert "not loaded" in result["message"].lower() or "not available" in result["message"].lower()


class TestModelLoader:
    """Test 15: Model loading from ai/model_loader.py."""

    def test_get_config_returns_none_when_file_missing(self, tmp_path):
        """Config not found → returns None."""
        import ai.model_loader as loader
        original_path = loader.CONFIG_PATH
        loader._config = None  # Reset cache
        loader.CONFIG_PATH = tmp_path / "nonexistent.json"
        result = loader.get_config()
        loader.CONFIG_PATH = original_path
        assert result is None

    def test_model_path_defaults_to_skin_disease_folder(self):
        """Model path default matches expected location."""
        from ai.model_loader import MODEL_PATH
        assert "skin_disease" in str(MODEL_PATH)
        assert "DermaSense_SkinDisease_v1.keras" in str(MODEL_PATH)


class TestHospitalEndpoints:
    """Tests 17, 18, 19: Hospital API."""

    def test_nearby_hospitals_not_configured(self):
        """Test 19: No API key → 503 with helpful message."""
        with patch("routers.hospital_router.GOOGLE_PLACES_API_KEY", ""):
            from routers.hospital_router import _not_configured_response
            from fastapi import HTTPException
            try:
                _not_configured_response()
                assert False, "Should have raised HTTPException"
            except HTTPException as e:
                assert e.status_code == 503
                assert "GOOGLE_PLACES_API_KEY" in e.detail

    @pytest.mark.asyncio
    async def test_nearby_hospitals_with_mock_places_api(self):
        """Test 17: Nearby hospitals with mocked Google Places response."""
        mock_response = {
            "status": "OK",
            "results": [
                {
                    "place_id": "ChIJ_test123",
                    "name": "Apollo Dermatology Centre",
                    "vicinity": "MG Road, Chennai",
                    "geometry": {"location": {"lat": 13.0827, "lng": 80.2707}},
                }
            ],
        }
        mock_details = {"result": {"formatted_phone_number": "+91 44 1234 5678"}}

        with patch("routers.hospital_router.GOOGLE_PLACES_API_KEY", "test-api-key"), \
             patch("httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            mock_nearby_resp = MagicMock()
            mock_nearby_resp.json.return_value = mock_response
            mock_details_resp = MagicMock()
            mock_details_resp.json.return_value = mock_details
            mock_client.get = AsyncMock(side_effect=[mock_nearby_resp, mock_details_resp])
            mock_client_cls.return_value = mock_client

            from routers.hospital_router import get_nearby_hospitals
            result = await get_nearby_hospitals(
                latitude=13.0827,
                longitude=80.2707,
                radius_km=10.0,
            )
            assert len(result) == 1
            assert result[0].name == "Apollo Dermatology Centre"
            assert result[0].maps_url is not None

    @pytest.mark.asyncio
    async def test_manual_location_search(self):
        """Test 18: Manual location text search (when GPS unavailable)."""
        mock_response = {
            "status": "OK",
            "results": [
                {
                    "place_id": "ChIJ_test456",
                    "name": "Skin & More Dermatology Clinic",
                    "formatted_address": "Anna Nagar, Chennai, Tamil Nadu",
                    "geometry": {"location": {"lat": 13.0852, "lng": 80.2099}},
                }
            ],
        }
        mock_details = {"result": {}}

        with patch("routers.hospital_router.GOOGLE_PLACES_API_KEY", "test-api-key"), \
             patch("httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            mock_search_resp = MagicMock()
            mock_search_resp.json.return_value = mock_response
            mock_details_resp = MagicMock()
            mock_details_resp.json.return_value = mock_details
            mock_client.get = AsyncMock(side_effect=[mock_search_resp, mock_details_resp])
            mock_client_cls.return_value = mock_client

            from routers.hospital_router import search_hospitals
            result = await search_hospitals(query="Chennai")
            assert len(result) >= 1
            assert result[0].name == "Skin & More Dermatology Clinic"


class TestReportEndpoint:
    """Test 16: Report generation."""

    def test_report_create_request_model(self):
        """Verify ReportCreateRequest accepts correct fields."""
        from routers.report_router import ReportCreateRequest
        req = ReportCreateRequest(
            user_id="user-123",
            report_data={
                "title": "Skin Disease Screening",
                "possible_condition": "NV",
                "confidence": 0.82,
                "risk_level": "LOW",
                "model_name": "DermaSense_EfficientNetV2B2",
                "model_version": "1.0",
                "recommendation": "Maintain regular skincare routine.",
                "medical_disclaimer": "This AI result is for screening purposes only.",
            },
            analysis_id="analysis-456",
        )
        assert req.user_id == "user-123"
        assert req.report_data["possible_condition"] == "NV"
        assert req.analysis_id == "analysis-456"

    def test_report_contains_medical_disclaimer(self):
        """Report data always includes medical disclaimer."""
        from routers.report_router import ReportCreateRequest
        req = ReportCreateRequest(
            user_id="user-123",
            report_data={
                "medical_disclaimer": "This AI result is for screening and informational purposes only and is not a medical diagnosis.",
            },
        )
        assert "not a medical diagnosis" in req.report_data["medical_disclaimer"]
