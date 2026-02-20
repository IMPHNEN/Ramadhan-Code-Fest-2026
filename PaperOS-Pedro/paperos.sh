#!/bin/bash
# paperos.sh - Build dan run PaperOS di Fedora

set -e  # Exit on error

echo "======================================"
echo "PaperOS v1.8 Builder for Fedora"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"
command -v nasm >/dev/null 2>&1 || { echo -e "${RED}Error: nasm not found${NC}"; sudo dnf install nasm; }
command -v qemu-system-x86_64 >/dev/null 2>&1 || { echo -e "${RED}Error: qemu not found${NC}"; sudo dnf install qemu-system-x86; }

# Build
echo -e "${YELLOW}Building PaperOS...${NC}"
nasm -f bin boot.asm -o boot.bin
nasm -f bin kernel.asm -o kernel.bin

# Create image
echo -e "${YELLOW}Creating disk image...${NC}"
dd if=/dev/zero of=paperos.img bs=512 count=2880 status=none
dd if=boot.bin of=paperos.img conv=notrunc status=none
dd if=kernel.bin of=paperos.img seek=1 conv=notrunc status=none

echo -e "${GREEN}Build successful!${NC}"
echo "File sizes:"
echo "  boot.bin:   $(stat -c%s boot.bin) bytes"
echo "  kernel.bin: $(stat -c%s kernel.bin) bytes"
echo "  paperos.img: $(stat -c%s paperos.img) bytes"

# Run options
echo ""
echo -e "${YELLOW}Select run option:${NC}"
echo "1) Run without audio (stable)"
echo "2) Run with SB16 audio"
echo "3) Run with AC97 audio"
echo "4) Run with PC Speaker (experimental)"
echo "5) Exit"

read -p "Choice (1-5): " choice

case $choice in
    1)
        echo -e "${GREEN}Running without audio...${NC}"
        qemu-system-x86_64 -drive format=raw,file=paperos.img -device usb-mouse -display gtk -m 128M
        ;;
    2)
        echo -e "${GREEN}Running with SB16 audio...${NC}"
        qemu-system-x86_64 -drive format=raw,file=paperos.img -device sb16 -device usb-mouse -display gtk -m 128M
        ;;
    3)
        echo -e "${GREEN}Running with AC97 audio...${NC}"
        qemu-system-x86_64 -drive format=raw,file=paperos.img -device ac97 -device usb-mouse -display gtk -m 128M
        ;;
    4)
        echo -e "${GREEN}Running with PC Speaker...${NC}"
        qemu-system-x86_64 -drive format=raw,file=paperos.img -soundhw pcspk -device usb-mouse -display gtk -m 128M
        ;;
    5)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
