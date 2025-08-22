# Python HTTP Function Template

This is a simple and approachable template for creating WASM functions using
Python that comply with the SystemLink Function Management Service requirements.

## Overview

This template demonstrates:

- ✅ Required endpoints (`/`, `/info`)
- ✅ Proper `/info` endpoint following standardized schema
- ✅ Multiple example endpoints showcasing different capabilities
- ✅ Proper error handling with structured responses
- ✅ Input validation and parameter flexibility
- ✅ SystemLink API integration examples

## Function Capabilities

- **Random Number Generation**: Generate random integers via root `/` endpoint
- **Statistical Analysis**: Compute statistics (min, max, mean, standard
  deviation, count) on number arrays via `/stats`
- **Mathematical Computing**: Calculate pi to specified decimal precision via
  `/pi`
- **Python Expression Evaluation**: Evaluate Python expressions via `/eval`
  (demo only)
- **SystemLink Integration**:
  - Create test plans via `/create-testplan`
  - Add custom file properties via `/add-custom-property`

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Build the component**:

   ```bash
   npm run build
   ```

3. **Test locally**:
   ```bash
   npm run start-wasmtime
   ```

## API Examples

### Random Number Generation (Default Execution)

```bash
# Simple random number
curl "http://localhost:8000/"
```

### Statistical Analysis

```bash
curl -X POST http://localhost:8000/stats \
  -H "Content-Type: application/json" \
  -d '{"values": [1, 2, 3, 4, 5, 10, 15, 20]}'
```

### Pi Calculation

```bash
# Calculate pi to 50 decimal places
curl -X POST http://localhost:8000/pi \
  -H "Content-Type: application/json" \
  -d '{"digits": 50}'

# Or via query parameter
curl "http://localhost:8000/pi?digits=100"
```

### Python Expression Evaluation (Demo Only)

```bash
curl -X POST http://localhost:8000/eval \
  -H "Content-Type: application/json" \
  -d '{"expression": "[random.randint(1, 100) for _ in range(5)]"}'
```

### Function Documentation

```bash
curl http://localhost:8000/info
```

## SystemLink Integration Examples

### Create Test Plan

```bash
curl -X POST http://localhost:8000/create-testplan \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "template-123",
    "name": "My Test Plan",
    "state": "NEW",
    "partNumber": "PN-456",
    "baseUrl": "https://your-systemlink-instance.com",
    "apiKey": "your-api-key"
  }'
```

### Add Custom File Property

```bash
curl -X POST http://localhost:8000/add-custom-property \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "file-123",
    "propertyName": "department",
    "propertyValue": "engineering",
    "baseUrl": "https://your-systemlink-instance.com",
    "apiKey": "your-api-key"
  }'
```

## Customizing This Template

1. **Add new endpoints** by defining new `@router.route()` functions
2. **Update the `/info` endpoint** to document your new capabilities
3. **Modify parameter handling** using the `_get_param()` helper for flexible
   input sources
4. **Implement error handling** following the established patterns
5. **Add SystemLink integrations** using the `http_helper.send()` function

## Key Features Demonstrated

- **Flexible Parameter Handling**: Parameters can come from JSON body, query
  string, or headers
- **Comprehensive Error Handling**: Proper HTTP status codes and descriptive
  error messages
- **Self-Documenting**: Complete `/info` endpoint with detailed schemas
- **SystemLink API Integration**: Examples of calling external SystemLink
  services
- **Mathematical Computing**: High-precision calculations using Python's Decimal
  library
- **Input Validation**: Robust parameter validation with clear error messages

## Development Commands

| Command                     | Purpose                    |
| --------------------------- | -------------------------- |
| `npm install`               | Install dependencies       |
| `npm run build`             | Build WASM component       |
| `npm run build:check-types` | Run type checking          |
| `npm run start-wasmtime`    | Test with Wasmtime         |
| `npm run test`              | Basic endpoint test        |
| `npm run test-stats`        | Test statistics endpoint   |
| `npm run test-eval`         | Test expression evaluation |
| `npm run clean`             | Clean build artifacts      |

## Project Structure

```
python-http-function/
├── main.py              # Main function implementation
├── http_helper.py       # HTTP utilities and base classes
├── requirements.txt     # Python dependencies
├── package.json         # Build scripts and Node.js dependencies
├── wit/                 # WebAssembly Interface Type definitions
├── main_world/          # Generated Python bindings
└── dist/                # Built WASM component (after build)
```

## Technical Requirements

- **Target Platform**: `wasm32-wasip1`
- **Component Model**: WASM component with WASI HTTP interface
- **Memory Limit**: 64MB maximum
- **Execution Timeout**: 300 seconds default (configurable)
- **Python Version**: 3.12+ (via componentize-py)

## Best Practices Demonstrated

- **Required Endpoints**: Implements all required routes per SystemLink
  specifications
- **Flexible Parameters**: Supports parameters via body, query string, or
  headers
- **Comprehensive Documentation**: Full `/info` endpoint with JSON schemas
- **Error Handling**: Proper HTTP status codes and structured error responses
- **Input Validation**: Validates all inputs with clear error messages
- **External API Integration**: Shows how to call SystemLink APIs from functions
- **Security Considerations**: Parameter sanitization and debug mode for
  troubleshooting

## Deployment

Once customized, deploy to SystemLink Function Management Service:

1. Build the WASM component: `npm run build`
2. Upload `dist/main.wasm` to the Function Management Service
3. The service will discover capabilities via the `/info` endpoint
4. Test execution through the Function Management Service interface

## Security Notes

- The `/eval` endpoint is included for demonstration purposes only
- **Never use `/eval` with untrusted input** in production environments
- Always validate and sanitize external API parameters
- Use appropriate authentication and authorization for SystemLink API calls

For more details, see the
[Function Best Practices Guide](../FUNCTION_BEST_PRACTICES.md).
