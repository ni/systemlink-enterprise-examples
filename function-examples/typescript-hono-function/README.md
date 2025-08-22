# Hono Function Template

This is a template for creating WASM functions using Hono.js that comply with
the SystemLink Function Management Service requirements.

## Overview

This template demonstrates:

- ✅ Required endpoints (`/`, `/info`)
- ✅ Proper `/info` endpoint following standardized schema
- ✅ Modern parameter patterns for default execution at root `/` via GET
- ✅ Proper error handling with structured error responses
- ✅ Input validation and type safety
- ✅ Multiple endpoint examples (`/random`, `/stats`)

## Function Capabilities

- **Hello World Greeting**: Simple greeting with optional name parameter via
  root `/` endpoint
- **Random Number Generation**: Generate random integers via `/random`
- **Statistical Analysis**: Compute statistics (min, max, mean, standard
  deviation, count) on number arrays via `/stats`

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
   # or
   npm run start-jco
   ```

## API Examples

### Hello World Greeting (Default Execution)

```bash
# Simple greeting
curl "http://localhost:8000/"

# Greeting with name
curl "http://localhost:8000/?name=World"
```

### Random Number Generation

```bash
curl http://localhost:8000/random
```

### Statistical Analysis

```bash
curl -X POST http://localhost:8000/stats \
  -H "Content-Type: application/json" \
  -d '{"values": [1, 2, 3, 4, 5]}'
```

### Function Documentation

```bash
curl http://localhost:8000/info
```

## Customizing This Template

1. **Update service metadata** in `/info` endpoint
2. **Modify root `/` GET logic** for your specific operations
3. **Add new endpoints** as needed
4. **Update endpoint documentation** in `/info` response
5. **Implement proper error handling** for your use cases

## Best Practices Demonstrated

- **Required Endpoints**: Implements all required routes per best practices
- **Structured Parameters**: Uses `operation`/`operands` instead of legacy
  patterns
- **Comprehensive Documentation**: Full `/info` endpoint with schemas
- **Error Handling**: Proper HTTP status codes and structured error responses
- **Input Validation**: Validates all inputs with clear error messages
- **Type Safety**: Uses TypeScript for better development experience

## Deployment

Once customized, deploy to SystemLink Function Management Service:

1. Build the WASM component: `npm run build`
2. Upload `dist/main.wasm` to the Function Management Service
3. The service will discover capabilities via the `/info` endpoint

## Development Commands

| Command                  | Purpose               |
| ------------------------ | --------------------- |
| `npm run build`          | Build WASM component  |
| `npm run start-wasmtime` | Test with Wasmtime    |
| `npm run start-jco`      | Test with JCO         |
| `npm run start-node`     | Test with Node.js     |
| `npm run clean`          | Clean build artifacts |

For more details, see the
[Function Best Practices Guide](../FUNCTION_BEST_PRACTICES.md).
