#!/bin/bash
# paperos-run.sh - Run PaperOS di QEMU

echo "======================================"
echo "PaperOS v1.8 - QEMU Launcher"
echo "======================================"

# Cek file ada
if [ ! -f "paperos.img" ]; then
    echo "Error: paperos.img not found!"
    echo "Run ./paperos-build.sh first."
    exit 1
fi

# Deteksi QEMU version
QEMU_VER=$(qemu-system-x86_64 --version 2>/dev/null | head -1)
if [ -z "$QEMU_VER" ]; then
    echo "Error: QEMU not found!"
    echo "Install with: sudo dnf install qemu-system-x86"
    exit 1
fi

echo "QEMU: $QEMU_VER"
echo ""

# Tampilkan menu
echo "Select QEMU configuration:"
echo "1) Standard (USB tablet, no audio)"
echo "2) With PS/2 mouse"
echo "3) With audio (SB16)"
echo "4) Debug mode (serial console)"
echo "5) Custom command"
echo ""

read -p "Choice [1]: " choice
choice=${choice:-1}

case $choice in
    1)
        CMD="qemu-system-x86_64 \
            -drive format=raw,file=paperos.img \
            -machine pc \
            -usb \
            -device usb-tablet \
            -m 128M \
            -display gtk"
        ;;
    2)
        CMD="qemu-system-x86_64 \
            -drive format=raw,file=paperos.img \
            -machine pc \
            -device ps2-mouse \
            -m 128M \
            -display gtk"
        ;;
    3)
        CMD="qemu-system-x86_64 \
            -drive format=raw,file=paperos.img \
            -machine pc \
            -device sb16 \
            -device usb-tablet \
            -m 128M \
            -display gtk"
        ;;
    4)
        CMD="qemu-system-x86_64 \
            -drive format=raw,file=paperos.img \
            -machine pc \
            -m 128M \
            -display none \
            -serial stdio"
        ;;
    5)
        echo "Enter custom QEMU command:"
        echo "Example: qemu-system-x86_64 -drive format=raw,file=paperos.img -m 128M"
        read -p "> " CMD
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "Running: $CMD"
echo ""
echo "Tips:"
echo "  - Press Ctrl+Alt+G to release mouse"
echo "  - Press Ctrl+Alt to capture mouse"
echo "  - Press Ctrl+Alt+2 for QEMU monitor"
echo "  - Type 'quit' in QEMU monitor to exit"
echo ""

eval $CMD
