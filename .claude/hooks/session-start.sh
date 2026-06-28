#!/bin/bash
set -euo pipefail

# Hanya jalankan dalam persekitaran remote Claude Code pada web
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

echo ">>> Memasang dependencies npm..."
npm install

echo ">>> Dependencies berjaya dipasang."
