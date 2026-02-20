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
    
    ; Print welcome
    mov si, msg_welcome
    call print
    
    ; Infinite loop
    jmp $

print:
    lodsb
    or al, al
    jz .done
    mov ah, 0x0E
    int 0x10
    jmp print
.done:
    ret

msg_welcome: db 'PaperOS v1.8 - Boot Success!', 13, 10, 0

; Padding
times 2048-($-$$) db 0
