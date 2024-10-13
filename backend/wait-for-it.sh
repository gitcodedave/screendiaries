#!/usr/bin/env bash

# Usage: wait-for-it.sh host:port [command]
# Example: wait-for-it.sh db:3306 -- python manage.py runserver 0.0.0.0:8000

set -e

# Get the host:port from the command line arguments
hostport="$1"
shift

# Split host:port into host and port
host="${hostport%:*}"
port="${hostport#*:}"

# Wait for the host to be available
while ! nc -z "$host" "$port"; do
  echo "Waiting for $host to be available on port $port..."
  sleep 1
done

echo "$host is available on port $port"

# Execute the remaining command
exec "$@"
