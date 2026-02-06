import express from "express";

import cors from "cors";

import { apiKey, apiServerUrl } from "./proxyConfig.js";
const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple proxy endpoint
app.get("/apiProxy/niauth/v1/auth", async (req, res) => {
  try {
    const response = await fetch(`${apiServerUrl}/niauth/v1/auth`, {
      method: req.method,
      headers: {
        accept: "application/json",
        "x-ni-api-key": apiKey,
      },
    });

    if (!response.ok) {
      return res.status(response.status).send({
        error: "NI API request failed",
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
