# Function Best Practices Guide

## SystemLink Function Management Service - Hosted Functions Requirements

This document outlines the requirements and best practices for developing functions that can be hosted and executed by the **SystemLink Function Management Service** (`hono-function-management-app`).

---

## Table of Contents

1. [Overview](#overview)
2. [Technical Requirements](#technical-requirements)
3. [WASM Component Model](#wasm-component-model)
4. [HTTP Proxy Interface](#http-proxy-interface)
5. [Info Endpoint Schema](#info-endpoint-schema)
6. [Parameter Schema](#parameter-schema)
7. [Function Interface Definition](#function-interface-definition)
8. [Error Handling](#error-handling)
9. [Performance Considerations](#performance-considerations)
10. [Examples](#examples)
11. [Testing](#testing)
12. [Deployment](#deployment)

---

## Overview

The SystemLink Function Management Service provides a comprehensive platform for hosting, managing, and executing WebAssembly (WASM) functions with HTTP interfaces. Functions are executed via a WASI HTTP proxy using the WASM Component Model.

### Key Features

- **WASM Component Model**: Full support for WASI 0.2+ components
- **HTTP Proxy Interface**: Functions receive HTTP requests and return HTTP responses
- **Synchronous Execution**: Deterministic, immediate function execution
- **Resource Management**: Memory limits, timeout handling, and concurrent execution limits
- **Interface Documentation**: Self-documenting functions via `/info` endpoints

---

## Technical Requirements

### Core Requirements

1. **Target Platform**: `wasm32-wasip1` or `wasm32-wasip2`
2. **Component Model**: Must be a valid WASM component (not a WASM module)
3. **Interface**: Must export `wasi:http/incoming-handler@0.2.3` or later
4. **Runtime**: `wasm` (only supported runtime)
5. **Memory Limit**: 64MB maximum memory usage
6. **Execution Timeout**: 1-3600 seconds (default: 300 seconds)
7. **Concurrent Execution**: Maximum 100 concurrent executions per service instance

### Configuration Options

The Function Management Service supports the following environment variables:

- **`EXEC_MAX_CONCURRENT`**: Maximum concurrent executions (default: 100)
- **`EXEC_MEMORY_LIMIT_MB`**: Memory limit in MB (default: 64)
- **`EXEC_DEFAULT_TIMEOUT`**: Default timeout in seconds (default: 300)
- **`EXEC_MAX_TIMEOUT`**: Maximum timeout in seconds (default: 3600)

### Language Support

Functions can be written in any language that compiles to WASM components:

- **Rust**: Using `cargo-component`
- **JavaScript/TypeScript**: Using `jco componentize`
- **Python**: Using `componentize-py`
- **C/C++**: Using `wit-bindgen` and appropriate toolchains

---

## WASM Component Model

### WIT Interface Definition

All functions must implement the WASI HTTP incoming handler interface:

```wit
package main-namespace:main-package;

world main-world {
  import wasi:cli/environment@0.2.3;           // Optional: for environment variables
  import wasi:clocks/wall-clock@0.2.3;        // Optional: for timestamps
  import wasi:http/outgoing-handler@0.2.3;    // Optional: for making HTTP requests
  import wasi:nn/tensor@0.2.0-rc-2024-10-28;  // Optional: for ML capabilities
  // ... other imports as needed

  export wasi:http/incoming-handler@0.2.3;    // Required: HTTP handler export
}
```

### Component Structure

```
your-function/
├── wit/
│   ├── main.wit              # WIT interface definition
│   └── deps/                 # WASI interface dependencies
├── src/
│   └── lib.rs|main.ts|main.py  # Function implementation
├── Cargo.toml|package.json   # Build configuration
└── README.md                 # Function documentation
```

---

## HTTP Proxy Interface

### Request Format

Functions receive HTTP requests in this format:

```json
{
  "method": "GET",
  "scheme": "http",
  "path_with_query": "/?operation=add&operands=10,5",
  "headers": {
    "accept": "application/json"
  }
}
```

### Response Format

Functions must return valid HTTP responses:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 25

{"result": 15}
```

### Default Routes

Functions should implement these routes:

| Route   | Method | Purpose                    | Required |
| ------- | ------ | -------------------------- | -------- |
| `/`     | GET    | Default function execution | ✅       |
| `/info` | GET    | Function documentation     | ✅       |

**Important Notes:**

- **Default Execution**: When no specific path or method is provided in execution parameters, the Function Management Service will invoke the root path `/` with a GET request
- **GET Convention**: The `/` endpoint handles GET requests for both welcome/health checks and function execution
- **Path Flexibility**: You can implement additional endpoints beyond `/` for specific use cases and document them in the `/info` response

---

## Info Endpoint Schema

### Required `/info` Endpoint

All functions **MUST** implement a `/info` endpoint that returns comprehensive documentation about the function's capabilities, interfaces, and available endpoints.

**Endpoint Requirements:**

- **Path**: `GET /info`
- **Response Format**: JSON
- **Content-Type**: `application/json`
- **Timeout**: Must respond within 10 seconds during function discovery
- **Purpose**: Self-documenting interface for the Function Management Service

**When `/info` is Called:**

1. **During Function Registration**: The service calls `/info` when a function is first uploaded to discover its capabilities
2. **Interface Discovery**: Used to enhance the default interface schema with function-specific details
3. **Documentation**: Provides comprehensive API documentation for function consumers

### Response Schema

The `/info` endpoint should return a JSON object following this structure:

```typescript
interface FunctionInfo {
  service: {
    name: string; // Human-readable function name
    version: string; // Semantic version (e.g., "1.0.0")
    description: string; // Function description
  };
  interfaces: {
    "wasi:http/proxy": {
      version: string; // WASI HTTP interface version
      description: string;
      supported: boolean;
    };
    // Additional WASI interfaces (optional)
    [interfaceName: string]: {
      version: string;
      description: string;
      supported: boolean;
      backends?: string[]; // For wasi:nn, etc.
      models?: string[];
    };
  };
  endpoints: {
    [path: string]: {
      method: string | string[]; // HTTP methods supported
      description: string; // What this endpoint does
      content_type: string; // Expected/returned content type
      input_schema?: JSONSchema; // Input validation schema (optional)
      output_schema?: JSONSchema; // Output schema (optional)
      requires_feature?: string; // Required feature flags (optional)
    };
  };
  capabilities: {
    streaming: boolean; // Supports streaming responses
    async_operations: boolean; // Supports async operations
    [capability: string]: boolean | string[]; // Additional capabilities
  };
  build_info: {
    target: string; // Build target (e.g., "wasm32-wasip1")
    [feature: string]: boolean | string; // Build features and flags
  };
}
```

### Implementation Guidelines

**Required Sections:**

1. **`service`**: Basic metadata about your function
2. **`interfaces`**: WASI interfaces your function implements
3. **`endpoints`**: All HTTP endpoints your function provides
4. **`capabilities`**: What your function can do
5. **`build_info`**: Build and compilation details

**Endpoint Documentation Best Practices:**

- **Document ALL endpoints**: Include every path your function handles
- **Specify HTTP methods**: List all supported methods for each endpoint
- **Provide schemas**: Include JSON schemas for inputs and outputs when possible
- **Describe purpose**: Clear, concise descriptions of what each endpoint does
- **Indicate requirements**: Note any special requirements or feature dependencies

### Example Info Response

```json
{
  "service": {
    "name": "Math Functions Service",
    "version": "1.0.0",
    "description": "Basic mathematical operations"
  },
  "interfaces": {
    "wasi:http/proxy": {
      "version": "0.2.3",
      "description": "HTTP proxy interface",
      "supported": true
    }
  },
  "endpoints": {
    "/info": {
      "method": "GET",
      "description": "Function documentation",
      "content_type": "application/json"
    },
    "/": {
      "method": "GET",
      "description": "Execute mathematical operations via query parameters",
      "content_type": "application/json",
      "input_schema": {
        "type": "object",
        "properties": {
          "operation": {
            "type": "string",
            "enum": ["add", "subtract", "multiply", "divide"]
          },
          "operand1": { "type": "number" },
          "operand2": { "type": "number" }
        },
        "required": ["operation", "operand1", "operand2"]
      },
      "output_schema": {
        "type": "object",
        "properties": {
          "result": { "type": "number" }
        }
      }
    },
    "/calculate": {
      "method": "POST",
      "description": "Alternative endpoint for mathematical operations with different parameter format",
      "content_type": "application/json"
    }
  },
  "capabilities": {
    "streaming": false,
    "async_operations": false,
    "supported_operations": ["add", "subtract", "multiply", "divide"]
  },
  "build_info": {
    "target": "wasm32-wasip1"
  }
}
```

---

## Parameter Schema

### Execution Parameters

The Function Management Service expects execution parameters in this format:

```typescript
interface ExecutionParameters {
  // HTTP-level parameters
  method?: string; // Default: "GET"
  path?: string; // Default: "/"
  headers?: Record<string, string>;
  timeoutSeconds?: number; // 1-3600, default: 300

  // Function-level parameters (passed as query params or headers)
  [key: string]: any; // Parameters to pass to function
}
```

**Parameter Processing Logic:**

1. **Method**: Defaults to "GET", can be overridden
2. **Path**: Defaults to "/", can be overridden to target specific endpoints
3. **Headers**: Automatically includes `accept: application/json` for requests
4. **Parameters**: For GET requests, parameters can be passed as query parameters or custom headers
5. **Timeout**: Maps to execution timeout (overrides function-level timeout)

**Default Execution Behavior:**
When you execute a function without specifying a path or method, the Function Management Service will:

1. Send a GET request to the root path `/`
2. Include your parameters as query parameters or custom headers
3. Expect your function to handle this at the default endpoint

**Mapping to HTTP Request:**
The execution parameters are mapped directly to the HTTP request body, allowing for flexible parameter structures based on your function's requirements.

### Standard Parameter Patterns

#### Simple GET Parameters

```json
{
  "method": "GET",
  "path": "/?operation=add&value1=10&value2=5"
}
```

#### Complex Parameters via Headers

```json
{
  "method": "GET",
  "path": "/process",
  "headers": {
    "x-data": "[1,2,3,4,5]",
    "x-algorithm": "standard"
  }
}
```

#### Machine Learning Parameters

```json
{
  "method": "GET",
  "path": "/classify",
  "headers": {
    "x-image-data": "base64-encoded-image-data",
    "x-model": "squeezenet1.1-7"
  }
}
```

---

## Function Interface Definition

### Interface Schema

Functions should define their interface in the SystemLink metadata:

```typescript
interface FunctionInterface {
  entrypoint?: string; // Default function to call
  parameters?: JSONSchema; // Input validation schema
  returns?: JSONSchema; // Output schema
  availableFunctions?: Record<
    string,
    {
      // All available functions
      description: string;
      parameters: JSONSchema;
      returns: JSONSchema;
    }
  >;
}
```

### Example Interface Definition

```json
{
  "entrypoint": "add",
  "parameters": {
    "type": "object",
    "properties": {
      "operation": {
        "type": "string",
        "enum": ["add", "subtract", "multiply", "divide"]
      },
      "operands": {
        "type": "array",
        "items": { "type": "number" },
        "minItems": 2,
        "maxItems": 2
      }
    },
    "required": ["operation", "operands"]
  },
  "returns": {
    "type": "object",
    "properties": {
      "result": { "type": "number" }
    }
  },
  "availableFunctions": {
    "add": {
      "description": "Add two numbers",
      "parameters": {
        "type": "array",
        "items": { "type": "number" },
        "minItems": 2,
        "maxItems": 2
      },
      "returns": { "type": "number" }
    },
    "subtract": {
      "description": "Subtract two numbers",
      "parameters": {
        "type": "array",
        "items": { "type": "number" },
        "minItems": 2,
        "maxItems": 2
      },
      "returns": { "type": "number" }
    }
  }
}
```

---

## Error Handling

### HTTP Status Codes

Functions should return appropriate HTTP status codes:

- **200 OK**: Successful execution
- **400 Bad Request**: Invalid input parameters
- **404 Not Found**: Unknown endpoint or function
- **405 Method Not Allowed**: Unsupported HTTP method
- **408 Request Timeout**: Execution timeout
- **500 Internal Server Error**: Function execution error

### Error Response Format

```json
{
  "error": {
    "name": "ValidationError",
    "code": 400,
    "message": "Invalid function parameters",
    "details": {
      "field": "args",
      "reason": "Array must contain exactly 2 numbers"
    }
  }
}
```

### Error Handling Best Practices

1. **Validate inputs early**: Check parameters before processing
2. **Provide specific error messages**: Help users understand what went wrong
3. **Use appropriate status codes**: Follow HTTP conventions
4. **Log errors internally**: Capture stack traces for debugging
5. **Don't expose sensitive information**: Sanitize error messages

---

## Performance Considerations

### Resource Limits

- **Memory**: 64MB maximum per execution
- **Timeout**: 300 seconds default, 3600 seconds maximum
- **Concurrency**: 100 maximum concurrent executions
- **File I/O**: Limited to temporary directories

### Optimization Tips

1. **Minimize memory allocation**: Reuse objects when possible
2. **Avoid blocking operations**: Use async patterns appropriately
3. **Cache expensive computations**: Store results for repeated inputs
4. **Optimize startup time**: Minimize initialization overhead
5. **Use streaming for large data**: Process data incrementally

### Performance Monitoring

Functions should track and report:

- Execution time
- Memory usage
- Success/failure rates
- Input/output sizes

---

## Examples

### 1. Simple Math Function (Rust)

```rust
use wstd::http::{Request, Response, StatusCode};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct MathRequest {
    operation: String,
    operands: Vec<f64>,
}

#[derive(Serialize)]
struct MathResponse {
    result: f64,
}

#[wstd::http_server]
async fn main(req: Request<IncomingBody>, res: Responder) -> Finished {
    match (req.method(), req.uri().path_and_query().unwrap().as_str()) {
        (&Method::GET, "/") => execute_function(req, res).await,
        (&Method::GET, "/info") => info(req, res).await,
        (&Method::POST, "/calculate") => calculate(req, res).await,
        _ => not_found(req, res).await,
    }
}

async fn execute_function(req: Request<IncomingBody>, res: Responder) -> Finished {
    // Parse query parameters
    let query = req.uri().query().unwrap_or("");
    let params: HashMap<String, String> = /* parse query string */;

    let operation = params.get("operation").unwrap_or("add");
    let operand1: f64 = params.get("operand1").unwrap_or("0").parse().unwrap_or(0.0);
    let operand2: f64 = params.get("operand2").unwrap_or("0").parse().unwrap_or(0.0);

    let result = match operation {
        "add" => operand1 + operand2,
        "subtract" => operand1 - operand2,
        "multiply" => operand1 * operand2,
        "divide" => operand1 / operand2,
        _ => return error_response("Unknown operation", res).await,
    };

    let response = MathResponse { result };
    json_response(response, res).await
}
```

### 2. Hono.js Function (TypeScript)

```typescript
import { Hono } from "hono";

const app = new Hono();

app.get("/info", (c) => {
  return c.json({
    service: {
      name: "Math Functions Service",
      version: "1.0.0",
      description: "Basic mathematical operations",
    },
    endpoints: {
      "/": {
        method: "GET",
        description: "Execute mathematical operations via query parameters",
      },
      "/info": {
        method: "GET",
        description: "Service documentation",
      },
    },
  });
});

// Handle function execution at root endpoint via GET
app.get("/", async (c) => {
  const operation = c.req.query("operation") || "add";
  const operand1 = parseFloat(c.req.query("operand1") || "0");
  const operand2 = parseFloat(c.req.query("operand2") || "0");

  let result;
  switch (operation) {
    case "add":
      result = operand1 + operand2;
      break;
    case "subtract":
      result = operand1 - operand2;
      break;
    default:
      return c.json({ error: "Unknown operation" }, 400);
  }

  return c.json({ result });
});

// Alternative endpoint for different operation format
app.post("/calculate", async (c) => {
  const { operation, operands } = await c.req.json();
  // Handle different parameter format
  return c.json({ result: /* calculation */ });
});

app.fire();
```

### 3. Python Function

```python
from componentize_py import wit_bindgen
from typing import Dict, Any

def handle_request(request: Dict[str, Any]) -> Dict[str, Any]:
    path = request.get('path_with_query', '/')
    method = request.get('method', 'GET')

    if path == '/info' and method == 'GET':
        return {
            'status': 200,
            'headers': {'content-type': 'application/json'},
            'body': json.dumps({
                'service': {
                    'name': 'Math Functions Service',
                    'version': '1.0.0'
                },
                'endpoints': {
                    '/': {
                        'method': 'GET',
                        'description': 'Execute mathematical operations via query parameters'
                    }
                }
            })
        }
    elif path.startswith('/') and method == 'GET':
        # Parse query parameters from path_with_query
        query_params = parse_query_string(path)
        operation = query_params.get('operation', 'add')
        operand1 = float(query_params.get('operand1', 0))
        operand2 = float(query_params.get('operand2', 0))

        if operation == 'add':
            result = operand1 + operand2
        elif operation == 'subtract':
            result = operand1 - operand2
        else:
            return {
                'status': 400,
                'headers': {'content-type': 'application/json'},
                'body': json.dumps({'error': 'Unknown operation'})
            }

        return {
            'status': 200,
            'headers': {'content-type': 'application/json'},
            'body': json.dumps({'result': result})
        }
```

---

## Testing

### Local Testing with WASI HTTP CLI

Use the enhanced WASI HTTP CLI for local testing:

```bash
# Build your function
cargo component build --release

# Create test request (default execution at root endpoint)
echo '{
  "method": "GET",
  "scheme": "http",
  "path_with_query": "/?operation=add&operand1=10&operand2=5",
  "headers": {"accept": "application/json"}
}' > test_request.json

# Test info endpoint
echo '{
  "method": "GET",
  "scheme": "http",
  "path_with_query": "/info",
  "headers": {"accept": "application/json"}
}' > test_info.json

# Test with CLI
./wasi_http_cli target/wasm32-wasip1/release/your_function.wasm test_request.json
```

### Test Cases

1. **Info Endpoint**: Verify `/info` returns valid schema
2. **Function Execution**: Test all available functions
3. **Error Handling**: Test with invalid inputs
4. **Performance**: Measure execution time and memory usage
5. **Resource Limits**: Test timeout and memory limits

### Integration Testing

```typescript
// Example test with Function Management Service
const response = await fetch(
  "/nifunction/v2/functions/your-function-id/execute",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      parameters: {
        operation: "add",
        operand1: 10,
        operand2: 5,
      },
      timeout: 30,
    }),
  }
);

const result = await response.json();
assert(result.result === 15);
```

---

## Deployment

### Function Upload

1. **Build component**: Create optimized WASM component
2. **Create function**: POST to `/nifunction/v2/functions`
3. **Upload content**: PUT WASM bytes to `/nifunction/v2/functions/{id}/content`
4. **Test execution**: POST to `/nifunction/v2/functions/{id}/execute`

### Metadata Requirements

```json
{
  "name": "math-functions",
  "description": "Basic mathematical operations service",
  "workspaceId": "workspace-uuid",
  "version": "1.0.0",
  "runtime": "wasm",
  "interface": {
    "entrypoint": "add",
    "parameters": {
      /* JSON Schema */
    },
    "returns": {
      /* JSON Schema */
    }
  },
  "properties": {
    "category": "mathematics",
    "language": "rust"
  }
}
```

### Best Practices

1. **Version management**: Use semantic versioning
2. **Documentation**: Include comprehensive README
3. **Error monitoring**: Track execution failures
4. **Performance monitoring**: Monitor execution times
5. **Resource usage**: Track memory and CPU usage

---

## Compliance Checklist

Before deploying your function, ensure:

- [ ] **Component Model**: Valid WASM component with required exports
- [ ] **HTTP Interface**: Implements `wasi:http/incoming-handler`
- [ ] **Info Endpoint**: Returns complete function documentation
- [ ] **Error Handling**: Proper HTTP status codes and error messages
- [ ] **Parameter Validation**: Input validation with clear error messages
- [ ] **Performance**: Optimized for memory and execution time limits
- [ ] **Testing**: Comprehensive test coverage
- [ ] **Documentation**: Clear README and interface documentation

---

## Support and Resources

- **WASI Documentation**: https://wasi.dev/
- **Component Model**: https://component-model.bytecodealliance.org/
- **SystemLink API**: Internal API documentation
- **Example Functions**: See `examples/` directory for reference implementations

For questions and support, contact the SystemLink Function Management team.
