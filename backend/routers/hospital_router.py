"""
DermaSense AI — Hospital Router
=================================
Provides nearby dermatology hospital search for HIGH and UNCERTAIN risk results.

Endpoints:
  GET /api/v1/hospitals/nearby  — Nearby hospitals by coordinates (Google Places)
  GET /api/v1/hospitals/search  — Text search for hospitals (Google Places)

IMPORTANT:
  - Do NOT fabricate hospital information.
  - Do NOT show doctor booking, appointment, or consultation features.
  - Purpose is: Find Nearby Dermatology Hospital → View on Map → Get Directions.
  - Requires GOOGLE_PLACES_API_KEY in .env for live results.
"""

import os
import logging
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/hospitals",
    tags=["Hospitals"],
)

HOSPITAL_PROVIDER = os.getenv("HOSPITAL_PROVIDER", "google").lower()
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "")
PLACES_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
PLACES_TEXT_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
PLACES_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"


class Hospital(BaseModel):
    id: str
    name: str
    address: str
    distance_km: Optional[float] = None
    phone: Optional[str] = None
    latitude: float
    longitude: float
    opening_hours: Optional[str] = None
    maps_url: Optional[str] = None


def _km_from_meters(meters: float) -> float:
    return round(meters / 1000, 2)


def _build_maps_url(place_id: str) -> str:
    return f"https://www.google.com/maps/place/?q=place_id:{place_id}"


async def _fetch_place_details(place_id: str, client: httpx.AsyncClient) -> dict:
    """Fetch phone and opening hours for a place from Google Places Details API."""
    try:
        params = {
            "place_id": place_id,
            "fields": "formatted_phone_number,opening_hours",
            "key": GOOGLE_PLACES_API_KEY,
        }
        resp = await client.get(PLACES_DETAILS_URL, params=params, timeout=10)
        data = resp.json()
        result = data.get("result", {})
        return {
            "phone": result.get("formatted_phone_number"),
            "opening_hours": (
                result.get("opening_hours", {}).get("weekday_text", [None])[0]
            ),
        }
    except Exception as e:
        logger.warning(f"Failed to fetch place details for {place_id}: {e}")
        return {}


def _not_configured_response():
    raise HTTPException(
        status_code=503,
        detail=(
            "Hospital search is not configured. "
            "Please add GOOGLE_PLACES_API_KEY to the backend .env file. "
            "See: https://developers.google.com/maps/documentation/places/web-service/get-api-key"
        ),
    )


@router.get("/nearby", response_model=List[Hospital])
async def get_nearby_hospitals(
    latitude: float = Query(..., description="User's latitude"),
    longitude: float = Query(..., description="User's longitude"),
    radius_km: float = Query(10.0, description="Search radius in kilometres (max 50)"),
):
    """
    Returns a list of nearby dermatology hospitals based on user coordinates.
    Used for HIGH and UNCERTAIN risk results to show 'Find Nearby Dermatology Hospitals'.
    """
    if HOSPITAL_PROVIDER == "mock":
        logger.info(f"Using MOCK hospital data for ({latitude}, {longitude})")
        return [
            Hospital(
                id="mock_hosp_1",
                name="DermaCare Specialized Clinic",
                address="123 Skin Health Blvd, City Center",
                distance_km=2.4,
                phone="+91 98765 43210",
                latitude=latitude + 0.015,
                longitude=longitude + 0.012,
                opening_hours="9:00 AM - 8:00 PM",
                maps_url="https://www.google.com/maps",
            ),
            Hospital(
                id="mock_hosp_2",
                name="Advanced Dermatology Center",
                address="45 Medical District Road",
                distance_km=4.1,
                phone="+91 98765 43211",
                latitude=latitude - 0.022,
                longitude=longitude + 0.008,
                opening_hours="Open 24 Hours",
                maps_url="https://www.google.com/maps",
            ),
            Hospital(
                id="mock_hosp_3",
                name="Skin & Aesthetics Hospital",
                address="78 Wellness Avenue",
                distance_km=5.7,
                phone="+91 98765 43212",
                latitude=latitude + 0.030,
                longitude=longitude - 0.025,
                opening_hours="10:00 AM - 6:00 PM",
                maps_url="https://www.google.com/maps",
            )
        ]

    if not GOOGLE_PLACES_API_KEY:
        _not_configured_response()

    radius_m = min(radius_km * 1000, 50000)  # cap at 50 km

    logger.info(f"Searching for dermatology hospitals near ({latitude}, {longitude}) within {radius_km} km")

    params = {
        "location": f"{latitude},{longitude}",
        "radius": int(radius_m),
        "keyword": "dermatology hospital skin clinic",
        "type": "hospital",
        "key": GOOGLE_PLACES_API_KEY,
    }

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(PLACES_NEARBY_URL, params=params, timeout=15)
            data = resp.json()
        except Exception as e:
            logger.error(f"Google Places API request failed: {e}")
            raise HTTPException(status_code=502, detail="Failed to connect to hospital search provider.")

        if data.get("status") == "REQUEST_DENIED":
            logger.error(f"Google Places API denied request: {data.get('error_message')}")
            raise HTTPException(status_code=503, detail="Hospital search API key is invalid or restricted.")

        places = data.get("results", [])
        hospitals: List[Hospital] = []

        for place in places[:10]:  # Return up to 10 results
            place_id = place.get("place_id", "")
            geometry = place.get("geometry", {}).get("location", {})
            details = await _fetch_place_details(place_id, client)

            # Compute approximate distance using haversine formula
            import math
            lat2 = geometry.get("lat", latitude)
            lng2 = geometry.get("lng", longitude)
            lat1_r, lat2_r = math.radians(latitude), math.radians(lat2)
            d_lat = math.radians(lat2 - latitude)
            d_lng = math.radians(lng2 - longitude)
            a = (math.sin(d_lat / 2) ** 2 +
                 math.cos(lat1_r) * math.cos(lat2_r) * math.sin(d_lng / 2) ** 2)
            distance_km = round(6371 * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 2)

            hospitals.append(Hospital(
                id=place_id,
                name=place.get("name", "Unknown Hospital"),
                address=place.get("vicinity", "Address unavailable"),
                distance_km=distance_km,
                phone=details.get("phone"),
                latitude=lat2,
                longitude=lng2,
                opening_hours=details.get("opening_hours"),
                maps_url=_build_maps_url(place_id),
            ))

        return hospitals


@router.get("/search", response_model=List[Hospital])
async def search_hospitals(
    query: str = Query(..., description="Hospital or location name to search for"),
    latitude: Optional[float] = Query(None, description="Optional: user latitude for relevance"),
    longitude: Optional[float] = Query(None, description="Optional: user longitude for relevance"),
):
    """
    Text search for dermatology hospitals by name or location.
    Used when location permission is denied or for manual location search.
    """
    if HOSPITAL_PROVIDER == "mock":
        logger.info(f"Using MOCK hospital text search for '{query}'")
        lat = latitude if latitude else 0.0
        lng = longitude if longitude else 0.0
        return [
            Hospital(
                id="mock_search_1",
                name=f"{query.title()} Dermatology Center",
                address=f"123 {query.title()} Main Street",
                distance_km=None,
                phone="+91 98765 43210",
                latitude=lat + 0.015,
                longitude=lng + 0.012,
                opening_hours="9:00 AM - 8:00 PM",
                maps_url="https://www.google.com/maps",
            ),
            Hospital(
                id="mock_search_2",
                name="Skin Health Clinic",
                address=f"45 {query.title()} Avenue",
                distance_km=None,
                phone="+91 98765 43211",
                latitude=lat - 0.022,
                longitude=lng + 0.008,
                opening_hours="Open 24 Hours",
                maps_url="https://www.google.com/maps",
            )
        ]

    if not GOOGLE_PLACES_API_KEY:
        _not_configured_response()

    search_query = f"dermatology hospital skin clinic {query}"
    params = {
        "query": search_query,
        "key": GOOGLE_PLACES_API_KEY,
    }
    if latitude is not None and longitude is not None:
        params["location"] = f"{latitude},{longitude}"

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(PLACES_TEXT_URL, params=params, timeout=15)
            data = resp.json()
        except Exception as e:
            logger.error(f"Google Places text search failed: {e}")
            raise HTTPException(status_code=502, detail="Failed to connect to hospital search provider.")

        if data.get("status") == "REQUEST_DENIED":
            raise HTTPException(status_code=503, detail="Hospital search API key is invalid or restricted.")

        places = data.get("results", [])
        hospitals: List[Hospital] = []

        for place in places[:10]:
            place_id = place.get("place_id", "")
            geometry = place.get("geometry", {}).get("location", {})
            details = await _fetch_place_details(place_id, client)

            hospitals.append(Hospital(
                id=place_id,
                name=place.get("name", "Unknown"),
                address=place.get("formatted_address", "Address unavailable"),
                distance_km=None,  # Text search doesn't return distance directly
                phone=details.get("phone"),
                latitude=geometry.get("lat", 0.0),
                longitude=geometry.get("lng", 0.0),
                opening_hours=details.get("opening_hours"),
                maps_url=_build_maps_url(place_id),
            ))

        return hospitals
