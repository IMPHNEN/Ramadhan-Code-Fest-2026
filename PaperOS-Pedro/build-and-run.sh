#!/bin/bash
# build-and-run.sh

echo "Compiling..."
nasm -f bin boot.asm -o boot.bin
nasm -f bin kernel.asm -o kernel.bin

echo "Creating image..."
dd if=/dev/zero of=paperos.img bs=512 count=2880
dd if=boot.bin of=paperos.img conv=notrunc
dd if=kernel.bin of=paperos.img seek=1 conv=notrunc

echo "Running..."
# Pilih salah satu:
# qemu-system-x86_64 -drive format=raw,file=paperos.img -device ps2-mouse -m 128M
# qemu-system-x86_64 -drive format=raw,file=paperos.img -usb -device usb-tablet -m 128M
qemu-system-x86_64 -drive format=raw,file=paperos.img -machine q35 -usb -device usb-tablet -m 128M
