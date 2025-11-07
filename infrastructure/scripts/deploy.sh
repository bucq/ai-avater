#!/bin/bash

# ==================================================
# AI Avatar - SAM Deployment Script
# ==================================================
# Usage:
#   ./scripts/deploy.sh          # Deploy to dev environment
#   ./scripts/deploy.sh prod     # Deploy to prod environment
# ==================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get environment (default: dev)
ENVIRONMENT=${1:-dev}

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}AI Avatar - SAM Deployment${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}===================================================${NC}"
echo ""

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
    echo -e "${RED}Error: Invalid environment. Use 'dev' or 'prod'${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "template.yaml" ]; then
    echo -e "${RED}Error: template.yaml not found. Please run from infrastructure/ directory${NC}"
    exit 1
fi

# Step 1: Build
echo -e "${YELLOW}[1/3] Building SAM application...${NC}"
sam build --parallel --cached

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Step 2: Deploy
echo -e "${YELLOW}[2/3] Deploying to AWS...${NC}"

if [ "$ENVIRONMENT" = "prod" ]; then
    # Production deployment - require confirmation
    echo -e "${YELLOW}⚠ WARNING: Deploying to PRODUCTION environment${NC}"
    read -p "Are you sure you want to continue? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
        echo -e "${RED}Deployment cancelled${NC}"
        exit 1
    fi
    sam deploy --config-env prod
else
    # Dev deployment
    sam deploy
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}Deployment failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Deployment successful${NC}"
echo ""

# Step 3: Get outputs
echo -e "${YELLOW}[3/3] Fetching stack outputs...${NC}"
STACK_NAME="ai-avatar-${ENVIRONMENT}"

echo -e "${BLUE}Stack Outputs:${NC}"
aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs' \
    --output table

echo ""
echo -e "${GREEN}===================================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}===================================================${NC}"

# Extract important URLs
API_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`CompleteApiUrl`].OutputValue' \
    --output text)

FRONTEND_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendUrl`].OutputValue' \
    --output text)

echo ""
echo -e "${BLUE}Important URLs:${NC}"
echo -e "  API URL:      ${GREEN}${API_URL}${NC}"
echo -e "  Frontend URL: ${GREEN}https://${FRONTEND_URL}${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Update frontend/.env.production with API URL"
echo -e "  2. Run: cd ../frontend && npm run build"
echo -e "  3. Deploy frontend with: ./scripts/deploy-frontend.sh"
echo ""
