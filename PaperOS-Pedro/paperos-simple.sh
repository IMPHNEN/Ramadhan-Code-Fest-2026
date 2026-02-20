#!/bin/bash
# paperos-simple.sh - Build dan run PaperOS dengan satu script

set -e

echo "===================================="
echo "PaperOS v1.8 - Simple Builder"
echo "===================================="

# Hapus file lama
rm -f boot.bin kernel.bin paperos.img 2>/dev/null || true

# 1. Build bootloader
echo "1. Building bootloader..."
cat > boot.asm << 'EOF'
[BITS 16]
[ORG 0x7C00]
start:
    cli
    xor ax, ax
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7C00
    sti
    
    ; Tampilkan pesan
    mov si, msg
    call print
    call print_nl
    
    ; Reset disk
    xor ax, ax
    int 0x13
    jc error
    
    ; Load kernel (8 sektor = 4KB)
    mov ax, 0x7E0
    mov es, ax
    xor bx, bx
    mov ah, 0x02
    mov al, 8
    mov ch, 0
    mov cl, 2
    mov dh, 0
    mov dl, 0
    int 0x13
    jc error
    
    ; Jump ke kernel
    jmp 0x7E0:0x0000
    
error:
    mov si, err_msg
    call print
    hlt
    
print:
    lodsb
    test al, al
    jz .done
    mov ah, 0x0E
    int 0x10
    jmp print
.done:
    ret
    
print_nl:
    mov ah, 0x0E
    mov al, 13
    int 0x10
    mov al, 10
    int 0x10
    ret
    
msg: db "Loading PaperOS...", 0
err_msg: db "Disk Error!", 0

times 510-($-$$) db 0
dw 0xAA55
EOF

nasm -f bin boot.asm -o boot.bin

# 2. Build kernel yang sudah diperbaiki
echo "2. Building kernel..."
cat > kernel.asm << 'EOF'
[BITS 16]
[ORG 0x0000]

_start:
    mov ax, cs
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0xFFFF
    
    ; Clear screen
    mov ax, 0x0003
    int 0x10
    
    ; Tampilkan pesan welcome
    mov si, msg_welcome
    call kprint
    
    ; Cek mouse
    call check_mouse
    
    ; Shell loop
shell:
    mov si, prompt
    call kprint
    
    ; Input buffer
    mov di, buffer
    call kinput
    
    ; Cek command
    mov si, buffer
    cmp byte [si], 0
    je shell
    
    ; Command: help
    mov di, cmd_help
    call strcmp
    jc _help
    
    ; Command: hwinfo
    mov di, cmd_hwinfo
    call strcmp
    jc _hwinfo
    
    ; Command: reboot
    mov di, cmd_reboot
    call strcmp
    jc _reboot
    
    ; Command: clear
    mov di, cmd_clear
    call strcmp
    jc _clear
    
    ; Command: mouse
    mov di, cmd_mouse
    call strcmp
    jc _mouse
    
    ; Command: whoami
    mov di, cmd_whoami
    call strcmp
    jc _whoami
    
    ; Command tidak dikenal
    mov si, msg_unknown
    call kprint
    jmp shell

; ================= COMMAND HANDLERS =================
_help:
    mov si, msg_help
    call kprint
    jmp shell

_hwinfo:
    mov si, msg_hwinfo
    call kprint
    
    ; Cek memory
    int 0x12
    call print_dec
    mov si, txt_kb
    call kprint
    
    ; Cek mouse lagi
    call check_mouse
    
    jmp shell

_reboot:
    mov si, msg_rebooting
    call kprint
    jmp 0xFFFF:0x0000

_clear:
    mov ax, 0x0003
    int 0x10
    jmp shell

_mouse:
    call check_mouse
    jmp shell

_whoami:
    mov si, msg_whoami
    call kprint
    jmp shell

; ================= UTILITIES =================
check_mouse:
    mov si, msg_check_mouse
    call kprint
    
    ; Coba INT 33h
    mov ax, 0x0000
    int 0x33
    cmp ax, 0xFFFF
    je .found
    
    ; Tidak ditemukan
    mov si, txt_no
    call kprint
    mov si, newline
    call kprint
    ret
    
.found:
    mov si, txt_yes
    call kprint
    mov si, newline
    call kprint
    ret

kprint:
    lodsb
    or al, al
    jz .done
    mov ah, 0x0E
    int 0x10
    jmp kprint
.done:
    ret

kinput:
    xor cl, cl
.loop:
    mov ah, 0
    int 0x16
    
    cmp al, 13     ; Enter
    je .enter
    cmp al, 8      ; Backspace
    je .backspace
    
    ; Simpan karakter
    mov [di], al
    inc di
    inc cl
    
    ; Tampilkan karakter
    mov ah, 0x0E
    int 0x10
    jmp .loop

.backspace:
    cmp cl, 0
    je .loop
    dec di
    dec cl
    mov ah, 0x0E
    mov al, 8
    int 0x10
    mov al, ' '
    int 0x10
    mov al, 8
    int 0x10
    jmp .loop

.enter:
    mov byte [di], 0
    mov si, newline
    call kprint
    ret

strcmp:
.loop:
    mov al, [si]
    mov bl, [di]
    cmp al, bl
    jne .no
    cmp al, 0
    je .yes
    inc si
    inc di
    jmp .loop
.yes:
    stc
    ret
.no:
    clc
    ret

print_dec:
    push ax
    push bx
    push cx
    push dx
    
    mov bx, 10
    xor cx, cx
    
.div_loop:
    xor dx, dx
    div bx
    push dx
    inc cx
    test ax, ax
    jnz .div_loop
    
.print_loop:
    pop ax
    add al, '0'
    mov ah, 0x0E
    int 0x10
    loop .print_loop
    
    pop dx
    pop cx
    pop bx
    pop ax
    ret

; ================= DATA SECTION =================
msg_welcome:    db 'PaperOS v1.8', 13, 10, 'Type "help" for commands', 13, 10, 0
prompt:         db '> ', 0
newline:        db 13, 10, 0
msg_unknown:    db 'Unknown command. Type "help"', 13, 10, 0

; Commands
cmd_help:       db 'help', 0
cmd_hwinfo:     db 'hwinfo', 0
cmd_reboot:     db 'reboot', 0
cmd_clear:      db 'clear', 0
cmd_mouse:      db 'mouse', 0
cmd_whoami:     db 'whoami', 0

; Messages
msg_help:       db 'Commands: help, hwinfo, reboot, clear, mouse, whoami', 13, 10, 0
msg_hwinfo:     db 'Memory: ', 0
msg_rebooting:  db 'Rebooting...', 13, 10, 0
msg_check_mouse: db 'Mouse: ', 0
msg_whoami:     db 'root', 13, 10, 0

txt_yes:        db 'Yes', 0
txt_no:         db 'No', 0
txt_kb:         db ' KB', 13, 10, 0

buffer: times 64 db 0

; Padding agar kernel cukup besar
times 4096-($-$$) db 0
EOF

nasm -f bin kernel.asm -o kernel.bin

# 3. Buat disk image
echo "3. Creating disk image..."
dd if=/dev/zero of=paperos.img bs=512 count=2880 2>/dev/null
dd if=boot.bin of=paperos.img conv=notrunc 2>/dev/null
dd if=kernel.bin of=paperos.img conv=notrunc bs=512 seek=1 2>/dev/null

# 4. Verifikasi
echo "4. Verifying..."
BOOT_SIZE=$(stat -c%s boot.bin 2>/dev/null || stat -f%z boot.bin)
KERNEL_SIZE=$(stat -c%s kernel.bin 2>/dev/null || stat -f%z kernel.bin)

echo "Bootloader: $BOOT_SIZE bytes"
echo "Kernel: $KERNEL_SIZE bytes"

if [ "$BOOT_SIZE" -eq 512 ]; then
    echo "✓ Bootloader OK"
else
    echo "✗ Bootloader must be 512 bytes!"
    exit 1
fi

# 5. Run QEMU
echo "===================================="
echo "5. Starting QEMU..."
echo "Press Ctrl+Alt+G to release mouse"
echo "===================================="

qemu-system-x86_64 \
    -drive format=raw,file=paperos.img \
    -machine pc \
    -m 128M \
    -display gtk \
    -device usb-tablet
