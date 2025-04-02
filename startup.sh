#!/bin/sh
# Production startup script for the Fitness Tracker MVP backend service.

# Exit immediately if a command exits with a non-zero status.
set -e

# Log script initiation for clarity in deployment logs.
echo "[startup.sh] Initiating backend service startup..."

# Execute the production start command for the 'backend' workspace.
# This command is defined in the root package.json's scripts section.
# `npm start --workspace=backend` effectively runs `node server.js` within the backend directory.
#
# Using 'exec' is crucial: it replaces the current shell process with the Node.js process.
# This ensures the Node.js application becomes the main process (e.g., PID 1 in a container)
# and can correctly receive OS signals like SIGTERM or SIGINT for graceful shutdown,
# as handled within backend/server.js.
echo "[startup.sh] Executing backend start command: npm start --workspace=backend"
exec npm start --workspace=backend