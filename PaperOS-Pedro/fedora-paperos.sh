#!/bin/bash
# fedora-paperos.sh - Build and run PaperOS on Fedora

set -e

echo "========================================"
echo "PaperOS v1.8 - Fedora Edition"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Build kernel
echo -e "${YELLOW}[1/4] Building kernel...${NC}"
nasm -f bin boot.asm -o boot.bin
nasm -f bin kernel.asm -o kernel.bin

# Create disk image
echo -e "${YELLOW}[2/4] Creating disk image...${NC}"
dd if=/dev/zero of=paperos.img bs=512 count=2880 status=progress 2>/dev/null
dd if=boot.bin of=paperos.img conv=notrunc status=none
dd if=kernel.bin of=paperos.img seek=1 conv=notrunc status=none

echo -e "${GREEN}✓ Build complete!${NC}"
echo -e "  Bootloader: ${BLUE}512 bytes${NC}"
echo -e "  Kernel:     ${BLUE}$(stat -c%s kernel.bin) bytes${NC}"
echo -e "  Disk image: ${BLUE}1.44 MB${NC}"

# Run QEMU
echo -e "${YELLOW}[3/4] Starting QEMU...${NC}"
echo -e "${BLUE}Press Ctrl+Alt+G to release mouse${NC}"
echo -e "${BLUE}Press Ctrl+Alt to capture mouse${NC}"

# Try different QEMU configurations
CONFIGS=(
    "Default"        "qemu-system-x86_64 -drive format=raw,file=paperos.img -machine q35 -usb -device usb-tablet -m 128M"
    "Legacy"         "qemu-system-x86_64 -drive format=raw,file=paperos.img -machine pc -usb -device usb-tablet -m 128M"
    "No Audio"       "qemu-system-x86_64 -drive format=raw,file=paperos.img -machine q35 -device usb-tablet -m 128M"
    "PS/2 Mouse"     "qemu-system-x86_64 -drive format=raw,file=paperos.img -machine pc -device ps2-mouse -m 128M"
)

# Auto-select best config
SELECTED=0  # Default config

# Check QEMU capabilities
if ! qemu-system-x86_64 -device help 2>&1 | grep -q "usb-tablet"; then
    SELECTED=3  # PS/2 Mouse if USB tablet not available
fi

echo -e "${YELLOW}[4/4] Running with: ${CONFIGS[$((SELECTED*2))]}${NC}"
eval "${CONFIGS[$((SELECTED*2+1))]}"
