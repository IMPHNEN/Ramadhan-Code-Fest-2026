#!/bin/bash
# paperos-build.sh - Build script khusus untuk Fedora

echo "======================================"
echo "PaperOS v1.8 - Build System"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}Step 1: Cleaning old files...${NC}"
rm -f boot.bin kernel.bin paperos.img

echo -e "${YELLOW}Step 2: Assembling bootloader...${NC}"
nasm -f bin boot.asm -o boot.bin
BOOT_SIZE=$(stat -c%s boot.bin)
echo -e "  Bootloader size: ${BLUE}${BOOT_SIZE} bytes${NC}"

if [ ${BOOT_SIZE} -ne 512 ]; then
    echo -e "${RED}Error: Bootloader must be exactly 512 bytes!${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 3: Assembling kernel...${NC}"
nasm -f bin kernel.asm -o kernel.bin
KERNEL_SIZE=$(stat -c%s kernel.bin)
SECTORS_NEEDED=$(( (KERNEL_SIZE + 511) / 512 ))
echo -e "  Kernel size: ${BLUE}${KERNEL_SIZE} bytes${NC}"
echo -e "  Sectors needed: ${BLUE}${SECTORS_NEEDED}${NC}"

echo -e "${YELLOW}Step 4: Creating disk image...${NC}"
# Buat image floppy 1.44MB
dd if=/dev/zero of=paperos.img bs=512 count=2880 status=progress
echo -e "  Created empty image: 1.44 MB (2880 sectors)"

echo -e "${YELLOW}Step 5: Writing bootloader...${NC}"
dd if=boot.bin of=paperos.img conv=notrunc bs=512 count=1 status=none
echo -e "  Bootloader written to sector 0"

echo -e "${YELLOW}Step 6: Writing kernel...${NC}"
dd if=kernel.bin of=paperos.img conv=notrunc bs=512 seek=1 status=none
echo -e "  Kernel written starting from sector 1"

echo -e "${YELLOW}Step 7: Verifying...${NC}"
# Hitung checksum
BOOT_CHECKSUM=$(md5sum boot.bin | cut -d' ' -f1)
KERNEL_CHECKSUM=$(md5sum kernel.bin | cut -d' ' -f1)
echo -e "  Bootloader MD5: ${BLUE}${BOOT_CHECKSUM:0:8}...${NC}"
echo -e "  Kernel MD5: ${BLUE}${KERNEL_CHECKSUM:0:8}...${NC}"

echo -e "${GREEN}✓ Build successful!${NC}"
echo "Files created:"
echo "  boot.bin    - Bootloader (512 bytes)"
echo "  kernel.bin  - Kernel ($KERNEL_SIZE bytes)"
echo "  paperos.img - Disk image (1.44 MB)"	
