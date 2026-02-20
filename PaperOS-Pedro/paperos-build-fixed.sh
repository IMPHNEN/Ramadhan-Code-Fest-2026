#!/bin/bash
# paperos-build-fixed.sh

echo "======================================"
echo "PaperOS v1.8 - Fixed Build Script"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Clean up
rm -f boot.bin kernel.bin paperos.img 2>/dev/null

# Build bootloader
echo -e "${YELLOW}[1/3] Building bootloader...${NC}"
nasm -f bin boot.asm -o boot.bin
if [ $? -ne 0 ]; then
    echo -e "${RED}Error assembling bootloader!${NC}"
    exit 1
fi

# Verify bootloader size (must be 512 bytes)
BOOT_SIZE=$(stat -c%s boot.bin 2>/dev/null || stat -f%z boot.bin)
if [ "$BOOT_SIZE" != "512" ]; then
    echo -e "${RED}Bootloader must be exactly 512 bytes, got $BOOT_SIZE${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Bootloader: 512 bytes${NC}"

# Build kernel
echo -e "${YELLOW}[2/3] Building kernel...${NC}"
nasm -f bin kernel.asm -o kernel.bin
if [ $? -ne 0 ]; then
    echo -e "${RED}Error assembling kernel!${NC}"
    exit 1
fi

KERNEL_SIZE=$(stat -c%s kernel.bin 2>/dev/null || stat -f%z kernel.bin)
echo -e "${GREEN}✓ Kernel: $KERNEL_SIZE bytes${NC}"

# Create disk image
echo -e "${YELLOW}[3/3] Creating disk image...${NC}"
# Create 1.44MB floppy image
dd if=/dev/zero of=paperos.img bs=512 count=2880 2>/dev/null

# Write bootloader (sector 0)
dd if=boot.bin of=paperos.img conv=notrunc bs=512 count=1 2>/dev/null

# Write kernel (starting at sector 1)
dd if=kernel.bin of=paperos.img conv=notrunc bs=512 seek=1 2>/dev/null

# Verify
echo -e "${YELLOW}Verifying disk image...${NC}"
IMG_SIZE=$(stat -c%s paperos.img 2>/dev/null || stat -f%z paperos.img)
echo -e "Disk image size: $IMG_SIZE bytes"

# Check boot signature
hexdump -C paperos.img | tail -3

echo -e "${GREEN}✓ Build complete!${NC}"
