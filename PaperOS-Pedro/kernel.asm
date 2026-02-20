[BITS 16]
[ORG 0x0000]

_start:
    mov ax, cs
    mov ds, ax
    mov es, ax
    mov ss, ax
    mov sp, 0xFFFF
    
    mov [boot_drive], dl    ; Simpan nomor drive dari BIOS ke variabel

    ; 1. Bersihkan Layar & Init Serial
    call driver_vga_clear
    call serial_init

    ; 2. Sound Effect (Login Sound)
    mov bx, 2000    ; Nada tinggi
    mov cx, 3
    call driver_sound_play
    mov bx, 1500    ; Nada rendah
    mov cx, 3
    call driver_sound_play

    ; 3. TAMPILKAN HEADER & WELCOME
    mov si, msg_welcome
    call kprint
    mov si, msg_info
    call kprint

    ; 4. TAMPILKAN PENJELASAN RINCI (MOTD)
    ; Ini adalah bagian baru yang Anda minta
    mov si, msg_motd_line
    call kprint
    mov si, msg_motd_desc
    call kprint
    mov si, msg_motd_feat
    call kprint
    mov si, msg_motd_guide
    call kprint
    mov si, msg_motd_line
    call kprint
    
    ; Tambahan baris kosong biar rapi
    mov si, newline
    call kprint

    call do_system_login

    mov si, msg_access_granted
    call kprint

    ; Sound Success (Opsional)
    mov bx, 3000
    mov cx, 5
    call driver_sound_play

    


    call flush_keyboard_buffer

; =================================================================
; [SHELL / COMMAND INTERPRETER] (FIXED)
; =================================================================
shell_loop:
    mov byte [color_attr], 0x07
    mov si, prompt
    call kprint

    ; Bersihkan buffer input
    mov di, buffer
    mov cx, 64
    mov al, 0
    rep stosb

    mov di, buffer
    call kinput

    mov si, buffer
    cmp byte [si], 0
    je shell_loop

    ; --- Command List ---
    
    ; 1. Utilities
    mov di, cmd_beep
    call strcmp
    jc _cmd_beep

    mov si, buffer
    mov di, _cmd_calc
    call strcmp
    jc _cmd_calc

    mov si, buffer
    mov di, cmd_clear
    call strcmp
    jc _cmd_clear

    mov si, buffer
    mov di, cmd_color
    call strcmp
    jc _cmd_color

    ; 2. System Info
    mov si, buffer
    mov di, cmd_fastfetch
    call strcmp
    jc _cmd_fastfetch

    mov si, buffer
    mov di, cmd_hwinfo
    call strcmp
    jc _cmd_hwinfo

    mov si, buffer
    mov di, cmd_info
    call strcmp
    jc _cmd_info         

    mov si, buffer
    mov di, cmd_whoami
    call strcmp
    jc _cmd_whoami

    mov si, buffer
    mov di, cmd_jam
    call strcmp
    jc _cmd_clock

    ; 3. Filesystem & Tools
    mov si, buffer
    mov di, cmd_ls
    call strcmp
    jc _cmd_ls

    mov si, buffer
    mov di, cmd_mouse
    call strcmp
    jc _cmd_mouse

; =============
; Old Commands write and read
; =============

    mov si, buffer
    mov di, cmd_write_old
    call strcmp
    jc _cmd_write_old

    mov si, buffer
    mov di, cmd_read_old
    call strcmp
    jc _cmd_read_old

; ====================

    mov si, buffer
    mov di, cmd_notes
    call strcmp
    jc _cmd_notes

    ; 4. Power & Special
    mov si, buffer
    mov di, cmd_reboot
    call strcmp
    jc _cmd_reboot

    mov si, buffer
    mov di, cmd_resetcolor
    call strcmp
    jc _cmd_resetcolor

    mov si, buffer
    mov di, cmd_shutdown
    call strcmp
    jc _cmd_poweroff

    ; 5. Easter Eggs & Features
    mov si, buffer
    mov di, cmd_xmas
    call strcmp
    jc _cmd_xmas

    ; [Easter Egg Sejarah Komputer]
    mov si, buffer
    mov di, cmd_daisy
    call strcmp
    jc _cmd_daisy

    ; [Easter Eggs]
    mov si, buffer
    mov di, cmd_xmas
    call strcmp
    jc _cmd_xmas

    mov si, buffer
    mov di, cmd_daisy
    call strcmp
    jc _cmd_daisy

    ; [TAMBAHKAN INI: Perintah Kasih Ibu]
    mov si, buffer
    mov di, cmd_harta
    call strcmp
    jc _cmd_harta

    mov si, buffer
    mov di, cmd_gui     ; <--- Pastikan ini ada
    call strcmp
    jc _cmd_gui

    ; ... (daftar perintah lain seperti cmd_mouse, dll) ... ; data baru

    mov si, buffer
    mov di, cmd_mouse
    call strcmp
    jc _cmd_mouse

    mov si, buffer
    mov di, cmd_info
    call strcmp

    ; [fitur mati] --- FITUR BARU ---
    ; mov si, buffer
    ; mov di, cmd_write   ; Cek perintah "write"
    ; call strcmp
    ; jc _cmd_write

    ; mov si, buffer
    ; mov di, cmd_read    ; Cek perintah "read"
    ; call strcmp
    ; jc _cmd_read

    mov si, buffer
    mov di, cmd_notes
    call strcmp
    jc _cmd_notes
    
    ; ... (lanjut ke cmd_reboot, dll) ...  ;data baru

    mov si, buffer
    mov di, cmd_notes
    call strcmp
    jc _cmd_notes

    mov si, buffer
    mov di, cmd_reboot
    call strcmp
    jc _cmd_reboot

    mov si, buffer
    mov di, cmd_resetcolor
    call strcmp
    jc _cmd_resetcolor

    mov si, buffer
    mov di, cmd_whoami
    call strcmp
    jc _cmd_whoami

    mov si, buffer
    mov di, cmd_jam
    call strcmp
    jc _cmd_clock

    mov si, buffer
    mov di, cmd_shutdown
    call strcmp
    jc _cmd_poweroff


; [Christmas Command]
    mov si, buffer
    mov di, cmd_xmas
    call strcmp
    jc _cmd_xmas;

; [VGA UPDATE]
    mov si, buffer
    mov di, cmd_gui
    call strcmp
    jc _cmd_gui;

; --- Di dalam shell_loop ---
    
    ; Slot 1
    mov si, buffer
    mov di, cmd_read1
    call strcmp
    jc _cmd_read1

    mov si, buffer
    mov di, cmd_write1
    call strcmp
    jc _cmd_write1

    ; Slot 2
    mov si, buffer
    mov di, cmd_read2
    call strcmp
    jc _cmd_read2

    mov si, buffer
    mov di, cmd_write2
    call strcmp
    jc _cmd_write2

    ; Slot 3
    mov si, buffer
    mov di, cmd_read3
    call strcmp
    jc _cmd_read3

    mov si, buffer
    mov di, cmd_write3
    call strcmp
    jc _cmd_write3

    ; Kalkulator Baru
    mov si, buffer
    mov di, cmd_calc
    call strcmp
    jc _cmd_calc  


; Tambahkan di bagian shell_loop:
    mov si, buffer
    mov di, cmd_count_old
    call strcmp
    jc _cmd_count_old


    ; --- Multi-Slot Count ---
    mov si, buffer
    mov di, cmd_count1
    call strcmp
    jc _cmd_count1

    mov si, buffer
    mov di, cmd_count2
    call strcmp
    jc _cmd_count2

    mov si, buffer
    mov di, cmd_count3
    call strcmp
    jc _cmd_count3

    ; --- Multi-Slot Find ---
    mov si, buffer
    mov di, cmd_find_old
    call strcmp
    jc _cmd_find_old

    mov si, buffer
    mov di, cmd_find1
    call strcmp
    jc _cmd_find1

    mov si, buffer
    mov di, cmd_find2
    call strcmp
    jc _cmd_find2

    mov si, buffer
    mov di, cmd_find3
    call strcmp
    jc _cmd_find3

    mov si, buffer
    mov di, cmd_lock1
    call strcmp
    jc _cmd_lock1

    mov si, buffer
    mov di, cmd_lock2
    call strcmp
    jc _cmd_lock2

    mov si, buffer
    mov di, cmd_lock3
    call strcmp
    jc _cmd_lock3

    mov si, buffer
    mov di, cmd_lock_old
    call strcmp
    jc _cmd_lock_old

    ; --- Multi-Slot Unlock ---
    mov si, buffer
    mov di, cmd_unlock1
    call strcmp
    jc _cmd_unlock1

    mov si, buffer
    mov di, cmd_unlock2
    call strcmp
    jc _cmd_unlock2

    mov si, buffer
    mov di, cmd_unlock3
    call strcmp
    jc _cmd_unlock3

    mov si, buffer
    mov di, cmd_unlock_old
    call strcmp
    jc _cmd_unlock_old

    mov si, buffer
    mov di, cmd_netinfo
    call strcmp
    jc _cmd_netinfo

    mov si, buffer
    mov di, cmd_arp_test
    call strcmp
    jc _cmd_arp_test

    ; --- Multi-Slot Editor ---
    mov si, buffer
    mov di, cmd_edit1
    call strcmp
    jc _cmd_edit1

    mov si, buffer
    mov di, cmd_edit2
    call strcmp
    jc _cmd_edit2

    mov si, buffer
    mov di, cmd_edit3
    call strcmp
    jc _cmd_edit3

    mov si, buffer
    mov di, cmd_rename
    call strcmp
    jc _cmd_rename

    mov si, buffer
    mov di, cmd_help
    call strcmp
    jc _cmd_help

    mov si, buffer
    mov di, cmd_desktop_str
    call strcmp
    jc _cmd_desktop

    mov si, buffer
    mov di, cmd_sudoku_str
    call strcmp
    jc _cmd_sudoku

;---error handling for unknown command---
    mov si, msg_unknown
    call kprint
    jmp shell_loop



; =================================================================
; [LOGIN SYSTEM HANDLER] - Masukan kode ini
; =================================================================
do_system_login:
    mov si, msg_login_prompt  ; Siapkan teks
    call kprint               ; Cetak ke layar

    ; Reset buffer password
    mov di, pass_buffer
    xor cx, cx          ; Counter karakter (mulai dari 0)

.input_loop:
    mov ah, 0x00
    int 0x16            ; Tunggu input keyboard

    cmp al, 13          ; Cek apakah tombol ENTER ditekan?
    je .check_pass

    cmp al, 8           ; Cek apakah tombol BACKSPACE ditekan?
    je .handle_backspace

    ; Batasi panjang password (max 10 char) agar tidak overflow
    cmp cx, 10
    je .input_loop

    ; Simpan karakter ke memori & Tampilkan Bintang (*)
    mov [di], al
    inc di
    inc cx
    
    mov al, '*'         ; MASKING: Kita print bintang, bukan huruf aslinya
    call kputc
    jmp .input_loop

.handle_backspace:
    cmp cx, 0
    je .input_loop      ; Kalau buffer kosong, abaikan backspace
    dec di
    dec cx
    
    ; Hapus visual bintang di layar (Mundur, Spasi, Mundur)
    mov ah, 0x0E
    mov al, 8
    int 0x10
    mov al, ' '
    int 0x10
    mov al, 8
    int 0x10
    jmp .input_loop

.check_pass:
    mov byte [di], 0    ; Tutup string dengan Null Terminator (0)
    mov si, newline
    call kprint

    ; Bandingkan input dengan password rahasia
    mov si, pass_buffer
    mov di, secret_pass
    call strcmp
    jc .success         ; Jika Carry Flag nyala, berarti password BENAR

    ; Jika Gagal
    mov si, msg_access_denied
    call kprint
    
    ; Bunyi Error (Nada rendah panjang)
    mov bx, 500
    mov cx, 20
    call driver_sound_play
    
    jmp do_system_login ; Ulangi lagi dari awal (Looping)

.success:
    ret                 ; Kembali ke _start

; =================================================================
; [COMMAND HANDLERS]
; =================================================================
_cmd_beep:
    mov si, msg_beeping
    call kprint
    mov bx, 3000
    mov cx, 20
    call driver_sound_play
    jmp shell_loop

; =================================================================
; [CALC v3.0 - MULTI OPERATOR]
; Fitur: (+ - * /) dan Perbaikan Bug Register 3584
; =================================================================
; _cmd_calc:
;     mov si, msg_calc_menu
;     call kprint

;     ; 1. INPUT OPERATOR
;     mov ah, 0x00
;     int 0x16            ; Tunggu input key
;     mov ah, 0x0E
;     int 0x10            ; Tampilkan ke layar (Echo)
    
;     mov [calc_op], al   ; Simpan operator di variabel memori
    
;     mov si, newline
;     call kprint

;     ; 2. INPUT ANGKA PERTAMA (A)
;     mov si, msg_input1
;     call kprint
;     call .get_digit     ; Hasil ada di AL
;     mov [calc_a], al    ; Simpan A

;     ; 3. INPUT ANGKA KEDUA (B)
;     mov si, msg_input2
;     call kprint
;     call .get_digit     ; Hasil ada di AL
;     mov [calc_b], al    ; Simpan B

;     mov si, newline
;     call kprint

;     ; 4. LOGIKA PEMILIHAN (SWITCH CASE)
;     mov al, [calc_op]
    
;     cmp al, '+'
;     je .do_add
    
;     cmp al, '-'
;     je .do_sub
    
;     cmp al, '*'
;     je .do_mul
    
;     cmp al, '/'
;     je .do_div

;     ; Jika operator salah
;     mov si, msg_unknown
;     call kprint
;     jmp shell_loop

; ; --- OPERASI MATEMATIKA ---

; .do_add:
;     mov al, [calc_a]
;     add al, [calc_b]    ; A + B
;     xor ah, ah          ; Bersihkan AH
;     jmp .print_result

; .do_sub:
;     mov al, [calc_a]
;     sub al, [calc_b]    ; A - B
;     xor ah, ah
;     ; Catatan: Jika negatif, akan wrap-around (karena unsigned)
;     jmp .print_result

; .do_mul:
;     mov al, [calc_a]
;     mov bl, [calc_b]
;     mul bl              ; AX = AL * BL
;     jmp .print_result

; .do_div:
;     mov al, [calc_a]
;     mov bl, [calc_b]
    
;     ; Cek pembagian nol
;     cmp bl, '0'         ; Koreksi: Input kita sudah integer di memori
;     cmp bl, 0
;     je .div_zero

;     xor ah, ah          ; Bersihkan AH sebelum bagi
;     div bl              ; AL = Hasil, AH = Sisa
    
;     ; Simpan Sisa (AH) dulu karena print_dec merusak AH
;     mov [calc_rem], ah
;     xor ah, ah          ; Buang sisa dari AX agar print_dec hanya cetak hasil
    
;     ; Cetak Hasil Bagi
;     push ax             ; AMANKAN HASIL
;     mov si, msg_result
;     call kprint
;     pop ax              ; KEMBALIKAN HASIL
;     call print_dec
    
;     ; Cetak Sisa Bagi
;     mov si, msg_rem     ; " sisa "
;     call kprint
;     mov al, [calc_rem]
;     xor ah, ah
;     call print_dec
    
;     mov si, newline
;     call kprint
;     jmp shell_loop

; .div_zero:
;     mov si, msg_err_div
;     call kprint
;     jmp shell_loop

; ; --- PENCETAK HASIL (BUG FIX DISINI) ---
; .print_result:
;     ; PERBAIKAN BUG 3584:
;     ; Kita PUSH (Simpan) nilai AX ke stack sebelum memanggil kprint.
;     ; Karena kprint akan menghancurkan isi register AX.
    
;     push ax             ; <--- 1. Simpan Hasil Hitungan
    
;     mov si, msg_result
;     call kprint         ; <--- 2. Cetak Teks (AX rusak disini)
    
;     pop ax              ; <--- 3. Kembalikan Hasil Hitungan ke AX
    
;     call print_dec      ; <--- 4. Cetak Angka yang benar
;     mov si, newline
;     call kprint
;     jmp shell_loop

; ; --- Helper Input Digit ---
; .get_digit:
;     mov ah, 0x00
;     int 0x16
;     ; Validasi 0-9
;     cmp al, '0'
;     jl .get_digit
;     cmp al, '9'
;     jg .get_digit
    
;     ; Echo
;     mov ah, 0x0E
;     int 0x10
    
;     sub al, '0'         ; Convert ASCII ke Integer
;     xor ah, ah
;     ret

; =================================================================
; [CALC v4.0 - MULTI DIGIT (0 - 65535)]
; =================================================================
_cmd_calc:
    mov si, msg_calc_title
    call kprint

    ; --- 1. INPUT ANGKA PERTAMA ---
    mov si, msg_input1      ; "Input A: "
    call kprint
    
    ; Bersihkan buffer
    mov di, buffer
    mov cx, 64
    mov al, 0
    rep stosb
    
    mov di, buffer
    call kinput             ; User mengetik "120" + Enter
    
    mov si, buffer
    call string_to_int      ; Ubah "120" jadi angka 120 di AX
    mov [calc_a_16], ax     ; Simpan ke variabel 16-bit

    ; --- 2. INPUT OPERATOR ---
    mov si, msg_calc_op     ; "Operator [+ - * /]: "
    call kprint
    
    call kgetc              ; Ambil 1 karakter operator
    mov [calc_op], al
    call kputc              ; Tampilkan operatornya
    
    mov si, newline
    call kprint

    ; --- 3. INPUT ANGKA KEDUA ---
    mov si, msg_input2      ; "Input B: "
    call kprint
    
    ; Bersihkan buffer lagi
    mov di, buffer
    mov cx, 64
    mov al, 0
    rep stosb
    
    mov di, buffer
    call kinput             ; User mengetik "5" + Enter
    
    mov si, buffer
    call string_to_int      ; Ubah "5" jadi angka 5 di AX
    mov [calc_b_16], ax     ; Simpan

    ; --- 4. EKSEKUSI MATEMATIKA ---
    mov ax, [calc_a_16]     ; Load Angka A
    mov bx, [calc_b_16]     ; Load Angka B (Gunakan BX agar aman)
    
    cmp byte [calc_op], '+'
    je .op_add
    cmp byte [calc_op], '-'
    je .op_sub
    cmp byte [calc_op], '*'
    je .op_mul
    cmp byte [calc_op], '/'
    je .op_div
    
    mov si, msg_unknown
    call kprint
    jmp shell_loop

.op_add:
    add ax, bx
    jmp .print_final

.op_sub:
    sub ax, bx
    jmp .print_final

.op_mul:
    xor dx, dx      ; Bersihkan DX untuk hasil perkalian tinggi
    mul bx          ; DX:AX = AX * BX
    ; (Kita asumsikan hasil muat di AX untuk 16-bit sederhana)
    jmp .print_final

.op_div:
    cmp bx, 0
    je .div_zero
    
    xor dx, dx      ; DX harus 0 sebelum pembagian 16-bit!
    div bx          ; AX = Hasil, DX = Sisa
    mov [calc_rem_16], dx ; Simpan sisa bagi
    
    ; Cetak Hasil
    push ax
    mov si, msg_result
    call kprint
    pop ax
    call print_dec
    
    ; Cetak Sisa
    mov si, msg_rem
    call kprint
    mov ax, [calc_rem_16]
    call print_dec
    
    mov si, newline
    call kprint
    jmp shell_loop

.div_zero:
    mov si, msg_err_div
    call kprint
    jmp shell_loop

.print_final:
    push ax
    mov si, msg_result
    call kprint
    pop ax
    
    call print_dec          ; Fungsi ini sudah Anda miliki, bisa cetak angka > 9
    mov si, newline
    call kprint
    jmp shell_loop

_cmd_info:
    mov si, msg_info
    call kprint
    jmp shell_loop

_cmd_color:
    inc byte [color_attr]
    call driver_vga_clear
    mov si, msg_color
    call kprint
    jmp shell_loop

_cmd_fastfetch:
    mov si, newline
    call kprint
    mov si, ff_logo1
    call kprint
    mov si, ff_os
    call kprint
    mov si, ff_logo2
    call kprint
    mov si, ff_kernel
    call kprint
    mov si, ff_logo3
    call kprint
    mov si, ff_access
    call kprint
    mov si, ff_logo4
    call kprint
    mov si, ff_audio
    call kprint
    mov si, ff_logo2
    call kprint
    mov si, ff_cpu
    call kprint
    mov si, ff_logo3
    call kprint
    mov si, ff_mouse
    call kprint
    mov si, ff_logo5
    call kprint
    mov si, newline
    call kprint
    jmp shell_loop

_cmd_hwinfo:
    mov si, msg_hw_title
    call kprint
    int 0x11
    push ax
    mov si, msg_hw_fpu
    call kprint
    pop ax
    push ax
    test ax, 2
    jnz .has_fpu
    mov si, txt_no
    call kprint
    jmp .next_hw
.has_fpu:
    mov si, txt_yes
    call kprint
.next_hw:
    mov si, newline
    call kprint
    mov si, msg_hw_ram
    call kprint
    int 0x12
    call print_dec
    mov si, txt_kb
    call kprint
    mov si, newline
    call kprint
    mov si, msg_hw_mouse
    call kprint

    jnc .no_mouse
    mov si, txt_yes
    call kprint
    jmp .end_hwinfo
.no_mouse:
    mov si, txt_no
    call kprint
.end_hwinfo:
    pop ax
    mov si, newline
    call kprint
    jmp shell_loop

_cmd_help:
    mov si, msg_help_title
    call kprint
    mov si, msg_help_list1
    call kprint
    mov si, msg_help_list2
    call kprint
    mov si, msg_help_list3
    call kprint
    jmp shell_loop

; ==========================================================
; MOUSE LISTENER (SERIAL/BRIDGE VERSION)
; Ganti seluruh blok _cmd_mouse yang lama dengan ini
; ==========================================================
_cmd_mouse:
    mov si, msg_mouse_title
    call kprint
    mov si, msg_mouse_active_serial
    call kprint

.serial_loop:
    ; 1. Cek Data dari Serial Port (COM1)
    call serial_read_char
    jc .process_serial_input ; Jika Carry Flag (CF) nyala, ada data!

    ; 2. Cek Keyboard (Agar bisa keluar dengan Enter)
    mov ah, 0x01
    int 0x16
    jnz .check_key

    jmp .serial_loop

.process_serial_input:
    ; AL sekarang berisi karakter dari program C ('L' atau 'R')
    cmp al, 'L'
    je .left_click
    cmp al, 'R'
    je .right_click
    jmp .serial_loop

.left_click:
    mov si, txt_lclick
    call kprint
    jmp .serial_loop

.right_click:
    mov si, txt_rclick
    call kprint
    jmp .serial_loop

.check_key:
    mov ah, 0x00   ; Ambil tombol keyboard
    int 0x16
    cmp al, 13     ; Enter?
    je .exit_mouse
    jmp .serial_loop

.exit_mouse:
    mov si, newline
    call kprint
    jmp shell_loop

; =================================================================
; [FILE SYSTEM MANAGER - v1.9.7]
; Fitur: Rename Slot & Dynamic LS
; =================================================================

_cmd_rename:
    mov si, msg_rename_ask      ; "Pilih Slot (1-3): "
    call kprint
    call kgetc
    call kputc
    
    ; Validasi Input (1, 2, atau 3)
    cmp al, '1'
    je .ren_slot1
    cmp al, '2'
    je .ren_slot2
    cmp al, '3'
    je .ren_slot3
    jmp shell_loop

.ren_slot1:
    mov cl, 10
    jmp .do_rename
.ren_slot2:
    mov cl, 11
    jmp .do_rename
.ren_slot3:
    mov cl, 12
    jmp .do_rename

.do_rename:
    mov [target_sector], cl
    mov si, newline
    call kprint

    ; 1. BACA DATA LAMA (Penting agar teks tidak hilang!)
    call _internal_disk_read_auto
    
    ; 2. INPUT NAMA BARU
    mov si, msg_rename_input    ; "Masukkan Nama (Max 12 char): "
    call kprint
    
    ; Kita gunakan buffer sementara untuk input nama
    mov di, buffer
    mov cx, 12                  ; Batas 12 karakter
    mov al, 0
    rep stosb                   ; Bersihkan buffer dulu
    
    mov di, buffer
    call kinput                 ; Ambil input user
    
    ; 3. SALIN NAMA KE HEADER SEKTOR (Offset 10)
    mov si, buffer
    mov di, text_buffer + 10    ; <-- Lokasi Metadata Nama
    mov cx, 12
    rep movsb                   ; Copy string
    
    ; 4. SIMPAN KEMBALI KE DISK
    call _internal_disk_update
    
    mov si, msg_rename_done
    call kprint
    jmp shell_loop

; =================================================================
; [DYNAMIC LS - REALTIME METADATA READER]
; Membaca header setiap slot untuk menampilkan nama asli
; =================================================================
_cmd_ls:
    mov si, msg_ls_header_new   ; "SLOT   STATUS    NAME"
    call kprint

    ; --- CEK SLOT 1 ---
    mov si, txt_slot1           ; Cetak "1      "
    call kprint
    mov cl, 10
    call _print_slot_meta       ; Fungsi pembantu (lihat bawah)

    ; --- CEK SLOT 2 ---
    mov si, txt_slot2           ; Cetak "2      "
    call kprint
    mov cl, 11
    call _print_slot_meta

    ; --- CEK SLOT 3 ---
    mov si, txt_slot3           ; Cetak "3      "
    call kprint
    mov cl, 12
    call _print_slot_meta
    
    jmp shell_loop

; Sub-routine pembaca metadata
_print_slot_meta:
    mov [target_sector], cl
    call _internal_disk_read_auto   ; Baca sektor
    
    ; Cek Status Lock (Byte 8)
    cmp byte [text_buffer + 8], 1
    je .show_locked
    
    ; Jika Terbuka
    mov si, txt_open            ; "[OPEN]    "
    call kprint
    jmp .show_name

.show_locked:
    mov si, txt_locked          ; "[LOCKED]  "
    call kprint

.show_name:
    ; Cek apakah ada nama? (Byte 10 tidak nol)
    cmp byte [text_buffer + 10], 0
    je .no_name
    
    ; Cetak Nama (Dari Byte 10 sampai 12 karakter/Null)
    mov si, text_buffer + 10
    call kprint
    jmp .done_meta

.no_name:
    mov si, txt_untitled        ; "Untitled"
    call kprint

.done_meta:
    mov si, newline
    call kprint
    ret


_cmd_whoami:
    mov si, msg_root
    call kprint
    jmp shell_loop
_cmd_reboot:
    mov si, msg_reboot
    call kprint
    jmp 0xFFFF:0x0000
_cmd_resetcolor:
    mov byte [color_attr], 0x07
    call driver_vga_clear
    mov si, msg_resetcolor
    call kprint
    jmp shell_loop
_cmd_clear:
    call driver_vga_clear
    jmp shell_loop
_cmd_clock:
    call app_clock_realtime
    jmp shell_loop
_cmd_notes:
    mov si, msg_notes
    call kprint
    jmp shell_loop
_cmd_poweroff:
    mov si, msg_shutdown
    call kprint
    mov ax, 0x5307
    mov bx, 0x0001
    mov cx, 0x0003
    int 0x15
    hlt

; =================================================================
; [CHRISTMAS EASTER EGG]
; =================================================================
_cmd_xmas:
    mov si, msg_xmas_art
    call kprint

    mov si, music_holy_night  ; Arahkan pointer ke lagu

.play_loop:
    lodsw
    mov bx, ax          ; BX = Frekuensi
    cmp bx, 0           ; Cek apakah habis?
    je .done_music      ; Jika 0, selesai

    lodsw
    mov cx, ax          ; CX = Durasi

    ; PROTEKSI: Jangan panggil sound jika frekuensi < 20Hz (Silence)
    cmp bx, 20
    jl .silent_delay

    call driver_sound_play
    jmp .next_note

.silent_delay:
    ; Jika nada diam/istirahat, gunakan delay manual tanpa menyalakan speaker
    ; (Kita gunakan logika delay yang sama dengan driver sound)
    push cx
    mov ah, 0x86
    mov dx, 0xC350      ; 50ms base
    ; (Looping logic here is complex without function, so we just skip sound)
    ; Untuk simpelnya, kita lewati saja suara, tapi beri jeda
    int 0x15            ; Delay 1x unit
    pop cx

.next_note:
    ; Jeda antar nada
    push cx
    mov cx, 1
    mov ah, 0x86
    mov dx, 0xC350
    int 0x15
    pop cx

    jmp .play_loop

.done_music:
    mov si, newline
    call kprint
    jmp shell_loop

; =================================================================
; [GAME MODE: PAPER-TRON v0.8 - MANUAL DELAY]
; Fix: Menggunakan "Manual CPU Loop" untuk delay (bukan BIOS).
; Fix: Suara dimatikan dulu untuk memastikan grafik jalan.
; =================================================================

_cmd_gui:
    ; 1. Masuk Mode Grafis
    mov ax, 0x0013
    int 0x10
    mov ax, 0xA000
    mov es, ax

    ; 2. Setup Awal
    call .reset_game_silent

.game_loop:
    ; --- A. GAMBAR ULAR ---
    push bx
    push dx
    
    ; Hitung Offset: (Y * 320) + X
    mov ax, 320
    mul dx
    add ax, bx
    mov di, ax
    
    ; Warna Ular (10 = Hijau)
    mov byte [es:di], 10
    
    pop dx
    pop bx

    ; --- B. MANUAL DELAY (PENGGANTI INT 15h) ---
    ; Kita suruh CPU berputar-putar menghabiskan waktu
    ; Semakin besar angka di CX, semakin lambat gamenya.
    
    mov cx, 0x75      ; <-- ATUR KECEPATAN DISINI (Coba 0x1000 - 0x4000)

.delay_outer:
    push cx
    mov cx, 0xFFFF      ; Loop dalam (habiskan cycle)
.delay_inner:
    nop                 ; No Operation (Diam)
    loop .delay_inner   ; Ulangi 65535 kali
    pop cx
    loop .delay_outer   ; Ulangi loop luar

    ; --- C. INPUT HANDLING ---
    mov ah, 0x01
    int 0x16
    jz .update_pos

    mov ah, 0x00
    int 0x16

    cmp al, 27          ; ESC
    je .exit_game

    ; Kontrol (WASD)
    cmp al, 'w'
    je .dir_up
    cmp al, 's'
    je .dir_down
    cmp al, 'a'
    je .dir_left
    cmp al, 'd'
    je .dir_right
    
    jmp .update_pos

.dir_up:
    mov si, 0
    mov bp, -1
    jmp .update_pos
.dir_down:
    mov si, 0
    mov bp, 1
    jmp .update_pos
.dir_left:
    mov si, -1
    mov bp, 0
    jmp .update_pos
.dir_right:
    mov si, 1
    mov bp, 0
    jmp .update_pos

.update_pos:
    ; --- D. UPDATE FISIKA ---
    add bx, si
    add dx, bp

    ; --- E. CEK TABRAKAN (SILENT) ---
    cmp bx, 2
    jl .crash_silent
    cmp bx, 317
    jg .crash_silent
    cmp dx, 2
    jl .crash_silent
    cmp dx, 197
    jg .crash_silent

    jmp .game_loop

.crash_silent:
    ; TIDAK ADA SUARA (Biar tidak error)
    call .reset_game_silent
    jmp .game_loop

.exit_game:
    mov ax, 0x0003
    int 0x10
    mov ax, ds
    mov es, ax
    mov si, msg_gui_end
    call kprint
    jmp shell_loop

; --- SUB-ROUTINE RESET (Tanpa Suara, Tanpa Delay BIOS) ---
.reset_game_silent:
    ; Clear Screen (Biru)
    xor di, di
    mov al, 1
    mov cx, 64000
    rep stosb
    
    ; Reset Posisi ke Tengah
    mov bx, 160
    mov dx, 100
    
    ; Reset Kecepatan (DIAM DULU)
    xor si, si
    xor bp, bp
    ret
; =================================================================
; [DAISY BELL HANDLER]
; Tribute to IBM 704 (1961) & HAL 9000
; =================================================================
_cmd_daisy:
    mov si, msg_daisy_art
    call kprint
    
    mov si, music_daisy   ; Load lagu Daisy Bell

.play_loop:
    lodsw               ; Ambil Frekuensi
    mov bx, ax
    cmp bx, 0           ; Cek Stop
    je .done_music

    lodsw               ; Ambil Durasi
    mov cx, ax

    ; Proteksi Silence
    cmp bx, 20
    jl .silent_delay

    call driver_sound_play
    jmp .next_note

.silent_delay:
    push cx
    mov ah, 0x86
    mov dx, 0xC350
    int 0x15
    pop cx

.next_note:
    ; Jeda antar nada (Legato - agak pendek jedanya)
    push cx
    mov cx, 1
    mov ah, 0x86
    mov dx, 0xC350
    int 0x15
    pop cx

    jmp .play_loop

.done_music:
    mov si, newline
    call kprint
    jmp shell_loop


; =================================================================
; [EASTER EGG: KASIH IBU]
; Command: "harta"
; =================================================================
_cmd_harta:
    mov si, msg_harta_art
    call kprint
    
    mov si, music_kasih_ibu   ; Load lagu

.play_loop:
    lodsw               ; Ambil Frekuensi
    mov bx, ax
    cmp bx, 0           ; Cek Stop (0 = Selesai)
    je .done_music

    lodsw               ; Ambil Durasi
    mov cx, ax

    ; Proteksi Silence (Jeda/Istirahat)
    cmp bx, 20
    jl .silent_delay

    call driver_sound_play
    jmp .next_note

.silent_delay:
    ; Jika nada istirahat (not angka 0), delay tanpa suara
    push cx
    mov ah, 0x86
    mov dx, 0xC350      ; Base delay 50ms
    int 0x15
    pop cx

.next_note:
    ; Legato Delay (Jeda sangat pendek antar nada biar tidak nempel)
    push cx
    mov cx, 1
    mov ah, 0x86
    mov dx, 0xC350
    int 0x15
    pop cx

    jmp .play_loop

.done_music:
    mov si, newline
    call kprint
    jmp shell_loop

; =================================================================
; [MULTI-SLOT STORAGE HANDLERS]
; =================================================================


; --- SLOT 1 (Sektor 10) ---
_cmd_write1:
    mov cl, 10           
    jmp _generic_write  

_cmd_read1:
    mov cl, 10
    jmp _generic_read    ; CPU langsung pergi ke generic_read, selesai.

; --- SLOT 2 (Sektor 11) ---
_cmd_write2:
    mov cl, 11           
    jmp _generic_write

_cmd_read2:
    mov cl, 11
    jmp _generic_read    ; Tidak perlu kode tambahan di bawahnya.

; --- SLOT 3 (Sektor 12) ---
_cmd_write3:
    mov cl, 12           
    jmp _generic_write

_cmd_read3:
    mov cl, 12
    jmp _generic_read    ; Lebih bersih dan hemat byte.

_generic_write:
    mov [target_sector], cl
    call _internal_disk_read_auto   ; Baca header lama (untuk password)

    ; 1. BERSIHKAN LAYAR DULU
    call driver_vga_clear
    
    ; 2. CETAK HEADER
    mov si, msg_editor_top
    call kprint

    ; 3. BERSIHKAN BUFFER RAM (Hanya area teks, Offset 16+)
    mov di, text_buffer + 32
    mov cx, 496                     
    mov al, 0
    rep stosb

    ; 4. RESET DI KE AWAL
    mov di, text_buffer + 32 

    ; --- [FIX DISINI] ---
    ; Cetak margin sekarang, tepat sebelum user mulai mengetik
    mov si, margin_line     
    call kprint
    ; --------------------

.edit_loop:
    mov ah, 0x00
    int 0x16
    
    cmp al, 27          ; ESC = Save
    je .save_to_disk
    cmp al, 13          ; Enter
    je .enter_key
    cmp al, 8           ; Backspace
    je .bs_key
    
    stosb               ; Simpan char
    mov ah, 0x0E
    int 0x10            ; Cetak char
    jmp .edit_loop

.bs_key:
    cmp di, text_buffer
    je .edit_loop
    dec di
    mov byte [di], 0
    mov ah, 0x0E
    mov al, 8
    int 0x10
    mov al, ' '
    int 0x10
    mov al, 8
    int 0x10
    jmp .edit_loop

.enter_key:
    mov al, 13
    stosb
    mov al, 10
    stosb
    
    ; Efek Visual Margin
    mov si, newline
    call kprint
    mov si, margin_line ; Cetak " | " di awal baris baru
    call kprint

    jmp .edit_loop
.save_to_disk:
    mov byte [di], 0    ; Null terminator
    mov si, newline
    call kprint
    mov si, msg_saving
    call kprint
    
    ; Lakukan Penyimpanan
    mov bx, text_buffer
    mov cl, [target_sector] ; <--- AMBIL KEMBALI SEKTOR TARGET
    call driver_disk_write
    
    jc .fail
    mov si, msg_saved_disk
    call kprint
    jmp shell_loop
.fail:
    jmp shell_loop


_generic_read:
    mov [target_sector], cl ;sektor target
    mov si, msg_reading ; jangan dihapus
    call kprint ;

    ; 1. Baca Disk ke Buffer
    mov bx, text_buffer
    mov cl, [target_sector] ;masukan sektor target
    
    ; Logika Driver (Legacy vs Standar)
    cmp cl, 50
    je .read_legacy
    mov dh, 1                   ; Head 1 untuk Slot 1-3
    call driver_disk_read
    jmp .check_security
.read_legacy:
    mov dh, 0                   ; Head 0 untuk Slot Old
    call driver_disk_read_legacy

.check_security:
    ; 2. Verifikasi Password sebelum menampilkan apapun
    call _verify_access
    jc shell_loop               ; Jika Gagal/Wiped, hentikan proses!

    ; 3. Tampilkan dengan OFFSET 16
    ; Gunakan SI + 16 agar password tidak ikut tercetak di layar
    mov si, text_buffer + 32    
    
    ; Cek apakah isi setelah header 16-byte itu kosong
    cmp byte [si], 0
    je .empty
    
    call kprint
    mov si, newline
    call kprint
    jmp shell_loop

.empty:
    mov si, msg_empty
    call kprint
    jmp shell_loop

; --- LEGACY HANDLERS ---

_cmd_write_old:
    call driver_vga_clear
    jmp _generic_write
    mov si, msg_editor_top
    call kprint

    ; Bersihkan Buffer
    mov di, text_buffer
    push di
    mov cx, 512
    mov al, 0
    rep stosb
    pop di

.loop_old:
    mov ah, 0x00
    int 0x16
    cmp al, 27          ; ESC
    je .save_old
    cmp al, 13          ; Enter
    je .enter_old
    cmp al, 8           ; Backspace
    je .bs_old
    stosb
    mov ah, 0x0E
    int 0x10
    jmp .loop_old

.bs_old:
    dec di
    jmp .loop_old ; (Simplified backspace)
.enter_old:
    mov al, 10
    stosb
    jmp .loop_old

.save_old:
    mov byte [di], 0
    mov si, newline
    call kprint
    mov si, msg_saving
    call kprint
    
    mov bx, text_buffer
    call driver_disk_write_legacy  ; <--- PANGGIL DRIVER LEGACY
    
    jc .fail_old
    mov si, msg_saved_disk
    call kprint
    jmp shell_loop
.fail_old:
    jmp shell_loop


_cmd_read_old:
    mov cl, 50
    call cmd_count_old
    call msg_count_old_info
    jmp _generic_read       ; Gunakan jalur resmi yang punya gerbang keamanan
    ; mov si, msg_reading
    ; call kprint
    
    ; ; Bersihkan buffer
    ; mov di, text_buffer
    ; mov cx, 512
    ; mov al, 0
    ; rep stosb

    ; mov bx, text_buffer
    ; call driver_disk_read_legacy   ; <--- PANGGIL DRIVER LEGACY
    
    ; mov si, text_buffer
    ; call kprint
    ; mov si, newline
    ; call kprint
    ; jmp shell_loop

; old count command (deprecated)
_cmd_count_old:
    mov si, msg_count_old_info
    call kprint

    call _verify_access    ; <--- Kunci pintu sebelum mencari
    jc shell_loop

    ; 1. Baca data dari Sektor 50 (Head 0) ke Buffer
    mov bx, text_buffer
    call driver_disk_read_legacy   ; Memanggil driver khusus legacy
    jc .error

    ; 2. Logika Hitung (Tetap Sama)
    mov si, text_buffer
    xor cx, cx          ; Reset counter ke 0
.loop:
    lodsb               ; Ambil 1 byte dari buffer
    or al, al           ; Apakah byte bernilai 0 (akhir teks)?
    jz .done
    inc cx              ; Jika bukan 0, hitungan +1
    jmp .loop

.done:
    mov si, msg_count_res
    call kprint
    mov ax, cx          ; Pindahkan hasil hitung ke AX
    call print_dec      ; Cetak angka desimal
    mov si, newline
    call kprint
    jmp shell_loop

.error:
    ; Jika disk error, kembali ke shell
    jmp shell_loop


_cmd_count1:
    mov cl, 10           ; Target Slot 1
    jmp _generic_count

_cmd_count2:
    mov cl, 11          ; Target Slot 2
    jmp _generic_count

_cmd_count3:
    mov cl, 12          ; Target Slot 3
    jmp _generic_count

; _generic_count:
;     mov [target_sector], cl ; Simpan sektor yang dipilih
;     mov si, msg_count_info
;     call kprint

;     mov si, text_buffer + 16        ; <--- LOMPATI HEADER KEAMANAN
;     xor cx, cx                      ; Reset counter

;     call _verify_access    ; <--- Kunci pintu sebelum mencari
;     jc shell_loop

;     ; 1. Baca data dari Sektor yang dipilih
;     mov bx, text_buffer
;     mov cl, [target_sector]
;     call driver_disk_read
;     jc .error

;     ; 2. Hitung Karakter (Logika Loop)
;     mov si, text_buffer
;     xor cx, cx          ; Reset counter
; .loop:
;     lodsb
;     or al, al           ; Cek Null Terminator
;     jz .done
;     inc cx
;     jmp .loop

; .done:
;     mov si, msg_count_res
;     call kprint
;     mov ax, cx          ; Hasil ke AX untuk dicetak
;     call print_dec      
;     mov si, newline
;     call kprint
;     jmp shell_loop

; .error:
;     jmp shell_loop


_generic_count:
    mov [target_sector], cl         ; Simpan sektor pilihan
    mov si, msg_count_info
    call kprint

    ; 1. BACA DATA DULU (PENTING!)
    ; Gunakan helper otomatis agar Head 0/1 terpilih dengan benar
    call _internal_disk_read_auto
    jc .error

    ; 2. BARU VERIFIKASI KEAMANAN
    call _verify_access             ; Cek apakah tersegel
    jc shell_loop                   ; Jika gagal, hentikan

    ; 3. LOGIKA HITUNG (SINKRONISASI OFFSET)
    mov si, text_buffer + 32        ; <--- MULAI DARI BYTE 32 (Teks asli)
    xor cx, cx                      ; Reset counter
    
.loop:
    lodsb                           ; Ambil karakter dari SI
    or al, al                       ; Cek apakah Null (Akhir teks)
    jz .done
    inc cx                          ; Tambah hitungan
    jmp .loop

.done:
    mov si, msg_count_res
    call kprint
    mov ax, cx                      ; Hasil hitung ke AX
    call print_dec                  ; Cetak angka
    mov si, newline
    call kprint
    jmp shell_loop

.error:
    jmp shell_loop

_cmd_find_old:
    mov bx, text_buffer
    call driver_disk_read_legacy   ; Baca Sektor 50 (Head 0)
    jmp _generic_find

_cmd_find1:
    mov cl, 10
    mov bx, text_buffer
    call driver_disk_read          ; Baca Slot 1 (Head 1)
    jmp _generic_find

_cmd_find2:
    mov cl, 11
    mov bx, text_buffer
    call driver_disk_read          ; Baca Slot 2 (Head 1)
    jmp _generic_find

_cmd_find3:
    mov cl, 12                      ; Target Sektor 3 (Slot 3)
    mov bx, text_buffer
    call driver_disk_read          ; Baca dari Head 1
    jmp _generic_find              ; Gunakan mesin pencari yang sama

_generic_find:
    mov [target_sector], cl
    mov bx, text_buffer
    
    ; 1. Baca data dulu untuk cek kunci
    call _internal_disk_read_auto   ; Fungsi pembantu (lihat di bawah)
    
    ; 2. Verifikasi SEBELUM minta input cari
    call _verify_access
    jc shell_loop                   ; Jika gagal/hancur, hentikan

    ; 3. Baru minta kata yang dicari
    mov si, msg_find_p
    call kprint
    mov di, find_buffer
    call kinput                     ; Input sekarang aman di buffer tersendir
    mov si, text_buffer + 32     ; Mulai cari dari offset 32 (lewati header + keamanan)

.outer_loop:
    lodsb                          ; AL = karakter dari kertas
    or al, al                      ; Cek Null (Akhir kertas)
    jz .not_found
    
    ; Bandingkan karakter pertama
    mov di, find_buffer
    cmp al, [di]
    jne .outer_loop                ; Jika beda, lanjut cari di kertas

    ; 3. Jika karakter pertama cocok, cek karakter berikutnya (Sub-string search)
    push si                        ; Simpan posisi SI saat ini
    mov bx, si                     ; Gunakan BX untuk scanning sementara
.check_match:
    inc di
    mov al, [di]                   ; Karakter kata kunci berikutnya
    or al, al                      ; Jika kata kunci habis (Null), berarti COCOK!
    jz .match_found
    
    mov dl, [bx]                   ; Karakter kertas berikutnya
    inc bx
    cmp al, dl
    je .check_match                ; Jika masih sama, cek terus

    pop si                         ; Jika gagal di tengah, balikkan SI
    jmp .outer_loop

.match_found:
    pop si                         ; Bersihkan stack
    mov si, msg_found
    call kprint
    jmp shell_loop

.not_found:
    mov si, msg_not_found
    call kprint
    jmp shell_loop

.error:
    jmp shell_loop

;===========================================================
; [SECTOR LOCKER COMMANDS]
;===========================================================

_cmd_lock_old:
    mov cl, 50                      ; Sektor 50
    mov [target_sector], cl
    mov bx, text_buffer
    call driver_disk_read_legacy    ; <--- KHUSUS LEGACY
    jmp _logic_lock_save

_cmd_lock1:
    mov cl, 10
    jmp _prepare_lock
_cmd_lock2:
    mov cl, 11
    jmp _prepare_lock
_cmd_lock3:
    mov cl, 12
    jmp _prepare_lock

; _prepare_lock:
;     mov [target_sector], cl
;     mov bx, text_buffer
;     call driver_disk_read           ; <--- DRIVER STANDAR
;     ; Lanjut ke bawah...

_prepare_lock:
    mov [target_sector], cl
    call _internal_disk_read_auto   ; Baca data disk ke RAM

    ; --- IF 1: Cek status kunci ---
    cmp byte [text_buffer + 8], 1   ; Byte 8 = Status Segel
    jne _logic_lock_save            ; Jika 0 (Open), langsung buat kunci baru

    ; --- IF 2: Verifikasi sandi lama ---
    mov si, msg_lock_exists
    call kprint
    call _verify_access             ; Panggil gerbang keamanan
    jc shell_loop                   ; Jika salah, tendang balik ke shell

    ; --- IF 3: Konfirmasi Ganti (.lower() logic) ---
    mov si, msg_ask_change
    call kprint
    
    call kgetc                      ; Sekarang sudah terdefinisi!
    call kputc                      ; Tampilkan apa yang diketik user
    
    or al, 00100000b                ; Konversi ke Lowercase (bit 5 = 1)
    cmp al, 'y'
    jne .cancel_change

    mov si, newline
    call kprint
    jmp _logic_lock_save            ; Masuk ke menu pembuatan sandi baru

.cancel_change:
    mov si, msg_cancel
    call kprint
    jmp shell_loop

.force_unlock:
    mov si, msg_lock_exists
    call kprint
    
    ; Alihkan alur ke fungsi UNLOCK
    ; (User harus memasukkan password lama sebelum bisa mengganti/menghapus)
    jmp _generic_unlock             ; Paksa prosedur verifikasi

; =================================================================
; FUNGSI: _logic_lock_save
; Tujuan: Menanam password dan status kunci ke sektor target
; =================================================================
_logic_lock_save:
    ; 1. Minta input kunci baru
    mov si, msg_new_pass
    call kprint
    mov di, temp_pass_buffer
    call kinput                   

    ; 2. Tanam kunci ke 8 byte pertama text_buffer
    mov si, temp_pass_buffer
    mov di, text_buffer
    mov cx, 8                       
.copy_pass:
    lodsb
    stosb
    loop .copy_pass

    ; 3. Set Header Keamanan (Byte 8=Status, Byte 9=Retry)
    mov byte [text_buffer + 8], 1   ; Status: LOCKED (1)
    mov byte [text_buffer + 9], 0   ; Counter: 0

    ; 4. Eksekusi Penulisan dengan Proteksi Error
    mov bx, text_buffer
    mov cl, [target_sector]
    mov dl, [boot_drive]            ; Pastikan Drive ID benar
    
    cmp cl, 50
    je .save_legacy

    ; --- Jalur Standar (Slot 1-3, Head 1) ---
    mov dh, 1                       
    call driver_disk_write          
    jc .error_io                    ; Jika Carry Set (Error), lompat!
    jmp .success

.save_legacy:
    ; --- Jalur Legacy (Sector 50, Head 0) ---
    mov dh, 0                       
    call driver_disk_write_legacy   
    jc .error_io

.success:
    mov si, msg_lock_success
    call kprint
    jmp shell_loop

.error_io:
    ; Jangan cetak pesan sukses jika sampai di sini
    jmp shell_loop

; =================================================================
; FUNGSI: _verify_access
; Tujuan: Gerbang keamanan sebelum akses data (Read/Find/Count)
; Output: Carry Clear (Akses Diterima), Carry Set (Akses Ditolak/Wiped)
; =================================================================
_verify_access:
    pusha
    cmp byte [text_buffer + 8], 0   ; Cek status Locked
    je .granted

.ask_pass:
    ; --- PEMBERSIHAN BUFFER ---
    mov di, temp_pass_buffer
    mov cx, 10
    mov al, 0
    rep stosb                       ; Pastikan buffer bersih dari sampah

    mov si, msg_enter_pass
    call kprint
    mov di, temp_pass_buffer
    call kinput
    
    ; Bandingkan (8 byte)
    mov si, temp_pass_buffer
    mov di, text_buffer
    mov cx, 8
    repe cmpsb
    je .granted_reset

.wrong_pass:
    inc byte [text_buffer + 9]      ; Tambah counter
    call _internal_disk_update      ; SIMPAN KE DISK (Agar counter permanen)
    
    cmp byte [text_buffer + 9], 3
    jge .self_destruct
    
    mov si, msg_wrong_pass
    call kprint
    jmp .ask_pass

.granted_reset:
    mov byte [text_buffer + 9], 0   ; Reset counter jika berhasil
    call _internal_disk_update

.granted:
    popa
    clc
    ret

.self_destruct:
    mov si, msg_wiping
    call kprint
    mov di, text_buffer
    mov cx, 512
    xor al, al
    rep stosb                       ; Wiping data
    call _internal_disk_update
    mov si, msg_wiped_success
    call kprint
    popa
    stc
    ret
    

; =================================================================
; [HELPER FUNCTIONS - DISK AUTOMATION]
; =================================================================

_internal_disk_read_auto:
    pusha
    mov bx, text_buffer
    mov cl, [target_sector]
    mov dl, [boot_drive]
    cmp cl, 50
    je .read_old_helper
    mov dh, 1                   ; Head 1 untuk Slot 1, 2, 3
    call driver_disk_read
    jmp .read_done
.read_old_helper:
    mov dh, 0                   ; Head 0 untuk Slot Old
    call driver_disk_read_legacy
.read_done:
    popa
    ret

_internal_disk_update:
    mov bx, text_buffer
    mov cl, [target_sector]
    mov dl, [boot_drive]
    cmp cl, 50
    je .upd_old_helper
    mov dh, 1
    call driver_disk_write
    ret             ; Biarkan Carry Flag lolos ke pemanggil
.upd_old_helper:
    mov dh, 0
    call driver_disk_write_legacy
    ret

; =================================================================
; [PAPEROS v2.0 - GUI WITH WINDOW & ICON]
; Fitur: Desktop Teal + Taskbar + Window "Welcome" + Icon + Cursor
; =================================================================

_cmd_desktop:
    mov ax, 0x0013  ; Mode VGA 320x200
    int 0x10
    mov ax, 0xA000
    mov es, ax

    ; Posisi Awal Kursor Mouse
    mov cx, 160     ; X
    mov dx, 100     ; Y

.render_loop:
    ; --- 1. LAYER BACKGROUND (TEAL) ---
    xor di, di
    mov al, 3       ; Warna 3 (Teal)
    push cx         ; Simpan X mouse
    mov cx, 64000
    rep stosb
    pop cx          ; Balikin X mouse

    ; --- 2. LAYER IKON "MY COMPUTER" (Pojok Kiri Atas) ---
    ; Gambar di X=10, Y=10. Ukuran 20x20.
    push cx
    push dx 
    mov di, 6420   ; Offset (10 * 320) + 10
    mov dx, 20      ; Tinggi Icon
.draw_icon_loop:
    mov cx, 20      ; Lebar Icon
    mov al, 14      ; Warna 14 (Kuning - Folder)
    push di
    rep stosb
    pop di
    add di, 320
    dec dx
    jnz .draw_icon_loop
    
    pop dx
    pop cx

    ; --- 3. LAYER WINDOW "WELCOME" (Tengah) ---
    ; Kotak Utama (Abu-abu)
    ; X=80, Y=50, Lebar=160, Tinggi=80
    push cx
    push dx
    
    mov di, 16080   ; Offset (50 * 320) + 80
    mov dx, 80      ; Tinggi Window
.draw_win_body:
    mov cx, 160     ; Lebar Window
    mov al, 7       ; Warna 7 (Abu-abu Muda)
    push di
    rep stosb
    pop di
    add di, 320
    dec dx
    jnz .draw_win_body

    ; Title Bar (Biru Tua)
    ; X=82, Y=52, Lebar=156, Tinggi=10
    mov di, 16722   ; Offset ((50+2) * 320) + 82
    mov dx, 10      ; Tinggi Title Bar
.draw_win_title:
    mov cx, 156     ; Lebar
    mov al, 1       ; Warna 1 (Biru Tua)
    push di
    rep stosb
    pop di
    add di, 320
    dec dx
    jnz .draw_win_title

    ; Tombol Close [X] (Merah)
    ; Di pojok kanan title bar
    mov di, 16868   ; Offset ((50+2)*320) + (80+160-14)
    mov dx, 8       ; Tinggi Tombol
.draw_close_btn:
    mov cx, 8
    mov al, 4       ; Merah
    push di
    rep stosb
    pop di
    add di, 320
    dec dx
    jnz .draw_close_btn
    
    pop dx
    pop cx

    ; --- 4. LAYER TASKBAR (Bawah) ---
    mov di, 60800
    mov al, 7       ; Abu-abu
    push cx
    mov cx, 3200
    rep stosb
    pop cx
    
    ; Tombol Start (Hijau)
    push cx
    push dx
    mov di, 61125
    mov dx, 14      ; Tinggi lebih besar
.draw_start:
    mov cx, 40      ; Lebar lebih besar
    mov al, 2       ; Hijau
    push di
    rep stosb
    pop di
    add di, 320
    dec dx
    jnz .draw_start
    pop dx
    pop cx

    ; --- 5. LAYER KURSOR MOUSE (Paling Atas) ---
    push dx
    push cx
    
    mov ax, 320
    mul dx
    add ax, cx
    mov di, ax
    
    ; Gambar Panah Mouse (Putih)
    mov al, 15
    mov [es:di], al
    mov [es:di+1], al
    mov [es:di+320], al
    mov [es:di+321], al
    mov [es:di+640], al
    
    pop cx
    pop dx

    ; --- 6. INPUT LOOP ---
    mov ah, 0x00
    int 0x16
    
    cmp al, 27      ; ESC
    je .exit_gui
    
    cmp al, 'w'
    je .up
    cmp al, 's'
    je .down
    cmp al, 'a'
    je .left
    cmp al, 'd'
    je .right
    
    jmp .render_loop

.up:
    dec dx
    jmp .render_loop
.down:
    inc dx
    jmp .render_loop
.left:
    dec cx
    jmp .render_loop
.right:
    inc cx
    jmp .render_loop

.exit_gui:
    mov ax, 0x0003
    int 0x10
    mov ax, ds
    mov es, ax
    jmp shell_loop

; ==========================================================
; SERIAL DRIVER (UART 8250 - COM1)
; ==========================================================
serial_init:
    ; Setup COM1 pada 9600 baud rate (Standar QEMU)
    mov dx, 0x3FB   ; Line Control
    mov al, 0x80    ; Enable DLAB
    out dx, al
    mov dx, 0x3F8   ; Divisor Low (12 = 9600 baud)
    mov al, 12
    out dx, al
    mov dx, 0x3F9   ; Divisor High
    mov al, 0
    out dx, al
    mov dx, 0x3FB   ; Line Control (8N1)
    mov al, 0x03
    out dx, al
    mov dx, 0x3FA   ; FIFO Control
    mov al, 0xC7
    out dx, al
    ret

serial_read_char:
    mov dx, 0x3FD   ; Line Status Register
    in al, dx
    test al, 1      ; Cek Bit 0 (Data Ready)
    jz .no_data

    mov dx, 0x3F8   ; Baca data
    in al, dx
    stc             ; Set Carry Flag (Data Ada)
    ret
.no_data:
    clc             ; Clear Carry Flag (Data Kosong)
    ret

; --- KEYBOARD UTILS ---
flush_keyboard_buffer:
    mov ah, 0x01
    int 0x16
    jz .done
    mov ah, 0x00
    int 0x16
    jmp flush_keyboard_buffer
.done:
    ret

; =================================================================
; [UNLOCK COMMANDS]
; =================================================================
_cmd_unlock1:
    mov cl, 10
    jmp _generic_unlock

_cmd_unlock2:
    mov cl, 11
    jmp _generic_unlock

_cmd_unlock3:
    mov cl, 12
    jmp _generic_unlock

_cmd_unlock_old:
    mov cl, 50
    jmp _generic_unlock

_generic_unlock:
    mov [target_sector], cl
    
    ; 1. Baca data dari disk ke RAM
    call _internal_disk_read_auto
    
    ; 2. Cek apakah memang terkunci?
    cmp byte [text_buffer + 8], 0
    je .already_open

    ; 3. Verifikasi Password (Harus tahu kunci lama sebelum buka gembok)
    call _verify_access
    jc shell_loop           ; Jika salah/hancur, stop.

    ; 4. PROSES PEMBUKAAN GEMBOK
    mov byte [text_buffer + 8], 0   ; Set Status: UNLOCKED
    mov byte [text_buffer + 9], 0   ; Reset Counter
    
    ; Opsional: Bersihkan area password (byte 0-7) agar bersih
    mov di, text_buffer
    mov al, 0
    mov cx, 8
    rep stosb

    ; 5. Simpan perubahan ke Disket
    call _internal_disk_update
    
    mov si, msg_unlock_success
    call kprint
    jmp shell_loop

.already_open:
    mov si, msg_already_open
    call kprint
    jmp shell_loop

; =================================================================
; [PAPEREDIT - VISUAL MICRO EDITOR]
; =================================================================
_cmd_edit1:
    mov cl, 10
    jmp _generic_editor

_cmd_edit2:
    mov cl, 11
    jmp _generic_editor

_cmd_edit3:
    mov cl, 12
    jmp _generic_editor

; =================================================================
; [PAPEREDIT v1.2 - MARGIN UPDATE]
; Fitur: Visual Margin " | " tanpa merusak data file
; =================================================================

; =================================================================
; [PAPEREDIT v1.3 - 32-BYTE HEADER SUPPORT]
; Fix: Text Start Offset moved to 32 to protect Filename
; =================================================================
_generic_editor:
    mov [target_sector], cl         
    call _internal_disk_read_auto   ; Baca data disk

    ; --- CEK KEAMANAN (Tetap sama) ---
    cmp byte [text_buffer + 8], 1   
    jne .unlocked
    call _verify_access             
    jc shell_loop                   

.unlocked:
    call driver_vga_clear           
    mov si, msg_editor_header
    call kprint

    ; [MARGIN AWAL]
    mov si, margin_line             
    call kprint

    ; -----------------------------------------------------------
    ; [UPDATE PENTING 1] Tampilkan Teks Lama mulai dari +32
    ; -----------------------------------------------------------
    mov si, text_buffer + 32        ; <-- DULU 16, SEKARANG 32
    
.print_existing_loop:
    lodsb                           
    or al, al                       
    jz .scan_cursor_start             
    
    call kputc                      
    
    cmp al, 10                      
    jne .print_existing_loop
    
    push si
    mov si, margin_line
    call kprint
    pop si
    jmp .print_existing_loop

.scan_cursor_start:
    ; -----------------------------------------------------------
    ; [UPDATE PENTING 2] Scan Kursor mulai dari +32
    ; -----------------------------------------------------------
    mov di, text_buffer + 32        ; <-- DULU 16, SEKARANG 32
    xor bx, bx                      
.scan_loop:
    cmp byte [di + bx], 0           
    je .scan_done
    inc bx
    cmp bx, 470                     ; Batas dikurangi (512 - 32 header)
    jge .scan_done
    jmp .scan_loop

.scan_done:
    add bx, 32                      ; <-- BX start offset sekarang 32

.edit_loop:
    call kgetc                      
    
    cmp al, 27                      ; ESC
    je .save_exit
    cmp al, 13                      ; ENTER
    je .handle_enter
    cmp al, 0x08                    ; BACKSPACE
    je .handle_backspace

    ; --- TULIS KARAKTER BIASA ---
    cmp bx, 510                     
    jge .edit_loop
    
    mov [text_buffer + bx], al      
    inc bx
    call kputc                      
    jmp .edit_loop

.handle_enter:
    cmp bx, 508                     
    jge .edit_loop
    
    mov byte [text_buffer + bx], 13
    inc bx
    mov byte [text_buffer + bx], 10
    inc bx
    
    mov al, 13                      
    call kputc
    mov al, 10
    call kputc
    mov si, margin_line             
    call kprint
    jmp .edit_loop

.handle_backspace:
    ; -----------------------------------------------------------
    ; [UPDATE PENTING 3] Batas Backspace jangan sampai hapus Header
    ; -----------------------------------------------------------
    cmp bx, 32                      ; <-- JANGAN MUNDUR KURANG DARI 32!
    je .edit_loop
    
    dec bx
    
    cmp byte [text_buffer + bx], 10 
    jne .normal_bs
    
    dec bx                          
    mov byte [text_buffer + bx], 0  
    
    ; Hapus Visual Margin
    call kputc_bs 
    call kputc_bs 
    call kputc_bs ; Spasi
    call kputc_bs ; Garis
    call kputc_bs ; Spasi
    jmp .edit_loop

.normal_bs:
    mov byte [text_buffer + bx], 0  
    call kputc_bs                   
    jmp .edit_loop

.save_exit:
    mov byte [text_buffer + bx], 0  
    mov bx, text_buffer             ; Reset ke awal buffer
    mov cl, [target_sector] 
    call driver_disk_write          
    
    mov si, newline
    call kprint                     
    jc .save_fail
    mov si, msg_editor_saved
    call kprint
    jmp shell_loop

.save_fail:
    mov si, msg_disk_err
    call kprint
    jmp shell_loop

; --- HELPER KECIL (Visual Backspace) ---
kputc_bs:
    mov al, 0x08
    call kputc
    mov al, ' '
    call kputc
    mov al, 0x08
    call kputc
    ret


_net_detect:
    mov si, msg_net_probing
    call kprint

    ; 1. Coba baca Command Register (CR) di Port 0x300
    mov dx, 0x300       ; Port Base NE2000
    in al, dx           ; Baca dari port
    
    ; 2. Lakukan Reset Software (Opsional tapi disarankan)
    ; Kita tulis nilai 0x21 (Stop & Abort) ke Command Register
    mov al, 0x21
    out dx, al          ; Kirim ke hardware
    
    ; Beri jeda sangat singkat agar hardware merespons
    push cx
    mov cx, 0xFFFF
.delay: loop .delay
    pop cx

    ; 3. Baca kembali untuk verifikasi
    in al, dx
    cmp al, 0x21        ; Apakah hardware menyimpan nilai 0x21?
    jne .not_found

    mov si, msg_net_found
    call kprint
    clc                 ; Clear Carry = Sukses
    ret

.not_found:
    mov si, msg_net_err
    call kprint
    stc                 ; Set Carry = Gagal
    ret

_cmd_netinfo:
    call _net_detect            ; Pastikan kartu ada
    jc shell_loop               ; Jika tidak ada, kembali ke shell

    mov si, msg_net_mac_title
    call kprint

    ; --- PROSES MEMBACA PROM NE2000 ---
    mov dx, 0x300               ; Command Register
    mov al, 0x21                ; Stop mode, Bank 0
    out dx, al

    ; Set Remote Start Address (RSAR0/1) ke 0
    mov dx, 0x308
    mov al, 0
    out dx, al
    mov dx, 0x309
    out dx, al

    ; Set Remote Byte Count (RBCR0/1) ke 12 (MAC + Checksum)
    mov dx, 0x30A
    mov al, 12
    out dx, al
    mov dx, 0x30B
    mov al, 0
    out dx, al

    ; Eksekusi Remote Read
    mov dx, 0x300
    mov al, 0x0A
    out dx, al

    ; Baca 6 byte pertama dari Data Port (0x310)
    mov cx, 6
    mov dx, 0x310               ; Data Port NE2000
.read_mac_loop:
    in al, dx                   ; Ambil 1 byte MAC
    call print_hex              ; Cetak dalam format Hex (XX)
    
    cmp cx, 1                   ; Jika bukan byte terakhir, cetak ":"
    je .no_colon
    push ax
    mov al, ':'
    call kputc
    pop ax
.no_colon:
    loop .read_mac_loop

    mov si, newline
    call kprint
    jmp shell_loop

_cmd_arp_test:
    mov si, msg_arp_sending
    call kprint

    ; Panggil fungsi penyusun paket ARP yang kita buat sebelumnya
    call _net_send_arp_request

    ; Cek apakah pengiriman berhasil (asumsi jika tidak ada hang di I/O)
    mov si, msg_arp_done
    call kprint
    
    jmp shell_loop

; =================================================================
; [PAPERSUDOKU v2.0.1 - REVISI VISUAL BETA]
; Fix: Grid Rapi, Angka Presisi, Real-time Update
; =================================================================

_cmd_sudoku:
    ; 1. Masuk Mode Grafis 13h (320x200)
    mov ax, 0x0013
    int 0x10
    mov ax, 0xA000
    mov es, ax

    ; Reset Kursor ke 0
    mov word [sudoku_cursor_idx], 0

.render_loop:
    ; --- A. BACKGROUND (Biru Tua) ---
    xor di, di
    mov al, 1       ; Warna Biru
    mov cx, 64000
    rep stosb

    ; --- B. GAMBAR GRID (PERBAIKAN TOTAL) ---
    ; Grid dimulai di X=40, Y=10 (Biar agak tengah)
    ; Ukuran sel = 20x20 pixel.
    
    ; 1. Gambar 10 Garis HORIZONTAL
    mov cx, 10          ; Loop 10 garis
    mov bx, 10          ; Y Start = 10
.draw_horz:
    push cx
    
    ; Hitung Offset Awal Garis: (Y * 320) + X_Start(40)
    mov ax, 320
    mul bx
    add ax, 40
    mov di, ax
    
    mov cx, 180         ; Panjang garis (9 kotak * 20px)
    mov al, 15          ; Warna Putih
    rep stosb           ; Gambar garis
    
    add bx, 15          ; Turun 20 pixel untuk garis berikutnya
    pop cx
    loop .draw_horz

    ; 2. Gambar 10 Garis VERTIKAL
    mov cx, 10          ; Loop 10 garis
    mov bx, 40          ; X Start = 40
.draw_vert:
    push cx
    push bx             ; Simpan posisi X saat ini
    
    ; Setup Loop Gambar ke Bawah
    mov dx, 180         ; Tinggi garis (9 kotak * 20px)
    
    ; Hitung Offset Awal: (Y_Start(10) * 320) + X_Saat_Ini
    mov ax, 320
    mov si, 10          ; Y Start
    mul si
    add ax, bx          ; Tambah X
    mov di, ax
    
.vert_pixel:
    mov byte [es:di], 15 ; Pixel Putih
    add di, 320          ; Turun 1 baris pixel
    dec dx
    jnz .vert_pixel
    
    pop bx              ; Ambil X lagi
    add bx, 20          ; Geser X 20 pixel ke kanan
    pop cx
    loop .draw_vert

    ; --- C. GAMBAR KURSOR (Highlight Merah) ---
    ; Konversi Index (0-80) ke Baris/Kolom Grid
    mov ax, [sudoku_cursor_idx]
    mov bl, 9
    div bl              ; AL = Row (0-8), AH = Col (0-8)
    
    ; Hitung Posisi Pixel Kursor
    ; PixelX = 40 + (Col * 20) + 1
    ; PixelY = 10 + (Row * 20) + 1
    
    xor bx, bx
    mov bl, ah          ; Ambil Col
    imul bx, 20
    add bx, 41          ; X Start (40) + 1 margin
    
    xor dx, dx
    mov dl, al          ; Ambil Row
    imul dx, 20
    add dx, 11          ; Y Start (10) + 1 margin
    
    ; Gambar Kotak Merah (19x19 pixel)
    push dx             ; Simpan Y Pixel
    
    ; Hitung DI
    mov ax, 320
    mul dx
    add ax, bx
    mov di, ax
    
    mov dx, 19          ; Tinggi Kursor
.draw_cursor_box:
    mov cx, 19          ; Lebar Kursor
    mov al, 4           ; Warna Merah
    push di
    rep stosb
    pop di
    add di, 320
    dec dx
    jnz .draw_cursor_box
    
    pop dx              ; Restore Y Pixel

    ; --- D. GAMBAR ANGKA (Loop 0-80) ---
    mov cx, 0           ; Counter Index

.draw_numbers_loop:
    cmp cx, 81
    je .wait_input
    
    ; Ambil angka dari array
    mov bx, cx
    mov al, [sudoku_board + bx]
    
    cmp al, 0           ; Jika 0 (kosong), lewati
    je .next_number
    
    push ax             ; Simpan Angka
    push cx             ; Simpan Index
    
    ; Hitung Row/Col Grid dari Index
    mov ax, cx
    mov bl, 9
    div bl              ; AL = Row Grid, AH = Col Grid
    
    ; KONVERSI KE KURSOR TEKS (BIOS)
    ; Mode 13h teks adalah 40 kolom x 25 baris.
    ; Grid Grafis kita mulai di X=40, Y=10.
    ; 1 Karakter font BIOS kira-kira 8x8 pixel.
    
    ; Rumus Kira-kira agar pas di tengah kotak 20x20:
    ; TextRow = (PixelY / 8) + Adjustment
    ; TextCol = (PixelX / 8) + Adjustment
    
    ; PixelY = 10 + (RowGrid * 20) + 6 (offset tengah)
    ; PixelX = 40 + (ColGrid * 20) + 6 (offset tengah)
    
    ; --- Hitung Baris Teks (DL) ---
    mov dh, al          ; Row Grid
    mov al, 20
    mul dh              ; Row * 20
    add ax, 10          ; + Y Start
    add ax, 6           ; + Tengah
    mov bl, 8
    div bl              ; Bagi 8 (Tinggi font)
    mov dh, al          ; Hasil ke DH (Row Text)

    ; --- Hitung Kolom Teks (DL) ---
    mov al, ah          ; Col Grid (tadi ada di AH hasil div pertama)
    push ax             ; Simpan Col Grid sementara
    
    mov al, 20
    pop bx              ; Ambil Col Grid ke BL (tapi harus di register yg bisa dimuli)
    push dx             ; Simpan DH (Row Text) yg sudah jadi
    
    mov dl, bl          ; Pindah Col Grid ke DL biar aman
    mul dl              ; AL (20) * DL (Col Grid)
    add ax, 40          ; + X Start
    add ax, 6           ; + Tengah
    mov bl, 8
    div bl              ; Bagi 8 (Lebar font)
    mov dl, al          ; Hasil ke DL (Col Text)
    
    pop bx              ; Ambil DH (Row Text) dari stack ke BX dulu
    mov dh, bl          ; Pindahin ke DH
    
    ; Set Kursor BIOS
    mov ah, 0x02
    mov bh, 0
    int 0x10
    
    pop cx              ; Balikin Index
    pop ax              ; Balikin Angka
    
    ; Cetak Angka
    add al, '0'         ; Int ke ASCII
    mov ah, 0x0E
    
    ; Cek Warna (Soal vs Jawaban)
    mov bx, cx
    cmp byte [sudoku_lock + bx], 0
    jne .color_clue
    mov bl, 15          ; Putih (Jawaban User)
    jmp .do_print
.color_clue:
    mov bl, 14          ; Kuning (Soal) - Lebih kontras dari hijau
.do_print:
    int 0x10
    
.next_number:
    inc cx
    jmp .draw_numbers_loop

    ; --- E. INPUT HANDLING ---
.wait_input:
    mov ah, 0x00
    int 0x16

    cmp al, 27          ; ESC
    je .exit_sudoku

    ; Navigasi (WASD)
    cmp al, 'w'
    je .move_up
    cmp al, 's'
    je .move_down
    cmp al, 'a'
    je .move_left
    cmp al, 'd'
    je .move_right
    
    ; Input Angka (1-9)
    cmp al, '1'
    jl .render_loop     ; JIKA BUKAN ANGKA, REDRAW SAJA
    cmp al, '9'
    jg .render_loop
    
    ; Masukkan Angka
    ; 1. Cek Kunci
    mov bx, [sudoku_cursor_idx]
    cmp byte [sudoku_lock + bx], 0
    jne .render_loop    ; Jika terkunci, abaikan
    
    ; 2. Simpan & UPDATE
    sub al, '0'
    mov [sudoku_board + bx], al
    jmp .render_loop    ; <--- LOMPAT KE ATAS UNTUK REDRAW REALTIME!

; --- LOGIKA PERGERAKAN (Sama, tapi pastikan lompat ke .render_loop) ---
.move_right:
    mov bx, [sudoku_cursor_idx]
    inc bx
    cmp bx, 81
    jge .render_loop
    mov [sudoku_cursor_idx], bx
    jmp .render_loop

.move_left:
    mov bx, [sudoku_cursor_idx]
    dec bx
    cmp bx, 0
    jl .render_loop
    mov [sudoku_cursor_idx], bx
    jmp .render_loop

.move_up:
    mov bx, [sudoku_cursor_idx]
    sub bx, 9
    cmp bx, 0
    jl .render_loop
    mov [sudoku_cursor_idx], bx
    jmp .render_loop

.move_down:
    mov bx, [sudoku_cursor_idx]
    add bx, 9
    cmp bx, 81
    jge .render_loop
    mov [sudoku_cursor_idx], bx
    jmp .render_loop

.exit_sudoku:
    mov ax, 0x0003
    int 0x10
    jmp shell_loop

; ==========================================================
; SOUND DRIVER (FIXED FOR FAST CPUs)
; Input: BX = Frekuensi (Hz), CX = Durasi (satuan 50ms)
; ==========================================================
driver_sound_play:
    push ax
    push bx
    push cx
    push dx

    ; 1. Set Frekuensi (PIT 8253 Command)
    mov al, 182         ; Channel 2, Square Wave
    out 0x43, al
    
    mov dx, 0x12        ; Oscillator = 1,193,180 Hz
    mov ax, 0x34DC
    div bx              ; Hitung Divisor (1193180 / BX)
    
    out 0x42, al        ; Kirim Low Byte
    mov al, ah
    out 0x42, al        ; Kirim High Byte

    ; 2. Nyalakan Speaker
    in al, 0x61
    or al, 0x03         ; Set Bit 0 & 1
    out 0x61, al

    ; 3. Delay menggunakan BIOS Timer (INT 15h)
    ; Kita akan loop sebanyak CX kali. Setiap loop = 50ms.
.wait_loop:
    push cx             ; Simpan counter utama
    
    ; Setup INT 15h, AH=86h (Wait)
    ; CX:DX = Durasi dalam mikrotik (microseconds)
    ; 50ms = 50,000 us = 0xC350 (Hex)
    mov ah, 0x86
    mov cx, 0           ; High word 0
    mov dx, 0xC350      ; Low word 50,000
    int 0x15            ; BIOS Sleep
    
    pop cx              ; Ambil counter utama
    loop .wait_loop     ; Ulangi sampai habis

    ; 4. Matikan Speaker
    in al, 0x61
    and al, 0xFC        ; Clear Bit 0 & 1
    out 0x61, al

    pop dx
    pop cx
    pop bx
    pop ax
    ret

app_clock_realtime:
    mov si, msg_clock_run
    call kprint
.tick:
    mov ah, 0x01
    int 0x16
    jnz .exit
    mov ah, 0x02
    int 0x1A
    mov al, ch
    call util_bcd_to_bin
    add al, 7
    cmp al, 24
    jl .no_ov
    sub al, 24
.no_ov:
    call util_bin_to_bcd
    mov ch, al
    mov ah, 0x0E
    mov al, 13
    int 0x10
    mov al, ch
    call util_print_bcd
    mov al, ':'
    call kputc
    mov al, cl
    call util_print_bcd
    mov al, ':'
    call kputc
    mov al, dh
    call util_print_bcd
    mov cx, 0x0F
    mov dx, 0x4240
    mov ah, 0x86
    int 0x15
    jmp .tick
.exit:
    mov ah, 0x00
    int 0x16
    mov si, newline
    call kprint
    ret

driver_vga_clear:
    mov ah, 0x06
    mov al, 0
    mov bh, [color_attr]
    mov cx, 0
    mov dx, 0x184F
    int 0x10
    mov ah, 0x02
    mov bh, 0
    mov dx, 0
    int 0x10
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

kputc:
    mov ah, 0x0E
    int 0x10
    ret

kinput:
    xor cl, cl
.loop:
    mov ah, 0
    int 0x16
    cmp al, 13
    je .done
    cmp al, 8
    je .backspace
    cmp cl, 60
    je .loop
    mov [di], al
    inc di
    inc cl
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
.done:
    mov byte [di], 0
    mov si, newline
    call kprint
    ret

strcmp:
.loop:
    mov al, [si]
    mov bl, [di]
    cmp al, bl
    jne .ne
    cmp al, 0
    je .eq
    inc si
    inc di
    jmp .loop
.ne:
    clc
    ret
.eq:
    stc
    ret

util_bcd_to_bin:
    push bx
    mov bl, al
    and al, 0x0F
    mov bh, al
    mov al, bl
    shr al, 4
    mov bl, 10
    mul bl
    add al, bh
    pop bx
    ret

util_bin_to_bcd:
    push bx
    xor ah, ah
    mov bl, 10
    div bl
    shl al, 4
    or al, ah
    pop bx
    ret

print_dec:
    push ax
    push bx
    push cx
    push dx
    mov bx, 10
    xor cx, cx
.div:
    xor dx, dx
    div bx
    push dx
    inc cx
    test ax, ax
    jnz .div
.prt:
    pop ax
    add al, '0'
    mov ah, 0x0E
    int 0x10
    loop .prt
    pop dx
    pop cx
    pop bx
    pop ax
    ret

util_print_bcd:
    push ax
    shr al, 4
    add al, '0'
    call kputc
    pop ax
    and al, 0x0F
    add al, '0'
    call kputc
    ret

; ==========================================================
; [UTILITY FUNCTIONS - PRINTING & CONVERSION]
; ==========================================================

; ... fungsi utilitas lainnya seperti util_bin_to_bcd ...

; --- CETAK HEXADECIMAL (Baru) ---
print_hex:
    push ax
    push bx
    
    mov bl, al
    shr al, 4           ; Ambil nibble tinggi
    call .to_ascii
    call kputc          ; Gunakan kputc yang sudah ada di kernel
    
    mov al, bl
    and al, 0x0F        ; Ambil nibble rendah
    call .to_ascii
    call kputc
    
    pop bx
    pop ax
    ret

.to_ascii:
    cmp al, 10
    jl .is_digit
    add al, 'A' - 10
    ret
.is_digit:
    add al, '0'
    ret

_net_send_arp_request:
    pusha
    mov di, packet_buffer

    ; --- [BAGIAN 1: ETHERNET HEADER] ---
    ; 1. Destination MAC: FF:FF:FF:FF:FF:FF (Broadcast ke semua)
    mov al, 0xFF
    mov cx, 6
    rep stosb

    ; 2. Source MAC: Gunakan MAC asli PaperOS
    mov si, mac_local
    mov cx, 6
    rep movsb

    ; 3. Ethernet Type: ARP (0x0806)
    mov ax, [ETHTYPE_ARP]
    stosw

    ; --- [BAGIAN 2: ARP PAYLOAD] ---
    mov ax, 0x0100          ; Hardware Type: Ethernet (0x0001 Big Endian)
    stosw
    mov ax, [ETHTYPE_IP]    ; Protocol Type: IPv4 (0x0800)
    stosw
    mov al, 6               ; Hardware Size: 6 byte
    stosb
    mov al, 4               ; Protocol Size: 4 byte
    stosb
    mov ax, [ARP_OP_REQUEST]; OpCode: Request (0x0001)
    stosw

    ; Sender Info
    mov si, mac_local
    mov cx, 6
    rep movsb
    mov si, ip_local
    mov cx, 4
    rep movsb

    ; Target Info (MAC Nol karena kita belum tahu, IP Gateway)
    xor al, al
    mov cx, 6
    rep stosb
    mov si, ip_gateway
    mov cx, 4
    rep movsb

    ; --- [BAGIAN 3: KIRIM KE HARDWARE NE2000] ---
    ; Paket ARP minimal 42 byte, tapi Ethernet butuh minimal 60-64 byte (Padding)
    mov cx, 60              ; Panjang paket
    call ne2000_transmit    ; Rutin kirim (Kita buat di bawah)

    popa
    ret

ne2000_transmit:
    ; CX = Panjang paket
    mov dx, 0x300           ; Command Register
    mov al, 0x22            ; Start, No DMA
    out dx, al

    ; Set Remote Start Address (RSAR0/1) ke alamat buffer kartu (misal 0x4000)
    mov dx, 0x308
    mov al, 0x00
    out dx, al
    mov dx, 0x309
    mov al, 0x40
    out dx, al

    ; Set Byte Count (RBCR0/1)
    mov ax, cx
    mov dx, 0x30A
    out dx, al
    mov al, ah
    mov dx, 0x30B
    out dx, al

    ; Jalankan Remote Write
    mov dx, 0x300
    mov al, 0x12
    out dx, al

    ; Kirim Data dari RAM ke Port 0x310
    mov si, packet_buffer
    mov dx, 0x310
.send_loop:
    lodsb
    out dx, al
    loop .send_loop

    ; Perintahkan Pengiriman (Transmit)
    mov dx, 0x300
    mov al, 0x26            ; Transmit Packet
    out dx, al
    ret


; ==========================================================
; [KEYBOARD DRIVER - FIXED]
; Hapus logika push/pop yang merusak register BX
; ==========================================================
kgetc:
    xor ah, ah          ; Set AH = 0 (Service 0: Read Key)
    int 0x16            ; Panggil BIOS
    ; Hasil: 
    ; AL = ASCII Character (Untuk teks)
    ; AH = Keyboard Scan Code (Untuk tombol panah/F1)
    ret

; --- CETAK DECIMAL (Sudah ada di kernel Anda) ---

; ==========================================================
; [UTILITY] String to Integer (ATOI)
; Input: SI = Pointer ke string (misal "123", 0)
; Output: AX = Nilai Integer (123)
; ==========================================================
string_to_int:
    push bx
    push cx
    push dx
    push si
    
    xor bx, bx      ; BX akan menampung hasil sementara
    xor cx, cx      ; Clear CX

.loop_atoi:
    lodsb           ; Ambil karakter dari [SI] ke AL
    cmp al, 0       ; Cek Null Terminator
    je .done_atoi
    cmp al, 13      ; Cek Enter (CR)
    je .done_atoi
    cmp al, 10      ; Cek Line Feed
    je .done_atoi
    
    cmp al, '0'     ; Validasi: Apakah di bawah '0'?
    jl .done_atoi
    cmp al, '9'     ; Validasi: Apakah di atas '9'?
    jg .done_atoi

    sub al, '0'     ; Ubah ASCII ke Angka ('5' -> 5)
    mov cl, al      ; Simpan digit di CL
    
    ; Rumus: Total = (Total * 10) + Digit Baru
    mov ax, bx      ; Pindahkan Total lama ke AX
    mov dx, 10
    mul dx          ; AX = AX * 10
    
    add ax, cx      ; Tambahkan digit baru
    mov bx, ax      ; Simpan kembali ke BX
    
    jmp .loop_atoi

.done_atoi:
    mov ax, bx      ; Hasil akhir ditaruh di AX
    pop si
    pop dx
    pop cx
    pop bx
    ret

; =================================================================
; [DATA SECTION]
; =================================================================

msg_welcome     db '    PaperOS v1.9.6 (---Floppy Non-Volatile and SECURITY Update---)', 13, 10, 
                db '________________________________________________________________________________', 13, 10, 0

msg_info        db 'WELCOME TO PaperOS System Environment', 13, 10, 0

; --- BAGIAN PENJELASAN RINCI (MOTD) ---
msg_motd_line   db '==================================================', 13, 10, 0

msg_motd_desc   db 'PaperOS adalah Sistem Operasi 16-bit Monolithic.', 13, 10
                db 'Dibuat dengan Assembly dan C.', 13, 10, 13, 10, 0

msg_motd_feat   db '[FITUR SISTEM]:', 13, 10
                db ' * Serial Mouse Bridge (Port 0x3F8/COM1)', 13, 10
                db ' * Audio PC Speaker Synthesis', 13, 10
                db ' * Hardware Info --volatile-- (CPU, RAM, FPU Detect)', 13, 10
                db ' * Shell Command Interpreter (CLI)', 13, 10, 13, 10, 0

msg_motd_guide  db '[PANDUAN PEMULA]:', 13, 10
                db ' 1. Ketik "ls" untuk melihat semua penyimpanan.', 13, 10
                db ' 2. Untuk Mouse: melihat output mouse di host.', 13, 10
                db ' 3. Ketik fastfetch: untuk melihat info sistem.', 13, 10, 
                db ' 4. Ketik hwinfo: untuk melihat info hardware.', 13, 10, 0

; --------------------------------------
prompt          db 'root@paperos:/# ', 0
newline         db 13, 10, 0
msg_unknown     db 'sh: command not found.', 13, 10, 0

cmd_beep        db 'do beep', 0
cmd_calc        db 'calc', 0
cmd_clear       db 'clear', 0
cmd_color       db 'color', 0
cmd_fastfetch   db 'fastfetch', 0
cmd_hwinfo      db 'hwinfo', 0
cmd_ls          db 'ls', 0
cmd_mouse       db 'mouse', 0
cmd_notes       db 'notes', 0
cmd_reboot      db 'reboot', 0
cmd_resetcolor  db 'resetcolor', 0
cmd_whoami      db 'whoami', 0
cmd_jam         db 'clock', 0
cmd_shutdown    db 'shutdown', 0
cmd_info        db 'info', 0



msg_root        db 'root (uid=0)', 13, 10, 0
msg_ls_header   db 'PERMISSIONS  SIZE   NAME', 13, 10, 0
msg_ls_files    db '-rwx------   2KB    kernel.bin', 13, 10, '-rw-r--r--   1KB    notes.txt', 13, 10, 'dr-xr-xr-x   ---    /dev (virtual)', 13, 10, 0
msg_reboot      db 'Rebooting system...', 0
msg_notes       db 'cat: notes.txt: PaperOS kini support Hardware Interrupts.', 13, 10, 0
msg_clock_run   db '[CLOCK RUNNING] Press Any Key to Stop', 13, 10, 0
msg_shutdown    db 'Shutting down system...', 13, 10, 0
msg_beeping     db 'Testing PC Speaker... (BEEP)', 13, 10, 0
msg_calc_demo   db 'Demo Math: 5 + 2 = ', 0
msg_color       db 'Warna Diganti! (Ketik "clear" jika belum berubah)', 13, 10, 0
msg_resetcolor  db 'Warna telah direset ke default', 13, 10, 0


; Variabel Game Tron (WAJIB ADA)

; Variabel GUI
brush_color db 15
cmd_gui     db 'gui', 0
msg_gui_end db 'Exiting Game... Back to Shell.', 13, 10, 0

; Tambahkan/Update baris ini di Data Section
msg_mouse_active_serial db 'Mode Serial Aktif. Jalankan program "bridge" di host Linux!', 13, 10, 0

msg_hw_title    db '--- HARDWARE DETECTED (Via INT 11h) ---', 13, 10, 0
msg_hw_fpu      db 'Floating Point Unit: ', 0
msg_hw_ram      db 'Conventional Memory: ', 0
msg_hw_mouse    db 'Mouse/Touchpad: ', 0
txt_yes         db 'Yes', 0
txt_no          db 'No', 0
txt_kb          db ' KB', 13, 10, 0

msg_mouse_title     db '--- MOUSE/TOUCHPAD INFORMATION ---', 13, 10, 0
msg_mouse_status    db 'Mouse driver status: ', 0
msg_mouse_active    db 'Mouse Aktif (PS/2). Klik untuk tes. [Enter] keluar.', 13, 10, 0
msg_mouse_none      db 'No mouse or touchpad found.', 13, 10, 0
txt_lclick          db '[KLIK-KIRI] ', 0
txt_rclick          db '[KLIK-KANAN] ', 0

ff_logo1 db '   _______       ', 0
ff_logo2 db '  |  ___  |      ', 0
ff_logo3 db '  |  ___  |      ', 0 
ff_logo4 db '  |_______|      ', 0
ff_logo5 db 13, 10, 0

ff_os      db 'OS: PaperOS v1.9.6', 13, 10, 0
ff_kernel  db 'Kernel: Monolithic (16-bit)', 13, 10, 0
ff_access  db 'Access: Direct Hardware (Ring 0)', 13, 10, 0
ff_audio   db 'Audio: PC Speaker (Port 61h)', 13, 10, 0
ff_cpu     db 'CPU: x86 Real Mode', 13, 10, 0
ff_mouse   db 'Input: Mouse/Touchpad and keyboard', 13, 10, 0

; [DATA SECTION - Insert at Bottom]

cmd_xmas        db 'christmas', 0 
; --- Xmas Data ---
; Update Pesan agar sesuai lagu
msg_xmas_art    db 13, 10
                db '      * ', 13, 10
                db '     /.\     Merry Christmas!', 13, 10
                db '    /.. \    Playing: Malam Kudus ...', 13, 10
                db '    /   \    ', 13, 10
                db '   /..   \   ', 13, 10
                db '   -------   ', 13, 10
                db '     | |     ', 13, 10, 0

; DATA MUSIK: O Holy Night (Key: C Major - Accurate Rhythm)
; Format: dw [Freq], [Durasi]
; Tempo: Adagio (Lambat dan Syahdu)

; DATA MUSIK: MALAM KUDUS (Silent Night)
; Nada Dasar: C Major (Pas untuk Speaker Laptop)
; Format: dw [Freq], [Durasi]

; =================================================================
; DATA MUSIK: MALAM KUDUS (FULL VERSION - CORRECTED)
; Lirik: Malam kudus... Bintang-Mu... Jurus'lamat... Ada datang... Kristus...
; =================================================================

music_holy_night:
    ; -----------------------------------------------------------
    ; BARIS 1: "Ma-lam ku-dus, su-nyi se-nyap"
    ; Notasi: 5 . 6 5 | 3 . . | 5 . 6 5 | 3 . .
    ; -----------------------------------------------------------
    
    ; "Ma-lam ku-dus"
    dw 392, 32  ; 5 (Sol) + Titik = 2 beat
    dw 440, 8   ; 6 (La)  - 1/2 beat
    dw 392, 12   ; 5 (Sol) - 1/2 beat
    dw 330, 48  ; 3 (Mi)  + 2 Titik = 3 beat (Panjang)

    dw 1, 4     ; Jeda Nafas

    ; "Su-nyi se-nyap"
    dw 392, 32  ; 5 (Sol)
    dw 440, 8   ; 6 (La)
    dw 392, 12   ; 5 (Sol)
    dw 330, 50  ; 3 (Mi)

    dw 1, 8     ; Jeda Antar Baris

    ; -----------------------------------------------------------
    ; BARIS 2: "Du-ni-a... ter-le-lap"
    ; Notasi: 2' . 2' 7 . . | 1' . 1' 5 . .
    ; -----------------------------------------------------------
    
    ; "Du - ni - a"
    dw 587, 32  ; 2' (Re Tinggi) + Titik
    dw 587, 16  ; 2' (Re Tinggi)
    dw 494, 48  ; 7  (Si) + 2 Titik

    dw 1, 4

    ; "Ter - le - lap"
    dw 523, 32  ; 1' (Do Tinggi) + Titik
    dw 523, 16  ; 1' (Do Tinggi)
    dw 392, 48  ; 5  (Sol) + 2 Titik

    dw 1, 8

    ; -----------------------------------------------------------
    ; BARIS 3: "Ha-nya du-a ber-ja-ga te-rus"
    ; Notasi: 6 . 6 1' . 7 6 | 5 . 6 5 3 . .
    ; -----------------------------------------------------------

    ; "Ha-nya du-a"
    dw 440, 32  ; 6 (La) + Titik
    dw 440, 16  ; 6 (La)
    dw 523, 24  ; 1' (Do Tinggi) + Titik (Ketukan agak unik disini)
    dw 494, 12  ; 7 (Si) Cepat
    dw 440, 12  ; 6 (La) Cepat

    ; "Ber-ja-ga te-rus"
    dw 392, 32  ; 5 (Sol)
    dw 440, 8   ; 6 (La)
    dw 392, 12  ; 5 (Sol)
    dw 330, 48  ; 3 (Mi) Panjang

    dw 1, 8

    ; -----------------------------------------------------------
    ; BARIS 4: "A-yah bun-da mes-ra dan ku-dus"
    ; Notasi: (Sama persis dengan Baris 3)
    ; -----------------------------------------------------------

    ; "A-yah bun-da mes-ra"
    dw 440, 32  ; 6
    dw 440, 16  ; 6
    dw 523, 24  ; 1'
    dw 494, 12  ; 7
    dw 440, 12  ; 6

    ; "Dan ku-dus"
    dw 392, 32  ; 5
    dw 440, 8   ; 6
    dw 392, 12   ; 5
    dw 330, 48  ; 3

    dw 1, 8

    ; -----------------------------------------------------------
    ; BARIS 5: "A-nak ti-dur te-nang..." (Part 1)
    ; Notasi: 2' . 2' 4' . 2' 7 | 1' . . 3' . .
    ; -----------------------------------------------------------

    ; "A-nak ti-dur" (Perhatikan ada Nada 4' / Fa Tinggi di gambar)
    dw 587, 32  ; 2' (Re Tinggi)
    dw 587, 16  ; 2' (Re Tinggi)
    dw 698, 24  ; 4' (Fa Tinggi)
    dw 587, 12  ; 2' (Re Tinggi)
    dw 494, 12  ; 7  (Si)

    ; "Te-nang..." (Slur panjang dari Do ke Mi)
    dw 523, 48  ; 1' (Do Tinggi) Panjang
    dw 659, 48  ; 3' (Mi Tinggi) Panjang

    dw 1, 8

    ; -----------------------------------------------------------
    ; BARIS 6: "A-nak ti-dur te-nang." (Ending)
    ; Notasi: 1' 5 3 5 . 4 2 | 1 . . 1 . .
    ; -----------------------------------------------------------

    ; "A - nak"
    dw 523, 16  ; 1' (Do Tinggi)
    dw 392, 16  ; 5  (Sol)
    dw 330, 16  ; 3  (Mi)
    
    ; "Ti - dur"
    dw 392, 24  ; 5 (Sol)
    dw 349, 12  ; 4 (Fa)
    dw 294, 12  ; 2 (Re)

    ; "Te - nang..." (Low Do)
    dw 262, 48  ; 1 (Do Tengah)
    dw 262, 48  ; 1 (Do Tengah) - Fade out

    ; Selesai
    dw 1, 20    ; Jeda penutup
    dw 0, 0     ; Stop

; =================================================================
; DATA MUSIK: DAISY BELL (CORRECTED SHEET VERSION)
; Ref: Sheet Music Image (Key: C Major, 3/4 Time)
; Waltz 
; =================================================================

cmd_daisy       db 'daisy', 0

msg_daisy_art   db 13, 10
                db '    [Daisy Bell]    ', 13, 10
                db '    Mode: Advanced Melody', 13, 10
                db '    Playing: Daisy Bell (Programmable Interval Timer)', 13, 10, 0

music_daisy:
    ; --- Bagian 1: RH:5 | g-----------e-----------c-| ---
    dw 784, 24  ; G5 (Panjang)
    dw 659, 24  ; E5
    dw 523, 24  ; C5

    ; --- Bagian 2: RH:4 | ----------g-----------a---| ---
    ; (Transisi ke nada tengah)
    dw 392, 12  ; G4
    dw 440, 12  ; A4

    ; --- Bagian 3: RH:5(c) & RH:4(b-a-g) ---
    ; "b-------a-----------g-----" dengan "c" diatasnya
    dw 494, 12  ; B4
    dw 523, 12  ; C5 (Nada tinggi nyempil)
    dw 440, 12  ; A4
    dw 392, 24  ; G4

    ; --- Bagian 4: RH:5 | ------------------d-------| ---
    dw 587, 36  ; D5 (Sangat Panjang)

    dw 1, 5     ; Jeda Nafas

    ; --- Bagian 5: RH:5 | ----g-----------e---------| ---
    dw 784, 24  ; G5
    dw 659, 24  ; E5

    ; --- Bagian 6: RH:5(c) & RH:4(a-b) ---
    dw 523, 12  ; C5
    dw 440, 12  ; A4
    dw 494, 12  ; B4
    dw 523, 12  ; C5

    ; --- Bagian 7: RH:5 | d-------e---d-------------| ---
    dw 587, 16  ; D5
    dw 659, 8   ; E5 (Cepat)
    dw 587, 24  ; D5

    ; --- Bagian 8: RH:5 | ------e---f---e---d---g---| ---
    ; (Ini bagian run/cepat: e-f-e-d-g)
    dw 659, 8   ; E5
    dw 698, 8   ; F5
    dw 659, 8   ; E5
    dw 587, 8   ; D5
    dw 784, 16  ; G5 (Puncak)

    ; --- Bagian 9: RH:5 | ----e---d---c-------------| ---
    dw 659, 12  ; E5
    dw 587, 12  ; D5
    dw 523, 24  ; C5

    ; --- Bagian 10: RH:5(d-e-c) & RH:4(a) ---
    dw 587, 12  ; D5
    dw 659, 12  ; E5
    dw 523, 12  ; C5
    dw 440, 12  ; A4

    ; --- Bagian 11: RH:5(c) & RH:4(a-g) ---
    dw 523, 12  ; C5
    dw 440, 12  ; A4
    dw 392, 24  ; G4

    ; --- Bagian 12: RH:5 | --c-------e---d-----------| ---
    dw 523, 12  ; C5
    dw 659, 12  ; E5
    dw 587, 24  ; D5

    ; --- Bagian 13: RH:5 | c-------e---d---e---f---g-| ---
    ; (Run naik ke atas: c-e-d-e-f-g)
    dw 523, 12  ; C5
    dw 659, 8   ; E5
    dw 587, 8   ; D5
    dw 659, 8   ; E5
    dw 698, 8   ; F5
    dw 784, 16  ; G5

    ; --- Bagian 14 (Ending): RH:5 | --e---c---d-----------c---| ---
    dw 659, 12  ; E5
    dw 523, 12  ; C5
    dw 587, 12  ; D5
    dw 523, 40  ; C5 (Closing Chord Root)

    dw 1, 20    ; Jeda Akhir
    dw 0, 0     ; STOP

; [DATA SECTION - Tambahkan di bawah cmd_daisy dll]

cmd_harta       db 'harta', 0

msg_harta_art   db 13, 10
                db '     .--.    APAKAH INI HARTA MU?', 13, 10
                db '   .|  | .   ...', 13, 10
                db '   |  _  |   IS THIS YOUR TREASURE?', 13, 10
                db '   | | | |   Playing: Kasih Ibu (SM Mochtar)', 13, 10
                db '   " " " "   ', 13, 10, 0

; =================================================================
; DATA MUSIK: KASIH IBU (Key: C Major)
; Transkripsi dari Not Angka Gambar
; Format: dw [Freq], [Durasi]
; =================================================================
music_kasih_ibu:
    ; --- BAR 1: Ka-sih i-bu ---
    ; | 3 . 2 3 | 1 . . 1 |
    dw 330, 24  ; 3 (Mi)
    dw 294, 12  ; 2 (Re)
    dw 330, 12  ; 3 (Mi)
    dw 262, 36  ; 1 (Do) Panjang
    dw 262, 12  ; 1 (Do) Ketukan ke-4 ("ke-")

    ; --- BAR 2: ke-pa-da be-ta ---
    ; | 1> . 6 1> | 5 . . 0 |
    dw 523, 24  ; 1> (Do Tinggi)
    dw 440, 12  ; 6  (La)
    dw 523, 12  ; 1> (Do Tinggi)
    dw 392, 24  ; 5  (Sol)
    dw 1, 24    ; 0  (Istirahat)

    ; --- BAR 3: Tak ter-hing-ga se-pan- ---
    ; | 6 . 5 4 | 3 . 1 2 |
    dw 440, 24  ; 6 (La)
    dw 392, 12  ; 5 (Sol)
    dw 349, 12  ; 4 (Fa)
    dw 330, 24  ; 3 (Mi)
    dw 262, 12  ; 1 (Do)
    dw 294, 12  ; 2 (Re)

    ; --- BAR 4: -jang ma-sa ---
    ; | 3 . 5 3 | 2 . . 0 |
    dw 330, 24  ; 3 (Mi)
    dw 392, 12  ; 5 (Sol)
    dw 330, 12  ; 3 (Mi)
    dw 294, 48  ; 2 (Re) Panjang...
    dw 1, 12    ; Jeda napas

    ; --- BAR 5: Ha-nya mem-be-ri ---
    ; | 3 3 . 2 3 | 1 . . 1 |
    dw 330, 12  ; 3 (Mi)
    dw 330, 12  ; 3 (Mi)
    dw 294, 12  ; 2 (Re)
    dw 330, 12  ; 3 (Mi)
    dw 262, 36  ; 1 (Do)
    dw 262, 12  ; 1 (Do) ("tak")

    ; --- BAR 6: tak ha-rap kem-ba-li ---
    ; | 1> 1> . 6 1> | 5 . . 0 |
    dw 523, 12  ; 1> (Do Tinggi)
    dw 523, 12  ; 1>
    dw 440, 12  ; 6  (La)
    dw 523, 12  ; 1>
    dw 392, 24  ; 5  (Sol)
    dw 1, 24    ; 0  (Istirahat)

    ; --- BAR 7: Ba-gai sang sur-ya ---
    ; | 6 6 . 5 4 | 3 . 1 2 |
    dw 440, 12  ; 6 (La)
    dw 440, 12  ; 6
    dw 392, 12  ; 5 (Sol)
    dw 349, 12  ; 4 (Fa)
    dw 330, 24  ; 3 (Mi)
    dw 262, 12  ; 1 (Do)
    dw 294, 12  ; 2 (Re)

    ; --- BAR 8: me-nyi-na-ri du-ni-a ---
    ; | 3 3 . 1 2 | 1 . . 0 |
    dw 330, 12  ; 3 (Mi)
    dw 330, 12  ; 3
    dw 262, 12  ; 1 (Do)
    dw 294, 12  ; 2 (Re)
    dw 262, 48  ; 1 (Do) Panjang (Ending)
    
    dw 1, 24    ; Jeda Akhir
    dw 0, 0     ; STOP
; =================================================================

msg_login_prompt    db 'Password Required: ', 0
msg_access_denied   db 'ACCESS DENIED! Invalid Password.', 13, 10, 0
msg_access_granted  db 'ACCESS GRANTED. Welcome, Administrator.', 13, 10, 0
secret_pass         db 'paper', 0   ; <--- Ganti password di sini jika mau

; Buffer khusus untuk menampung ketikan password
pass_buffer times 16 db 0

; [MASUKKAN DI DATA SECTION]

; Nama Command

; =================================================================
; [DISK DRIVER - RAW SECTOR I/O] (FIXED FINAL)
; Target: Cylinder 0, HEAD 1, Sector 1 (Sisi balik disket)
; Aman dari Kernel yang ada di Head 0
; =================================================================

driver_disk_write_legacy:
    ; Input: BX = Lokasi data di RAM
    mov ah, 0x03        ; Fungsi Write
    mov al, 1           ; 1 Sektor
    mov ch, 0           ; Cylinder 0
    mov cl, 50           ; Sektor 1 (Valid: 1-18)
    mov dh, 0          ; HEAD 1 (PENTING: Pindah ke sisi balik)
    mov dl, [boot_drive]
    int 0x13
    jc disk_io_error_legacy
    ret

driver_disk_read_legacy:
    ; Input: BX = Lokasi RAM
    mov ah, 0x02        ; Fungsi Read
    mov al, 1
    mov ch, 0
    mov cl, 50           ; Sektor 1 (HARUS SAMA DENGAN WRITE)
    mov dh, 0           ; HEAD 1 (HARUS SAMA DENGAN WRITE)
    mov dl, [boot_drive]
    int 0x13
    jc disk_io_error_legacy
    ret

disk_io_error_legacy:
    mov si, msg_disk_err
    call kprint
    stc                 ; Set Error Flag
    ret


cmd_write_old db 'write_old', 0
cmd_read_old  db 'read_old', 0

cmd_write       db 'write', 0
cmd_read        db 'read', 0

; =================================================================
; [DISK DRIVER - DYNAMIC SECTOR]
; Input: CL = Nomor Sektor Target (1-18)
; Target Tetap: Cylinder 0, HEAD 1 (Aman dari Kernel)
; =================================================================

driver_disk_write:
    ; Input: BX = Lokasi data RAM, CL = Nomor Sektor
    mov ah, 0x03        ; Fungsi Write
    mov al, 1           ; 1 Sektor
    mov ch, 0           ; Cylinder 0
    ; CL sudah diisi oleh pemanggil (caller)
    mov dh, 1           ; HEAD 1
    mov dl, [boot_drive]
    int 0x13
    jc disk_io_error
    ret

driver_disk_read:
    ; Input: BX = Lokasi RAM, CL = Nomor Sektor
    mov ah, 0x02        ; Fungsi Read
    mov al, 1
    mov ch, 0
    ; CL sudah diisi oleh pemanggil
    mov dh, 1           ; HEAD 1
    mov dl, [boot_drive]
    int 0x13
    jc disk_io_error
    ret

disk_io_error:
    mov si, msg_disk_err
    call kprint
    stc
    ret




; [Update Pesan Storage]
msg_saving      db 'Writing to Disk (Sector 10)... ', 0
msg_saved_disk  db 'OK. Data Saved Permanently!', 13, 10, 0
msg_reading     db 'Reading from Disk...', 13, 10, 0
msg_disk_err    db '[ERROR] Disk I/O Failed!', 13, 10, 0

; Interface Messages
msg_editor_top  db '--- PaperWrite v0.3 (Doc SECURITY Update) ---', 13, 10
                db '--- WARNING YOU SHALL INPUT THE CORRECT PASSWORD (ONLY 3 TIMES) ---', 13, 10
                db '[KETIK APA SAJA. TEKAN "ESC" UNTUK SIMPAN & KELUAR]', 13, 10
                db '---------------------------------------------------', 13, 10, 0

msg_saved       db 'File disimpan ke RAM! Ketik "read" untuk membacanya.', 13, 10, 0
msg_read_title  db '--- Membaca dari Floppy ---', 13, 10, 0
msg_empty       db '(Buffer Kosong. Ketik "write" dulu)', 13, 10, 0

; Command Names
cmd_read1   db 'read1', 0
cmd_write1  db 'write1', 0
cmd_read2   db 'read2', 0
cmd_write2  db 'write2', 0
cmd_read3   db 'read3', 0
cmd_write3  db 'write3', 0



; Tambahkan di bagian DATA:
cmd_count_old      db 'count_old', 0
msg_count_old_info db 'Menghitung statistik Kertas Lama (Sector 50)...', 13, 10, 0


cmd_count       db 'count', 0
msg_count_res   db 'Total Karakter: ', 0
msg_count_info  db 'Menghitung statistik Slot 1...', 13, 10, 0
margin_line     db ' | ', 0
cmd_count1  db 'count1', 0
cmd_count2  db 'count2', 0
cmd_count3  db 'count3', 0

cmd_find_old    db 'find_old', 0
cmd_find1       db 'find1', 0
cmd_find2       db 'find2', 0
cmd_find3       db 'find3', 0
msg_find_p      db 'Cari kata: ', 0
msg_found       db 13, 10, '[OK] Kata ditemukan!', 13, 10, 0
msg_not_found   db 13, 10, '[!!] Kata tidak ada.', 13, 10, 0
; find_buffer     times 32 db 0 ; Buffer untuk kata yang dicari [old]


; =================================================================
; [SECURITY & VAULT]
; =================================================================

; Pesan Prompts
cmd_lock1   db 'lock1', 0
cmd_lock2   db 'lock2', 0
cmd_lock3   db 'lock3', 0
cmd_lock_old db 'lock_old', 0

cmd_unlock1       db 'unlock1', 0
cmd_unlock2       db 'unlock2', 0
cmd_unlock3       db 'unlock3', 0
cmd_unlock_old     db 'unlock_old', 0

msg_unlock_success db 13, 10, '[OK] Segel dibuka! Kertas kini bebas diakses.', 13, 10, 0
msg_already_open    db 13, 10, '[!] Kertas ini memang tidak disegel.', 13, 10, 0

msg_new_pass      db 13, 10, 'Buat Kunci Segel (Max 8 Karakter): ', 0
msg_lock_success  db 13, 10, '[OK] Kertas berhasil disegel dengan kunci baru!', 13, 10, 0
msg_enter_pass    db 13, 10, 'Kertas ini tersegel. Masukkan kunci: ', 0
msg_wrong_pass    db 13, 10, '[!!] Kunci salah! Jangan mencoba membobol...', 13, 10, 0

msg_lock_exists db 13, 10, '[!] Slot ini sudah terkunci.', 13, 10, 0
msg_ask_change  db 'Apakah Anda ingin mengganti sandi Anda? [y/N]: ', 0
msg_cancel      db 13, 10, '[!] Perubahan dibatalkan oleh user.', 13, 10, 0

cmd_edit1        db 'edit1', 0
cmd_edit2        db 'edit2', 0
cmd_edit3        db 'edit3', 0

msg_editor_header db '--- PAPEREDIT v1.0 (Tekan ESC untuk Simpan) ---', 13, 10, 0
msg_editor_saved  db 13, 10, '[OK] Dokumen telah diperbarui di Vault.', 13, 10, 0

; Pesan Self-Destruct
msg_wiping        db 13, 10, '[BAHAYA] Terlalu banyak kegagalan! Kertas mulai terbakar...', 13, 10, 0
msg_wiped_success db 13, 10, '[BERSIH] Data telah dihancurkan sepenuhnya.', 13, 10, 0

; Buffers
; =================================================================
; [SAFE DATA STORAGE]
; =================================================================
target_sector     db 0             ; Pindahkan ke ATAS buffer
boot_drive        db 0             ; Kumpulkan variabel sistem disini

; Buffers (Letakkan di paling bawah agar kalau meluap tidak kena variabel penting)
temp_pass_buffer  times 64 db 0    ; Perbesar jadi 64 byte (Sesuai limit kinput)
find_buffer       times 64 db 0
; vault_buffer1    times 512 db 0   ; Buffer Vault Slot 1
; vault_buffer2    times 512 db 0   ; Buffer Vault Slot 2
; vault_buffer3    times 512 db 0   ; Buffer Vault Slot 3
; vault_lock1      times 9 db 0     ; Kunci Vault Slot 1 (max 8 char + null)
; vault_lock2      times 9 db 0     ; Kunci Vault Slot 2
; vault_lock3      times 9 db 0     ; Kunci Vault Slot 3

; [METADATA STRINGS]
cmd_rename      db 'rename', 0
cmd_help        db 'help', 0

msg_rename_ask  db 'Pilih Slot untuk diganti namanya (1/2/3): ', 0
msg_rename_input db 'Nama Baru (Max 12 Huruf): ', 0
msg_rename_done db '[OK] Nama File Berhasil Disimpan.', 13, 10, 0

msg_ls_header_new db 'ID     STATUS      FILENAME', 13, 10
                  db '----------------------------------', 13, 10, 0

txt_slot1       db '1      ', 0
txt_slot2       db '2      ', 0
txt_slot3       db '3      ', 0
txt_open        db '[OPEN]      ', 0
txt_locked      db '[LOCKED]    ', 0
txt_untitled    db '(no name)', 0

msg_help_title  db '--- PAPEROS HELP MENU ---', 13, 10, 0
msg_help_list1  db 'FILE: ls, rename, edit[1-3], read[1-3], wipe[1-3]', 13, 10, 0
msg_help_list2  db 'SEC : lock[1-3], unlock[1-3]', 13, 10, 0
msg_help_list3  db 'SYS : calc, info, clear, reboot, shutdown', 13, 10, 0

; Calc Messages
msg_calc_title db '--- PaperCalc v3.0 (1-Digit Adder) ---', 13, 10, 0
msg_input1     db 'Input A: ', 0
msg_input2     db 13, 10, 'Input B: ', 0
msg_result     db 13, 10, 'Result : ', 0

; --- DATA CALCULATOR v3.0 ---
calc_op     db 0    ; Menyimpan operator (+ - * /)
calc_a      db 0    ; Angka pertama
calc_b      db 0    ; Angka kedua
calc_rem    db 0    ; Sisa bagi

msg_calc_menu db 'Pilih: [+] [-] [*] [/] : ', 0
msg_rem       db 'Sisa: ', 0
msg_err_div   db 13, 10, 'Error: Bagi Nol!', 13, 10, 0

; Data Calculator v4.0
calc_a_16   dw 0        ; Define Word (2 byte) untuk angka besar
calc_b_16   dw 0
calc_rem_16 dw 0
msg_calc_op db 'Operator [+ - * /]: ', 0

; =================================================================
; [NETWORK CONFIGURATION - v1.9.6]
; =================================================================

; Alamat IP PaperOS (Misal: 192.168.1.50)
ip_local        db 192, 168, 1, 50
ip_gateway      db 192, 168, 1, 1  ; IP Router/Modem

; Alamat MAC (6 byte) - QEMU default: 52:54:00:12:34:56
mac_local       db 0x52, 0x54, 0x00, 0x12, 0x34, 0x56

; Buffer untuk paket yang akan dikirim (Max Ethernet MTU: 1500 byte)
packet_buffer   times 1500 db 0

cmd_ping        db 'ping', 0
msg_ping_start  db 'Pinging gateway...', 13, 10, 0

msg_net_probing db 'Searching for NE2000 NIC at 0x300...', 13, 10, 0
msg_net_found   db '[OK] Ethernet Card detected! Ready for v1.9.6.', 13, 10, 0
msg_net_err     db '[!!] Network Card not found. Check QEMU parameters.', 13, 10, 0

cmd_netinfo       db 'netinfo', 0
msg_net_mac_title db 'Hardware MAC Address: ', 0

; --- Ethernet Types ---
ETHTYPE_ARP     dw 0x0608       ; Big-endian (0x0806)
ETHTYPE_IP      dw 0x0008       ; Big-endian (0x0800)

; --- ARP OpCodes ---
ARP_OP_REQUEST  dw 0x0100       ; Request (0x0001)
ARP_OP_REPLY    dw 0x0200       ; Reply (0x0002)

cmd_arp_test     db 'arp_test', 0
msg_arp_sending  db 'Menyusun paket ARP Request...', 13, 10, 0
msg_arp_done     db '[OK] Paket telah dikirim ke Gateway!', 13, 10, 0

cmd_desktop_str db 'desktop', 0
gui_state db 0   ; 0 = File Tertutup, 1 = File Terbuka

; =================================================================
; [PAPERSUDOKU DATA]
; 0 = Kosong. Angka lain = Soal.
; Puzzle Sederhana (Easy)
; =================================================================

cmd_sudoku_str db 'sudoku', 0
msg_sudoku_win db 'SUDOKU SOLVED! GREAT JOB!', 13, 10, 0

; Papan yang akan berubah-ubah saat user mengetik
sudoku_board:
    db 5,3,0, 0,7,0, 0,0,0
    db 6,0,0, 1,9,5, 0,0,0
    db 0,9,8, 0,0,0, 0,6,0
    
    db 8,0,0, 0,6,0, 0,0,3
    db 4,0,0, 8,0,3, 0,0,1
    db 7,0,0, 0,2,0, 0,0,6
    
    db 0,6,0, 0,0,0, 2,8,0
    db 0,0,0, 4,1,9, 0,0,5
    db 0,0,0, 0,8,0, 0,7,9

; Papan Kunci (Copy dari atas) untuk mencegah user menimpa soal
sudoku_lock:
    db 5,3,0, 0,7,0, 0,0,0
    db 6,0,0, 1,9,5, 0,0,0
    db 0,9,8, 0,0,0, 0,6,0
    db 8,0,0, 0,6,0, 0,0,3
    db 4,0,0, 8,0,3, 0,0,1
    db 7,0,0, 0,2,0, 0,0,6
    db 0,6,0, 0,0,0, 2,8,0
    db 0,0,0, 4,1,9, 0,0,5
    db 0,0,0, 0,8,0, 0,7,9

sudoku_cursor_idx dw 0  ; Posisi kursor (0-80)



; BUFFER PENYIMPANAN (2 Kilobyte)
; Ini adalah "kertas" virtual kita. Data akan hilang jika restart.
text_buffer     times 2048 db 0
                times 16 db 0

; GUI (pengambilan warna 256)
color_attr db 0x07
; JANGAN PERNAH DIUBAH!!!! (64 bytes)
buffer times 64 db 0

;Re-build command
; qemu-system-x86_64 \
;  -drive format=raw,file=paperos.img \
; -audiodev pa,id=snd0 \
;-machine pcspk-audiodev=snd0 \
;-serial tcp:127.0.0.1:4444,server,nowait

; qemu-system-x86_64  -drive format=raw,file=paperos.img -audiodev pa,id=snd0 -machine pcspk-audiodev=snd0 -serial tcp:127.0.0.1:4444,server,nowait
