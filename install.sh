#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
#  Polyswitch Cloud Control Plane - 1-Line VPS Auto-Installer
# ─────────────────────────────────────────────────────────────

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  ____       _       _           _      ____ _                 _ "
echo " |  _ \ ___ | |_   _| |__   ___ | |_   / ___| | ___  _   _  __| |"
echo " | |_) / _ \| | | | | '_ \ / _ \| __| | |   | |/ _ \| | | |/ _\` |"
echo " |  __/ (_) | | |_| | |_) | (_) | |_  | |___| | (_) | |_| | (_| |"
echo " |_|   \___/|_|\__, |_.__/ \___/ \__|  \____|_|\___/ \__,_|\__,_|"
echo "               |___/                                             "
echo -e "${NC}"
echo -e "${GREEN}>>> Installing Polyswitch Cloud Web Control Plane...${NC}"

# Check root/sudo
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}[!] This installer must be run as root (or with sudo).${NC}"
   exit 1
fi

# 1. Ensure Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}[*] Docker not found. Installing Docker engine...${NC}"
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
    echo -e "${GREEN}[✓] Docker installed successfully.${NC}"
fi

# 2. Setup install directory
INSTALL_DIR="/opt/polyswitch-cloud"
mkdir -p "${INSTALL_DIR}"
cd "${INSTALL_DIR}"

# 3. Clone or update repository
if [[ -d "${INSTALL_DIR}/.git" ]]; then
    echo -e "${YELLOW}[*] Updating existing Polyswitch Cloud installation...${NC}"
    git pull --quiet
else
    echo -e "${YELLOW}[*] Cloning Polyswitch Cloud repository...${NC}"
    git clone --depth 1 https://github.com/tejasundeep/polyswitch-cloud.git "${INSTALL_DIR}"
fi

# 4. Build and start container
echo -e "${YELLOW}[*] Building & starting Polyswitch Cloud container on port 3000...${NC}"
docker compose -f "${INSTALL_DIR}/docker-compose.yml" up -d --build

# 5. Retrieve Public IP
PUBLIC_IP=$(curl -s -4 https://api.ipify.org 2>/dev/null || curl -s -4 https://ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ Polyswitch Cloud is Live!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}Access your Dashboard at:${NC} http://${PUBLIC_IP}:3000"
echo ""
echo -e "  ${YELLOW}Connect to your local or cloud Polyswitch runner in the UI via 'Runner Config'.${NC}"
echo ""
