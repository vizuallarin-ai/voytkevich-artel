#!/bin/bash
# Beget VPS first-time setup for stroistroy.ru
# Run on server: bash scripts/beget-vps-setup.sh

set -euo pipefail

bash "$(dirname "$0")/remote-deploy.sh"
