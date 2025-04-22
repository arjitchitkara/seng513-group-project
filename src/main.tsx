import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/sonner';
import './index.css';

// Add global error handler to help detect rendering issues
const errorHandler = (event: ErrorEvent) => {
  console.error('Uncaught error:', event.error);
  // You can add more detailed logging or error reporting here
  
  // Optionally display an error message on the page
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.padding = '10px';
  errorDiv.style.backgroundColor = 'red';
  errorDiv.style.color = 'white';
  errorDiv.style.textAlign = 'center';
  errorDiv.style.zIndex = '9999';
  errorDiv.textContent = 'Error loading page: ' + (event.error?.message || 'Unknown error');
  document.body.appendChild(errorDiv);
};

window.addEventListener('error', errorHandler);

// Log when app starts rendering
console.log('Starting to render React application');

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <App />
        <Toaster />
      </ThemeProvider>
    </BrowserRouter>
  );
  console.log('React application rendered successfully');
} catch (error) {
  console.error('Failed to render React application:', error);
  // Display a fallback UI
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1>Something went wrong</h1>
      <p>The application couldn't load properly. Please try refreshing the page.</p>
      <p>Error: ${(error as Error).message || 'Unknown error'}</p>
    </div>
  `;
}
