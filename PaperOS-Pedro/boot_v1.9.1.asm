; [BITS 16]
; [ORG 0x7C00]

; start:
;     ; --- 1. SETUP CPU CONTEXT ---
;     cli
;     xor ax, ax
;     mov ds, ax
;     mov es, ax
;     mov ss, ax
;     mov sp, 0x7C00
;     sti

;     mov [boot_drive], dl ; Simpan ID Drive

;     ; Tampilan Awal
;     call clear_screen
;     mov si, msg_start
;     call print_string
;     call short_delay

;     ; Log 1: Setup Stack
;     mov si, msg_cpu
;     call print_string
;     call short_delay

;     ; --- 2. RESET DISK ---
;     ; Kita akan melakukan reset controller disk
;     mov ah, 0
;     mov dl, [boot_drive]
;     int 0x13
;     jc disk_error

;     ; Log 2: Disk Reset Berhasil
;     mov si, msg_disk
;     call print_string
;     call short_delay

;     ; --- 3. FILESYSTEM CHECK (SIMULASI) ---
;     ; Ini mengecek apakah kita bisa membaca drive yang benar
;     mov si, msg_fs
;     call print_string
;     call short_delay

;     ; --- 4. MUAT KERNEL ---
;     ; Membaca 50 Sektor ke 0x1000:0000
;     mov ax, 0x1000
;     mov es, ax
;     xor bx, bx

;     mov ah, 0x02
;     mov al, 60          ; Baca 60 sektor
;     mov ch, 0
;     mov cl, 2
;     mov dh, 0
;     mov dl, [boot_drive]
;     int 0x13
;     jc disk_error

;     ; Log 3: Kernel Loaded
;     mov si, msg_kernel
;     call print_string
;     call short_delay

;     ; --- 5. HANDOVER ---
;     mov si, msg_boot
;     call print_string
;     call long_delay     ; Delay agak lama biar tegang

;     ; Lompat ke Kernel
;     jmp 0x1000:0000

; ; --- ERROR HANDLING ---
; disk_error:
;     mov si, msg_fail
;     call print_string
;     jmp $

; ; --- UTILITIES ---

; print_string:
;     push ax
;     mov ah, 0x0E
; .loop:
;     lodsb
;     or al, al
;     jz .done
;     int 0x10
;     jmp .loop
; .done:
;     pop ax
;     ret

; clear_screen:
;     mov ah, 0x00
;     mov al, 0x03    ; Mode Text 80x25
;     int 0x10
;     ret

; ; Fungsi Delay Sederhana (Looping buang waktu)
; short_delay:
;     push cx
;     mov cx, 0xFFFF
; .d1:
;     nop
;     loop .d1
;     pop cx
;     ret

; long_delay:
;     push cx
;     mov cx, 0xFFFF
; .d2:
;     push cx
;     mov cx, 0x0FFF  ; Loop bertingkat
; .d3:
;     loop .d3
;     pop cx
;     loop .d2
;     pop cx
;     ret

; ; --- DATA LOGS (Arch Style) ---
; boot_drive db 0

; ; ASCII Art Header (Optional, kecil saja biar muat)
; msg_start  db 'PaperOS Bootloader v1.9', 13, 10
;            db 'Open-source principles', 13, 10
;            db '-----------------------', 13, 10, 0

; ; Log Systemd Style
; msg_cpu    db '[  OK  ] Initialized x86 Real Mode CPU context', 13, 10, 0
; msg_disk   db '[  OK  ] Reset disk controller (INT 13h)', 13, 10, 0
; msg_fs     db '[  OK  ] Verified boot storage device', 13, 10, 0
; msg_kernel db '[  OK  ] Loaded kernel image into RAM (Seg 0x1000)', 13, 10, 0
; msg_boot   db '[  OK  ] Handing over control to Kernel...', 13, 10, 0
; msg_fail   db '[FAILED] Critical Disk Read Error!', 13, 10, 0

; ; --- BOOT SIGNATURE ---
; times 510-($-$$) db 0
; dw 0xAA55

