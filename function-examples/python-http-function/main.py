# Modified from https://github.com/fermyon/enterprise-architectures-and-patterns/blob/8f85e27eabc7ff99ff65fa10e3e89fe752f68390/signed-webhooks/webhook-consumer/app.py
import http_helper
from http_helper import Request, Response
from http_router import Router, exceptions  # type: ignore
import random
from urllib.parse import ParseResult, urlparse, parse_qs
import datetime
import json
from decimal import Decimal, getcontext
import math

router = Router(trim_last_slash=True)


@router.route("/", methods=["GET"])
def route_random_number(uri: ParseResult, request: Request) -> Response:
    print("running random number route")
    random_number = random.randint(1, 1000)
    response = bytes(json.dumps({"random_number": random_number}), "utf-8")
    return Response(200, {"content-type": "application/json"}, response)


@router.route("/stats", methods=["POST"])
def route_stats(uri: ParseResult, request: Request) -> Response:
    print("running stats route")
    if not request.body:
        return Response(400, {"content-type": "text/plain"}, b"Need a body")
    result = json.loads(request.body.decode("utf-8"))
    if not result:
        return Response(400, {"content-type": "text/plain"}, b"Need valid json")
    values = result.get("values")
    mean = sum(values) / len(values)
    response = bytes(
        json.dumps(
            {
                "min": min(values),
                "max": max(values),
                "mean": mean,
                "stdDev": math.sqrt(sum((x - mean) ** 2 for x in values) / len(values)),
                "count": len(values),
            }
        ),
        "utf-8",
    )
    return Response(200, {"content-type": "application/json"}, response)


@router.route("/eval", methods=["POST"])
def route_eval(uri: ParseResult, request: Request) -> Response:
    print("running eval route")
    if not request.body:
        return Response(400, {"content-type": "text/plain"}, b"Need a body")
    result = json.loads(request.body.decode("utf-8"))
    if not result:
        return Response(400, {"content-type": "text/plain"}, b"Need valid json")
    expression = result.get("expression")
    try:
        expression_result = bytes(json.dumps(eval(expression)), "utf-8")
        return Response(200, {"content-type": "application/json"}, expression_result)
    except Exception as e:
        print(e)
        return Response(
            400,
            {"content-type": "text/plain"},
            b"Error in eval: " + str(e).encode("utf-8"),
        )


@router.route("/pi", methods=["GET", "POST"])
def route_pi(uri: ParseResult, request: Request) -> Response:
    """Calculate pi to a specified number of decimal digits.
    Accepts `digits` via JSON body, query string, or headers (x-digits).
    Caps computation to a safe maximum to avoid excessive CPU.
    """
    print("running pi route")
    body_obj = {}
    if request.body:
        try:
            body_obj = json.loads(request.body.decode("utf-8"))
        except Exception:
            # For GET or non-JSON, ignore body parse errors
            body_obj = {}

    raw_digits = _get_param(uri, request, body_obj, ["digits", "x-digits"])
    if raw_digits is None or str(raw_digits).strip() == "":
        return Response(400, {"content-type": "text/plain"}, b"Missing 'digits'")

    try:
        digits = int(str(raw_digits))
    except Exception:
        return Response(
            400, {"content-type": "text/plain"}, b"'digits' must be an integer"
        )

    if digits < 1:
        return Response(400, {"content-type": "text/plain"}, b"'digits' must be >= 1")

    MAX_DIGITS = 5000
    if digits > MAX_DIGITS:
        digits = MAX_DIGITS

    # Compute pi using the Gauss–Legendre algorithm with Decimal
    # Set precision a bit higher than requested to reduce rounding error
    extra = 10
    getcontext().prec = digits + extra

    one = Decimal(1)
    two = Decimal(2)
    four = Decimal(4)

    a = one
    b = one / two.sqrt()  # 1/sqrt(2)
    t = Decimal(1) / four
    p = one

    prev_pi: Decimal | None = None
    # Target absolute tolerance for stabilization at the requested digits
    tol = Decimal(10) ** (-(digits + 2))

    for _ in range(20):  # Quadratic convergence: this is ample for thousands of digits
        an = (a + b) / two
        b = (a * b).sqrt()
        t = t - p * (a - an) ** 2
        a = an
        p = two * p
        pi_est = ((a + b) ** 2) / (four * t)
        if prev_pi is not None and abs(pi_est - prev_pi) < tol:
            prev_pi = pi_est
            break
        prev_pi = pi_est

    if prev_pi is None:
        prev_pi = ((a + b) ** 2) / (four * t)

    # Quantize to exact number of decimal places and convert to string
    quant = Decimal(1).scaleb(-digits)  # 10^-digits
    try:
        pi_q = prev_pi.quantize(quant)
    except Exception:
        # Fallback formatting if quantize fails for any edge case
        s = format(prev_pi, f".{digits}f")
    else:
        s = format(pi_q, f".{digits}f")

    result_obj = {"digits": digits, "pi": s, "algorithm": "gauss-legendre"}
    return Response(
        200,
        {"content-type": "application/json"},
        bytes(json.dumps(result_obj), "utf-8"),
    )


@router.route("/info", methods=["GET"])
def route_info(uri: ParseResult, request: Request) -> Response:
    """Discovery endpoint consumed by the function management service.
    Shape intentionally matches expected dynamic interface: endpoints + defaultPath.
    The service will store this JSON (either as-is or via `info.interface || info`).
    """
    interface = {
        "endpoints": [
            {
                "path": "/",
                "methods": ["GET"],
                "description": "Return a random integer",
                "returns": {
                    "type": "object",
                    "properties": {"random_number": {"type": "integer"}},
                },
            },
            {
                "path": "/stats",
                "methods": ["POST"],
                "description": "Compute basic statistics over an array of numbers",
                "parameters": {
                    "type": "object",
                    "required": ["values"],
                    "properties": {
                        "values": {"type": "array", "items": {"type": "number"}}
                    },
                },
                "returns": {
                    "type": "object",
                    "properties": {
                        "min": {"type": "number"},
                        "max": {"type": "number"},
                        "mean": {"type": "number"},
                        "stdDev": {"type": "number"},
                        "count": {"type": "integer"},
                    },
                },
            },
            {
                "path": "/eval",
                "methods": ["POST"],
                "description": "Evaluate a Python expression (demo only; NOT for untrusted input)",
                "parameters": {
                    "type": "object",
                    "required": ["expression"],
                    "properties": {"expression": {"type": "string"}},
                },
                "returns": {
                    "description": "Result of evaluation (JSON-serialized)",
                    "type": ["number", "string", "boolean", "object", "array", "null"],
                },
            },
            {
                "path": "/create-testplan",
                "methods": ["POST"],
                "description": "Create a test plan using NI Work Order API from a template. Allows passing baseUrl and X-NI-API-KEY as parameters.",
                "parameters": {
                    "type": "object",
                    "required": [
                        "templateId",
                        "name",
                        "state",
                        "partNumber",
                        "baseUrl",
                        "apiKey",
                    ],
                    "properties": {
                        "templateId": {
                            "type": "string",
                            "description": "Test plan template ID",
                        },
                        "name": {"type": "string", "description": "New test plan name"},
                        "state": {
                            "type": "string",
                            "description": "State for the new test plan (e.g., NEW, DEFINED, REVIEWED, SCHEDULED, IN_PROGRESS, PENDING_APPROVAL, CLOSED, CANCELED)",
                        },
                        "partNumber": {
                            "type": "string",
                            "description": "Part number for the product under test",
                        },
                        "baseUrl": {
                            "type": "string",
                            "description": "Base URL for NI API, e.g., https://dev-api.lifecyclesolutions.ni.com",
                        },
                        "apiKey": {
                            "type": "string",
                            "description": "Value for X-NI-API-KEY header",
                        },
                    },
                },
                "returns": {
                    "description": "NI API create response passthrough (201/200 on success, default error payload otherwise)",
                    "type": "object",
                },
            },
            {
                "path": "/add-custom-property",
                "methods": ["POST"],
                "description": "Add a custom property with specified name and value to a file via NI File API update-metadata.",
                "parameters": {
                    "type": "object",
                    "required": [
                        "fileId",
                        "baseUrl",
                        "apiKey",
                        "propertyName",
                        "propertyValue",
                    ],
                    "properties": {
                        "fileId": {"type": "string", "description": "Target file ID"},
                        "baseUrl": {
                            "type": "string",
                            "description": "Base URL for NI File API, e.g., https://dev-api.lifecyclesolutions.ni.com",
                        },
                        "apiKey": {
                            "type": "string",
                            "description": "Value for X-NI-API-KEY header",
                        },
                        "propertyName": {
                            "type": "string",
                            "description": "Name of the custom property to add",
                        },
                        "propertyValue": {
                            "type": "string",
                            "description": "Value of the custom property to add",
                        },
                    },
                },
                "returns": {
                    "description": "204 No Content on success (upstream), or error payload on failure",
                    "type": ["object", "null"],
                },
            },
            {
                "path": "/pi",
                "methods": ["GET", "POST"],
                "description": "Calculate the value of pi to a specified number of decimal digits.",
                "parameters": {
                    "type": "object",
                    "required": ["digits"],
                    "properties": {
                        "digits": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 5000,
                            "description": "Number of decimal digits to compute (1-5000)",
                        }
                    },
                },
                "returns": {
                    "type": "object",
                    "properties": {
                        "digits": {"type": "integer"},
                        "pi": {"type": "string"},
                        "algorithm": {"type": "string"},
                    },
                },
            },
        ],
        "defaultPath": "/",
    }
    body = bytes(json.dumps(interface), "utf-8")
    return Response(200, {"content-type": "application/json"}, body)


def _get_param(
    uri: ParseResult, request: Request, body_obj: dict, names: list[str]
) -> str | None:
    # Prefer body value
    for n in names:
        v = body_obj.get(n)
        if v is not None and v != "":
            return v
    # Then query string
    qs = parse_qs(uri.query)
    for n in names:
        vals = qs.get(n)
        if vals and len(vals) > 0 and vals[0] != "":
            return vals[0]
    # Then headers (case-insensitive)
    headers_lower = {k.lower(): v for k, v in request.headers.items()}
    for n in names:
        v = headers_lower.get(n.lower())
        if v is not None and v != "":
            return v
    return None


@router.route("/create-testplan", methods=["POST"])
def route_create_testplan(uri: ParseResult, request: Request) -> Response:
    print("running create-testplan route")
    body_obj = {}
    if request.body:
        try:
            body_obj = json.loads(request.body.decode("utf-8"))
        except Exception as e:
            return Response(400, {"content-type": "text/plain"}, b"Invalid JSON body")

    # Gather parameters from body, query, or headers
    template_id = _get_param(uri, request, body_obj, ["templateId", "template_id"])
    name = _get_param(uri, request, body_obj, ["name"])
    state = _get_param(uri, request, body_obj, ["state"])
    part_number = _get_param(uri, request, body_obj, ["partNumber", "part_number"])
    base_url = (
        _get_param(uri, request, body_obj, ["baseUrl", "base_url", "base-uri"]) or ""
    )
    api_key = (
        _get_param(
            uri,
            request,
            body_obj,
            ["apiKey", "x-ni-api-key", "xNiApiKey", "x-ni-api-key"],
        )
        or ""
    )

    missing = []
    if not template_id:
        missing.append("templateId")
    if not name:
        missing.append("name")
    if not state:
        missing.append("state")
    if not part_number:
        missing.append("partNumber")
    if not base_url:
        missing.append("baseUrl")
    if not api_key:
        missing.append("apiKey (X-NI-API-KEY)")
    if missing:
        msg = f"Missing required parameter(s): {', '.join(missing)}"
        return Response(400, {"content-type": "text/plain"}, msg.encode("utf-8"))

    endpoint = "/niworkorder/v1/testplans"
    url = base_url.rstrip("/") + endpoint
    payload = {
        "testPlans": [
            {
                "name": name,
                "templateId": template_id,
                "state": state,
                "partNumber": part_number,
            }
        ]
    }
    req_headers = {
        "content-type": "application/json",
        "accept": "application/json",
        "X-NI-API-KEY": api_key,
    }

    try:
        upstream = http_helper.send(
            Request("POST", url, req_headers, bytes(json.dumps(payload), "utf-8"))
        )
    except Exception as e:
        print("Error calling NI API:", e)
        return Response(
            502, {"content-type": "text/plain"}, b"Upstream NI API call failed"
        )

    # Pass-through upstream response
    # Ensure content-type defaults for JSON if upstream omitted it
    headers = dict(upstream.headers)
    if upstream.body and (headers.get("content-type") is None):
        headers["content-type"] = "application/json"
    return Response(upstream.status, headers, upstream.body)


@router.route("/add-custom-property", methods=["POST"])
def route_add_custom_property(uri: ParseResult, request: Request) -> Response:
    print("running add-custom-property route")
    body_obj = {}
    if request.body:
        try:
            body_obj = json.loads(request.body.decode("utf-8"))
        except Exception:
            return Response(400, {"content-type": "text/plain"}, b"Invalid JSON body")

    file_id = _get_param(uri, request, body_obj, ["fileId", "file_id", "id"])
    base_url = (
        _get_param(uri, request, body_obj, ["baseUrl", "base_url", "base-uri"]) or ""
    )
    api_key = _get_param(uri, request, body_obj, ["apiKey", "x-ni-api-key"]) or ""
    property_name = _get_param(
        uri, request, body_obj, ["propertyName", "property_name", "name"]
    )
    property_value = _get_param(
        uri, request, body_obj, ["propertyValue", "property_value", "value"]
    )

    missing = []
    if not file_id:
        missing.append("fileId")
    if not base_url:
        missing.append("baseUrl")
    if not api_key:
        missing.append("apiKey (X-NI-API-KEY)")
    if not property_name:
        missing.append("propertyName")
    if not property_value:
        missing.append("propertyValue")
    if missing:
        msg = f"Missing required parameter(s): {', '.join(missing)}"
        return Response(400, {"content-type": "text/plain"}, msg.encode("utf-8"))

    # Compose the NI File API update-metadata URL (service group Default)
    url = f"{base_url.rstrip('/')}/nifile/v1/service-groups/Default/files/{file_id}/update-metadata"
    payload = {"replaceExisting": False, "properties": {property_name: property_value}}
    headers = {
        "content-type": "application/json",
        "accept": "application/json",
        # Help readability by avoiding compressed responses when debugging
        "accept-encoding": "identity",
        # Friendly UA can also help some edge proxies
        "user-agent": "py-wasi-http-app/1.0",
        "X-NI-API-KEY": api_key,
    }
    try:
        upstream = http_helper.send(
            Request("POST", url, headers, bytes(json.dumps(payload), "utf-8"))
        )
    except Exception as e:
        print("Error calling NI File API:", e)
        return Response(
            502, {"content-type": "text/plain"}, b"Upstream NI File API call failed"
        )

    # If debug flag provided (body/query/header), return a diagnostic JSON instead of passthrough
    def _truthy(v: str | None) -> bool:
        if v is None:
            return False
        return str(v).strip().lower() in ["1", "true", "yes", "on"]

    debug_flag = _truthy(
        _get_param(uri, request, body_obj, ["debug", "debugHttp", "x-debug"])
    )

    if debug_flag:
        # Sanitize request headers (avoid leaking API keys)
        req_headers_sanitized = {
            k: ("<redacted>" if k.lower() in ["x-ni-api-key", "authorization"] else v)
            for k, v in headers.items()
        }
        # Prepare response headers map (lowercased for consistency)
        resp_headers = {k.lower(): v for k, v in dict(upstream.headers).items()}
        # Decode body as UTF-8 (best-effort) and truncate for safety
        body_text = None
        truncated = False
        if upstream.body is not None and len(upstream.body) > 0:
            try:
                body_text = upstream.body.decode("utf-8", errors="replace")
            except Exception:
                body_text = "<non-utf8 body>"
            MAX = 8192
            if len(body_text) > MAX:
                body_text = body_text[:MAX]
                truncated = True
        debug_obj = {
            "request": {
                "method": "POST",
                "url": url,
                "headers": req_headers_sanitized,
                "body": payload,
            },
            "response": {
                "status": upstream.status,
                "headers": resp_headers,
                "isRedirect": 300 <= upstream.status < 400,
                "location": resp_headers.get("location"),
                "bodyText": body_text,
                "truncated": truncated,
            },
        }
        return Response(
            200,
            {"content-type": "application/json"},
            bytes(json.dumps(debug_obj), "utf-8"),
        )

    # Default: pass through upstream result (likely 204 No Content)
    return Response(upstream.status, dict(upstream.headers), upstream.body)


class IncomingHandler(http_helper.IncomingHandler):
    def handle_request(self, request: Request) -> Response:
        uri = urlparse(request.uri)
        try:
            # Normalize empty path from host/CLI to root
            path = uri.path if uri.path else "/"
            handler = router(path, request.method)
            return handler.target(uri, request)  # type: ignore
        except exceptions.NotFoundError:
            return Response(404, {}, None)
