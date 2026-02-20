[BITS 16]
[ORG 0x7C00]

start:
    ; 1. Setup Segmen (Wajib agar tidak error memori)
    cli                 ; Matikan interupsi sebentar
    xor ax, ax
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0x7C00
    sti                 ; Nyalakan lagi

    mov [boot_drive], dl ; Simpan ID Drive dari BIOS

    ; 2. Tampilan Awal (Compact)
    mov si, msg_start
    call print_string

    ; 3. Reset Disk Controller
    mov ah, 0
    mov dl, [boot_drive]
    int 0x13
    jc disk_error

    mov si, msg_disk
    call print_string

    ; 4. LOAD KERNEL (Satu Kali Tembak - Efisien!)
    ; Kita baca 18 Sektor sekaligus (Cukup untuk 9KB Kernel)
    ; Kernel Anda cuma 7.2KB, jadi ini AMAN.
    
    mov ax, 0x1000      ; Target RAM: 0x1000
    mov es, ax
    xor bx, bx          ; Offset: 0

    mov ah, 0x02        ; BIOS Read
    mov al, 30          ; BACA 17 SEKTOR (8.5 KB)
    mov ch, 0           ; Cylinder 0
    mov cl, 2           ; Mulai dari Sektor 2 (Sektor 1 itu bootloader)
    mov dh, 0           ; Head 0
    mov dl, [boot_drive]
    int 0x13
    jc disk_error

    mov si, msg_done
    call print_string

    ; 5. Loncat ke Kernel
    jmp 0x1000:0000

; --- ERROR HANDLING ---
disk_error:
    mov si, msg_err
    call print_string
    jmp $

; --- FUNGSI CETAK (Sangat Pendek) ---
print_string:
    mov ah, 0x0E
.loop:
    lodsb
    cmp al, 0
    je .done
    int 0x10
    jmp .loop
.done:
    ret

; --- DATA (String Pendek & Jelas) ---
boot_drive db 0
msg_start  db 'PaperOS Boot...', 13, 10, 0
msg_disk   db '[OK] Disk Reset', 13, 10, 0
msg_done   db '[OK] Kernel Loaded (9KB). Launching...', 13, 10, 0
msg_err    db '[!!] Disk Error!', 0

; --- PADDING ---
times 510-($-$$) db 0
dw 0xAA55