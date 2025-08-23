const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Proxy API calls to your Python backend
// Replace 'http://your-python-backend-url' with your actual Python backend URL
app.use('/api', createProxyMiddleware({
  target: process.env.BACKEND_URL || 'http://localhost:8000', // Your Python backend URL
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remove /api prefix when forwarding to backend
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.status(500).json({ error: 'Backend service unavailable' });
  }
}));

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Backend URL: ${process.env.BACKEND_URL || 'http://localhost:8000'}`);
});
