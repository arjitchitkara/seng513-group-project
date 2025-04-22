#!/bin/sh

# This script injects environment variables into the frontend app at runtime

# Path to the directory containing the built frontend files
APP_DIR=/usr/share/nginx/html

# Generate runtime environment variables in a JS file
echo "window.RUNTIME_ENV = {" > ${APP_DIR}/env-config.js
echo "  VITE_API_URL: '${VITE_API_URL}'," >> ${APP_DIR}/env-config.js
echo "  VITE_SUPABASE_URL: '${VITE_SUPABASE_URL}'," >> ${APP_DIR}/env-config.js
echo "  VITE_SUPABASE_ANON_KEY: '${VITE_SUPABASE_ANON_KEY}'," >> ${APP_DIR}/env-config.js
echo "};" >> ${APP_DIR}/env-config.js

# Ensure script ran successfully
echo "Environment configuration injected successfully" 