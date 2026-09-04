import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional

from services.supabase_service import get_supabase_client
from dependencies.auth import verify_token

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/reports", tags=["Reports & History"], dependencies=[Depends(verify_token)])

class ReportCreateRequest(BaseModel):
    user_id: str
    report_data: Dict[str, Any]
    analysis_id: Optional[str] = None

# =============================================================================
# IMPORTANT: Static routes MUST come before dynamic /{param} routes in FastAPI.
# If /{user_id} is registered first, it catches /detail/..., /history/..., etc.
# =============================================================================

@router.post("/")
async def create_report(req: ReportCreateRequest, user: Any = Depends(verify_token)):
    if user.id != req.user_id:
        return JSONResponse(status_code=403, content={"success": False, "message": "Unauthorized report creation"})

    try:
        client = get_supabase_client()
        data = {
            "user_id": req.user_id,
            "report_data": req.report_data,
        }
        if req.analysis_id:
            data["analysis_id"] = req.analysis_id

        res = client.table("reports").insert(data).execute()
        if not res.data:
            raise Exception("Failed to insert report — no data returned")

        report_id = res.data[0]["id"]
        return JSONResponse(content={"success": True, "report_id": report_id})
    except Exception as e:
        logger.error(f"Error creating report: {e}")
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})


# Static prefix /detail/ must come BEFORE /{user_id}
@router.get("/detail/{report_id}")
async def get_report_detail(report_id: str, user: Any = Depends(verify_token)):
    try:
        client = get_supabase_client()
        res = client.table("reports").select("*").eq("id", report_id).execute()

        if not res.data:
            return JSONResponse(status_code=404, content={"success": False, "message": "Report not found"})

        if res.data[0].get("user_id") != user.id:
            return JSONResponse(status_code=403, content={"success": False, "message": "Unauthorized access to report"})

        report_data = res.data[0].get("report_data", {})
        report_data["id"] = res.data[0]["id"]

        return JSONResponse(content={"success": True, "report": report_data})
    except Exception as e:
        logger.error(f"Error fetching report detail: {e}")
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})


# Static prefix /history/ must come BEFORE /{user_id}
@router.get("/history/{user_id}")
async def get_analysis_history(user_id: str, user: Any = Depends(verify_token)):
    if user.id != user_id:
        return JSONResponse(status_code=403, content={"success": False, "message": "Unauthorized access to history"})

    try:
        client = get_supabase_client()
        res = client.table("analyses").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return JSONResponse(content={"success": True, "history": res.data})
    except Exception as e:
        logger.error(f"Error fetching analysis history: {e}")
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})


# Dynamic /{user_id} must come AFTER all static-prefix routes
@router.get("/{user_id}")
async def get_user_reports(user_id: str, user: Any = Depends(verify_token)):
    if user.id != user_id:
        return JSONResponse(status_code=403, content={"success": False, "message": "Unauthorized access to reports"})

    try:
        client = get_supabase_client()
        res = client.table("reports").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()

        # Extract report_data JSONB and inject the DB row id
        reports = []
        for r in res.data:
            report = dict(r.get("report_data", {}))
            report["id"] = r["id"]  # always use DB UUID as the canonical id
            if not report.get("date"):
                report["date"] = r.get("created_at", "")
            reports.append(report)

        return JSONResponse(content={"success": True, "reports": reports})
    except Exception as e:
        logger.error(f"Error fetching reports: {e}")
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})


# Dynamic /{report_id} DELETE must come AFTER static-prefix routes
@router.delete("/{report_id}")
async def delete_report(report_id: str, user: Any = Depends(verify_token)):
    try:
        client = get_supabase_client()

        # Verify ownership before deleting
        res = client.table("reports").select("user_id").eq("id", report_id).execute()
        if not res.data:
            return JSONResponse(status_code=404, content={"success": False, "message": "Report not found"})

        if res.data[0].get("user_id") != user.id:
            return JSONResponse(status_code=403, content={"success": False, "message": "Unauthorized to delete this report"})

        client.table("reports").delete().eq("id", report_id).execute()
        return JSONResponse(content={"success": True})
    except Exception as e:
        logger.error(f"Error deleting report: {e}")
        return JSONResponse(status_code=500, content={"success": False, "message": str(e)})
