section .data
    device db "/dev/input/event2", 0
    newline db 0xa

section .bss
    fd resq 1
    event resb 24
    ; Buffer untuk output: "Event: type 123, code 456, value 789\n"
    output resb 50

section .text
    global _start

_start:
    ; open
    mov rax, 2
    mov rdi, device
    mov rsi, 0
    syscall
    cmp rax, 0
    jl exit
    mov [fd], rax

event_loop:
    ; read event
    mov rax, 0
    mov rdi, [fd]
    mov rsi, event
    mov rdx, 24
    syscall
    cmp rax, 24
    jne exit

    ; Sekarang kita akan memformat output
    ; Event structure (24 bytes):
    ;   timeval (16 bytes) - kita abaikan
    ;   type (2 bytes)
    ;   code (2 bytes)
    ;   value (4 bytes)

    ; Load data event
    movzx rax, word [event + 16]   ; type (2 bytes)
    movzx rbx, word [event + 18]   ; code (2 bytes)
    mov ecx, dword [event + 20]    ; value (4 bytes)

    ; Siapkan buffer output
    mov rdi, output
    mov rsi, rax        ; type
    mov rdx, rbx        ; code
    mov r8, rcx         ; value
    call format_event

    ; Hitung panjang string yang dihasilkan
    mov rsi, output
    call strlen
    mov rdx, rax        ; panjang string

    ; Tampilkan string
    mov rax, 1
    mov rdi, 1
    mov rsi, output
    syscall

    jmp event_loop

; Fungsi: format_event(rdi: buffer, rsi: type, rdx: code, r8: value)
; Menulis string dalam format: "Event: type %d, code %d, value %d\n"
format_event:
    push rbp
    mov rbp, rsp
    ; Simpan argumen
    mov [rbp-8], rdi   ; buffer
    mov [rbp-16], rsi  ; type
    mov [rbp-24], rdx  ; code
    mov [rbp-32], r8   ; value

    ; Tulis bagian awal
    mov rdi, [rbp-8]
    mov rsi, prefix
    call strcpy
    add rdi, prefix_len   ; majukan pointer buffer

    ; Tulis type
    mov rax, [rbp-16]
    call int_to_string
    ; rax = panjang string yang ditulis, rbx = pointer ke akhir string
    mov rdi, rbx          ; lanjutkan dari sini

    ; Tulis bagian tengah
    mov rsi, middle
    call strcpy
    add rdi, middle_len

    ; Tulis code
    mov rax, [rbp-24]
    call int_to_string
    mov rdi, rbx

    ; Tulis bagian akhir
    mov rsi, suffix
    call strcpy
    add rdi, suffix_len

    ; Tulis value
    mov rax, [rbp-32]
    call int_to_string
    mov rdi, rbx

    ; Tulis newline
    mov byte [rdi], 0xa
    inc rdi
    mov byte [rdi], 0   ; null terminator (tidak wajib untuk write, tapi baik untuk string C)

    pop rbp
    ret

; Fungsi: int_to_string(rax: integer) -> rax: panjang, rbx: pointer ke akhir string
; Menulis integer di rax ke buffer di rdi, dan mengembalikan panjang dan pointer ke akhir.
int_to_string:
    push rbp
    mov rbp, rsp
    sub rsp, 32          ; untuk menyimpan digit sementara

    mov rbx, rdi         ; simpan pointer awal
    mov rcx, 0           ; hitung digit
    mov rdi, 10          ; pembagi

    ; Tangani angka 0 khusus
    cmp rax, 0
    jne .convert
    mov byte [rbx], '0'
    inc rbx
    mov rax, 1
    mov [rbp-8], rbx     ; simpan pointer akhir
    jmp .done

.convert:
    ; Pisahkan digit
.digit_loop:
    xor rdx, rdx
    div rdi              ; rax = rax/10, rdx = rax % 10
    add dl, '0'
    mov [rsp+rcx], dl    ; simpan digit (dari yang paling belakang)
    inc rcx
    cmp rax, 0
    jne .digit_loop

    ; Sekarang kita memiliki digit dalam urutan terbalik di stack
    mov rax, rcx         ; panjang
    ; Salin digit ke buffer
.reverse:
    dec rcx
    mov dl, [rsp+rcx]
    mov [rbx], dl
    inc rbx
    cmp rcx, 0
    jg .reverse

    mov [rbp-8], rbx     ; simpan pointer akhir

.done:
    mov rax, [rbp-8]
    sub rax, rdi         ; panjang = akhir - awal
    mov rbx, [rbp-8]     ; pointer akhir
    leave
    ret

; Fungsi: strcpy(rdi: dest, rsi: src) -> rdi: dest + panjang
strcpy:
    push rbp
    mov rbp, rsp
.loop:
    lodsb
    stosb
    test al, al
    jnz .loop
    dec rdi              ; karena null terminator tidak dihitung
    pop rbp
    ret

; Fungsi: strlen(rsi: string) -> rax: panjang
strlen:
    push rbp
    mov rbp, rsp
    xor rax, rax
.loop:
    cmp byte [rsi+rax], 0
    je .done
    inc rax
    jmp .loop
.done:
    pop rbp
    ret

exit:
    ; close file descriptor
    move_down rax, 3
    mov rax, 3
    mov rdi, [fd]
    syscall

    ; exit
    mov rax, 60
    xor rdi, rdi
    syscall

section .data
prefix db "Event: type "
prefix_len equ $ - prefix
middle db ", code "
middle_len equ $ - middle
suffix db ", value "
suffix_len equ $ - suffix
