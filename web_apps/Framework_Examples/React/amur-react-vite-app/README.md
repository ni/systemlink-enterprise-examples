# React Demo for SystemLink

A minimal setup to get this demo working on your local machine with a React frontend and Node.js backend.

## Prerequisites

- **Node.js** v22.16.0 or higher

## Getting Started

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

4. Configure your API key in `src/config.ts` with your SystemLink credentials.

### Backend Setup

> **Note:** The frontend calls a backend proxy running on `localhost:4000`, which in turn calls the SystemLink server. This avoids CORS errors that would occur from direct frontend-to-server calls.

1. Navigate to the `service` directory:
   ```bash
   cd service
   ```

2. Create a `config.json` file with your API key:
   ```json
   {
       "api_key": "your-api-key-here"
   }
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the backend server:
   ```bash
   node index.js
   ```

## Testing

1. Open your browser's developer console (F12)
2. Click the **Make API Call** button in the application
3. You should see the response printed in your console

---

For more information, visit the [SystemLink Enterprise Examples repository](https://github.com/ni/systemlink-enterprise-examples) 