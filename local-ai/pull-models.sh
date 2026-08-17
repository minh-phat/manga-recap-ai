#!/usr/bin/env bash
set -euo pipefail

echo "Pulling vision model (panel detection)..."
ollama pull qwen2.5vl:7b

echo "Pulling text model (narration + translate)..."
ollama pull qwen2.5:14b

echo "Done. Models available:"
ollama list
