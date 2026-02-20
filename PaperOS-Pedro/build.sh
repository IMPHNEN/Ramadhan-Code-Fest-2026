#!/bin/bash

# --- 1. MEMBERSIHKAN PROSES LAMA ---
echo "Membersihkan instance QEMU lama..."
pkill -9 qemu-system-x86_ 2>/dev/null

# --- 2. KOMPILASI ASM ---
echo "Mengompilasi Bootloader dan Kernel..."
rm -f boot.bin kernel.bin

nasm -f bin boot.asm -o boot.bin
if [ $? -ne 0 ]; then echo "[ERR] Bootloader gagal!"; exit 1; fi

nasm -f bin kernel.asm -o kernel.bin
if [ $? -ne 0 ]; then echo "[ERR] Kernel gagal!"; exit 1; fi

# --- 3. PEMBUATAN IMAGE DISKET ---
echo "Menyusun paperos.img..."

# >>> LETAKKAN DI SINI <<<
# Membuat/Memastikan file tepat 1.44MB dan bersih (berisi nol)
dd if=/dev/zero of=paperos.img bs=512 count=2880 conv=notrunc status=none

# Menulis Bootloader ke Sektor 0
dd if=boot.bin of=paperos.img conv=notrunc status=none

# Menulis Kernel ke Sektor 1 (seek=1)
dd if=kernel.bin of=paperos.img seek=1 conv=notrunc status=none

# --- 4. EKSEKUSI QEMU ---
echo "Menjalankan PaperOS v1.9.6"
qemu-system-x86_64 -drive format=raw,file=paperos.img \
    -audiodev pa,id=snd0 \
    -machine pcspk-audiodev=snd0 \
    -serial tcp:127.0.0.1:4444,server,nowait \
    -netdev user,id=n1 \
    -device ne2k_isa,netdev=n1,irq=5,iobase=0x300 \
    -object filter-dump,id=f1,netdev=n1,file=network_trace.pcap