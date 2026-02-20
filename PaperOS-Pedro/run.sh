# Script run yang sudah diperbaiki (run.sh)
#!/bin/bash

# Check QEMU version
QEMU_VERSION=$(qemu-system-x86_64 --version | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
echo "QEMU Version: $QEMU_VERSION"

# Deteksi audio driver yang tersedia
if qemu-system-x86_64 -audio-help 2>&1 | grep -q "sdl"; then
    AUDIO_OPTIONS="-audio driver=sdl"
elif qemu-system-x86_64 -audio-help 2>&1 | grep -q "pa"; then
    AUDIO_OPTIONS="-audio driver=pa"
else
    AUDIO_OPTIONS="-soundhw sb16"
fi

echo "Using audio options: $AUDIO_OPTIONS"

# Run dengan opsi yang tepat
qemu-system-x86_64 \
    -drive format=raw,file=paperos.img \
    $AUDIO_OPTIONS \
    -machine q35 \
    -usb \
    -device usb-tablet \
    -device usb-mouse,bus=usb-bus.0 \
    -m 128M \
    -display gtk \
    -name "PaperOS v1.8"
