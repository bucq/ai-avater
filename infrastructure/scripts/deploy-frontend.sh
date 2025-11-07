#!/bin/bash

# ==================================================
# AI Avatar - Frontend Deployment Script
# ==================================================
# Usage:
#   ./scripts/deploy-frontend.sh          # Deploy to dev
#   ./scripts/deploy-frontend.sh prod     # Deploy to prod
# ==================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENVIRONMENT=${1:-dev}
STACK_NAME="ai-avatar-${ENVIRONMENT}"

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}Frontend Deployment - ${ENVIRONMENT}${NC}"
echo -e "${BLUE}===================================================${NC}"
echo ""

# Get S3 bucket and CloudFront distribution ID from CloudFormation
echo -e "${YELLOW}[1/4] Getting deployment targets...${NC}"
BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
    --output text)

DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
    --output text)

if [ -z "$BUCKET_NAME" ] || [ -z "$DISTRIBUTION_ID" ]; then
    echo -e "${RED}Error: Could not get bucket or distribution ID${NC}"
    echo -e "${RED}Make sure the backend stack is deployed first${NC}"
    exit 1
fi

echo -e "  S3 Bucket: ${GREEN}${BUCKET_NAME}${NC}"
echo -e "  CloudFront Distribution: ${GREEN}${DISTRIBUTION_ID}${NC}"
echo ""

# Check if frontend build exists
if [ ! -d "../frontend/dist" ]; then
    echo -e "${RED}Error: Frontend build not found${NC}"
    echo -e "${YELLOW}Please run: cd ../frontend && npm run build${NC}"
    exit 1
fi

# Upload to S3
echo -e "${YELLOW}[2/4] Uploading to S3...${NC}"
aws s3 sync ../frontend/dist/ "s3://${BUCKET_NAME}/" \
    --delete \
    --cache-control "public,max-age=31536000,immutable" \
    --exclude "index.html" \
    --exclude "*.map"

# Upload index.html with no cache
aws s3 cp ../frontend/dist/index.html "s3://${BUCKET_NAME}/index.html" \
    --cache-control "public,max-age=0,must-revalidate" \
    --content-type "text/html"

echo -e "${GREEN}✓ Upload complete${NC}"
echo ""

# Invalidate CloudFront cache
echo -e "${YELLOW}[3/4] Invalidating CloudFront cache...${NC}"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

echo -e "  Invalidation ID: ${GREEN}${INVALIDATION_ID}${NC}"
echo -e "${GREEN}✓ Cache invalidation started${NC}"
echo ""

# Get URLs
echo -e "${YELLOW}[4/4] Getting URLs...${NC}"
CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' \
    --output text)

echo ""
echo -e "${GREEN}===================================================${NC}"
echo -e "${GREEN}Frontend Deployment Complete!${NC}"
echo -e "${GREEN}===================================================${NC}"
echo ""
echo -e "${BLUE}Frontend URL:${NC} ${GREEN}https://${CLOUDFRONT_URL}${NC}"
echo ""
echo -e "${YELLOW}Note: CloudFront cache invalidation may take 5-10 minutes${NC}"
echo ""
