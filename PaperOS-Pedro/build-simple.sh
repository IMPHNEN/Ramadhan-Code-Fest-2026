#!/bin/bash
# build-simple.sh

echo "Building PaperOS..."

# Build bootloader and kernel
nasm -f bin boot.asm -o boot.bin
nasm -f bin kernel.asm -o kernel.bin

echo "Bootloader: $(wc -c < boot.bin) bytes"
echo "Kernel: $(wc -c < kernel.bin) bytes"

# Create disk image
dd if=/dev/zero of=paperos.img bs=512 count=2880 2>/dev/null

# Write bootloader
dd if=boot.bin of=paperos.img conv=notrunc bs=512 count=1 2>/dev/null

# Write kernel
dd if=kernel.bin of=paperos.img conv=notrunc bs=512 seek=1 2>/dev/null

echo "Verifying..."
# Check boot signature
if hexdump -C paperos.img | tail -2 | grep -q "55 aa"; then
    echo "✓ Boot signature OK"
else
    echo "✗ Boot signature missing!"
fi

# Check kernel is written
KERNEL_START=$(hexdump -C -s 512 -n 32 paperos.img | head -2)
if echo "$KERNEL_START" | grep -q "0000 0000 0000 0000"; then
    echo "✗ Kernel not written!"
else
    echo "✓ Kernel written to sector 1"
fi

echo ""
echo "Build complete! Run with:"
echo "qemu-system-x86_64 -drive format=raw,file=paperos.img -m 128M"
