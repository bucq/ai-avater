#!/bin/bash

# ==================================================
# AI Avatar - Local SAM Testing Script
# ==================================================
# Usage:
#   ./scripts/local-invoke.sh api          # Start local API
#   ./scripts/local-invoke.sh function     # Invoke function with test event
# ==================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

MODE=${1:-api}

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}AI Avatar - Local SAM Testing${NC}"
echo -e "${BLUE}===================================================${NC}"
echo ""

# Check if template.yaml exists
if [ ! -f "template.yaml" ]; then
    echo -e "${RED}Error: template.yaml not found${NC}"
    echo -e "${YELLOW}Please run from infrastructure/ directory${NC}"
    exit 1
fi

# Create env.json if it doesn't exist
if [ ! -f "env.json" ]; then
    echo -e "${YELLOW}Creating env.json template...${NC}"
    cat > env.json <<EOF
{
  "BackendFunction": {
    "OPENAI_API_KEY": "sk-your-openai-key-here",
    "OPENAI_MODEL": "gpt-4",
    "GOOGLE_CREDENTIALS_JSON": "",
    "ENVIRONMENT": "local",
    "LOG_LEVEL": "DEBUG"
  }
}
EOF
    echo -e "${GREEN}✓ Created env.json${NC}"
    echo -e "${YELLOW}⚠ Please update env.json with your actual API keys${NC}"
    echo ""
fi

case "$MODE" in
    api)
        echo -e "${YELLOW}Starting local API server...${NC}"
        echo -e "${BLUE}API will be available at: http://localhost:3000${NC}"
        echo -e "${BLUE}Press Ctrl+C to stop${NC}"
        echo ""

        sam local start-api \
            --env-vars env.json \
            --warm-containers EAGER \
            --port 3000
        ;;

    function)
        echo -e "${YELLOW}Invoking function with test event...${NC}"

        # Create test event if it doesn't exist
        mkdir -p events
        if [ ! -f "events/health.json" ]; then
            cat > events/health.json <<EOF
{
  "httpMethod": "GET",
  "path": "/api/health",
  "headers": {
    "Content-Type": "application/json"
  },
  "queryStringParameters": null,
  "body": null
}
EOF
            echo -e "${GREEN}✓ Created events/health.json${NC}"
        fi

        sam local invoke BackendFunction \
            --env-vars env.json \
            --event events/health.json
        ;;

    *)
        echo -e "${RED}Error: Unknown mode '$MODE'${NC}"
        echo -e "${YELLOW}Usage:${NC}"
        echo -e "  ./scripts/local-invoke.sh api       # Start local API"
        echo -e "  ./scripts/local-invoke.sh function  # Invoke function"
        exit 1
        ;;
esac
