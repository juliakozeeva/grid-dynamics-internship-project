#!/bin/bash

frontend_target="FRONTEND"
backend_target="BACKEND"

if [ "$TARGET_APP" == "$frontend_target" ]; then
  bash ./deployment/serve/frontend.sh
else 
  if [ "$TARGET_APP" == "$backend_target" ]; then
    bash ./deployment/serve/backend.sh
  else
    echo "Target is not specified. Please see /deployment/README.md"
  fi
fi
