from fastapi.responses import JSONResponse


def direct_response(result: dict):
    if "error" in result:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": result["error"], **result},
        )
    return {"status": "success", **result}
