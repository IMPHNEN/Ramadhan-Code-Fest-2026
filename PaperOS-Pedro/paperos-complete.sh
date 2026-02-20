#!/bin/bash
# paperos-complete.sh

set -e

echo "██████╗  █████╗ ██████╗ ███████╗██████╗  ██████╗ ███████╗"
echo "██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔═══██╗██╔════╝"
echo "██████╔╝███████║██████╔╝█████╗  ██████╔╝██║   ██║███████╗"
echo "██╔═══╝ ██╔══██║██╔═══╝ ██╔══╝  ██╔══██╗██║   ██║╚════██║"
echo "██║     ██║  ██║██║     ███████╗██║  ██║╚██████╔╝███████║"
echo "╚═╝     ╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝"
echo "v1.8 - Build System"
echo ""

# Create build directory
mkdir -p build
cd build

# Build bootloader
echo "▶ Building bootloader..."
nasm -f bin ../boot.asm -o boot.bin

# Verify bootloader
if [ $(stat -c%s boot.bin) -ne 512 ]; then
    echo "❌ Bootloader must be exactly 512 bytes!"
    exit 1
fi

# Build kernel
echo "▶ Building kernel..."
nasm -f bin ../kernel.asm -o kernel.bin

KERNEL_SECTORS=$(( ($(stat -c%s kernel.bin) + 511) / 512 ))
echo "✓ Kernel size: $(stat -c%s kernel.bin) bytes ($KERNEL_SECTORS sectors)"

# Create disk image
echo "▶ Creating disk image..."
dd if=/dev/zero of=paperos.img bs=512 count=2880 2>/dev/null

# Write bootloader
dd if=boot.bin of=paperos.img conv=notrunc bs=512 count=1 2>/dev/null

# Write kernel
dd if=kernel.bin of=paperos.img conv=notrunc bs=512 seek=1 2>/dev/null

# Verify
echo "▶ Verifying..."
BOOT_SIG=$(hexdump -C paperos.img | grep -A1 "000001f0" | tail -1)
if [[ $BOOT_SIG == *"55 aa"* ]]; then
    echo "✓ Boot signature: OK"
else
    echo "❌ Boot signature missing!"
    exit 1
fi

# Check kernel is written
FIRST_KERNEL_SECTOR=$(hexdump -C -s 512 -n 16 paperos.img)
if [[ $FIRST_KERNEL_SECTOR == *"0000 0000 0000 0000"* ]]; then
    echo "❌ Kernel not written to sector 1!"
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo "📁 Files in build/:"
echo "   boot.bin    - Bootloader"
echo "   kernel.bin  - Kernel"
echo "   paperos.img - Disk image"
echo ""

# Run QEMU
echo "🚀 Starting QEMU..."
echo "💡 Press Ctrl+Alt+G to release mouse"
echo ""

cd ..
qemu-system-x86_64 \
    -drive format=raw,file=build/paperos.img \
    -machine pc \
    -m 128M \
    -display gtk \
    -device usb-tablet
