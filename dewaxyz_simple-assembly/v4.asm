bits 64
default rel

extern GetStdHandle
extern WriteFile
extern ExitProcess

global main

section .data
align 64
_S   times 16 dq 0
_T   times 16 dq 0
_OB  times 272 db 0
_HL  db "0123456789ABCDEF"
_SW  db 0,5,10,15, 4,9,14,3, 8,13,2,7, 12,1,6,11

section .text

xtime64:
    mov  rbx, rax
    shr  rbx, 63
    neg  rbx
    and  rbx, 0x1B
    add  rax, rax
    xor  rax, rbx
    ret

subword:
    mov  rbx, rax
    shr  rbx, 17
    xor  rax, rbx
    mov  rbx, 0xd2a98b26625eee7b
    imul rax, rbx
    mov  rbx, rax
    shr  rbx, 23
    xor  rax, rbx
    mov  rbx, 0x9e3779b97f4a7c15
    imul rax, rbx
    mov  rbx, rax
    shr  rbx, 31
    xor  rax, rbx
    ret

sub_layer:
    push rbp
    mov  rbp, rsp
    push r12
    xor  r12, r12
.L0:
    cmp  r12, 16
    jge  .D0
    mov  rax, [_S + r12*8]
    call subword
    mov  [_S + r12*8], rax
    inc  r12
    jmp  .L0
.D0:
    pop  r12
    pop  rbp
    ret

mixcol4:
    push rbp
    mov  rbp, rsp
    push r12
    push r13
    push r14
    push r15
    push rbx
    mov  r12, [rdi]
    mov  r13, [rdi+8]
    mov  r14, [rdi+16]
    mov  r15, [rdi+24]
    mov  rax, r12
    xor  rax, r13
    xor  rax, r14
    xor  rax, r15
    mov  rbx, rax
    mov  rax, r12
    xor  rax, r13
    call xtime64
    xor  r12, rax
    xor  r12, rbx
    mov  rax, r13
    xor  rax, r14
    call xtime64
    xor  r13, rax
    xor  r13, rbx
    mov  rax, r14
    xor  rax, r15
    call xtime64
    xor  r14, rax
    xor  r14, rbx
    mov  rax, r15
    xor  rax, [rdi]
    call xtime64
    xor  r15, rax
    xor  r15, rbx
    mov  [rdi],    r12
    mov  [rdi+8],  r13
    mov  [rdi+16], r14
    mov  [rdi+24], r15
    pop  rbx
    pop  r15
    pop  r14
    pop  r13
    pop  r12
    pop  rbp
    ret

mix_layer:
    push rbp
    mov  rbp, rsp
    push r12
    lea  r12, [_S]
    mov  rdi, r12
    call mixcol4
    lea  rdi, [_S+32]
    call mixcol4
    lea  rdi, [_S+64]
    call mixcol4
    lea  rdi, [_S+96]
    call mixcol4
    pop  r12
    pop  rbp
    ret

shift_layer:
    push rbp
    mov  rbp, rsp
    push r12
    push r13
    lea  r12, [_S]
    lea  r13, [_T]
    lea  rsi, [_SW]
    xor  rcx, rcx
.L0:
    cmp  rcx, 16
    jge  .D0
    movzx rax, byte [rsi + rcx]
    mov  rdx, [r12 + rax*8]
    mov  [r13 + rcx*8], rdx
    inc  rcx
    jmp  .L0
.D0:
    xor  rcx, rcx
.L1:
    cmp  rcx, 16
    jge  .D1
    mov  rax, [r13 + rcx*8]
    mov  [r12 + rcx*8], rax
    inc  rcx
    jmp  .L1
.D1:
    pop  r13
    pop  r12
    pop  rbp
    ret

main:
    ; Windows Shadow Space
    sub  rsp, 40
    and  rsp, ~0xF

    rdrand rax
    jc   .r0
    rdtsc
    shl  rdx, 32
    or   rax, rdx
.r0:
    mov  [_S], rax

    xor  r8, r8
.sl:
    cmp  r8, 15
    jge  .run
    rdrand rax
    jc   .rs
    rdtsc
    shl  rdx, 32
    or   rax, rdx
    cpuid
    shl  rdx, 32
    or   rax, rdx
.rs:
    mov  rbx, [_S + r8*8]
    xor  rax, rbx
    mov  rcx, 0x9e3779b97f4a7c15
    imul rax, rcx
    mov  [_S + r8*8 + 8], rax
    inc  r8
    jmp  .sl

.run:
    mov  r15d, 8
.rnd:
    call sub_layer
    call mix_layer
    call shift_layer
    dec  r15d
    jnz  .rnd

    lea  rbx, [_OB]
    xor  r12, r12
.em:
    cmp  r12, 16
    jge  .fl
    mov  r13, [_S + r12*8]
    mov  r14d, 15
.nb:
    test r14d, r14d
    js   .el
    mov  ecx, r14d
    shl  ecx, 2
    mov  rax, r13
    shr  rax, cl
    and  rax, 0xF
    lea  rcx, [_HL]
    movzx eax, byte [rcx + rax]
    mov  [rbx], al
    inc  rbx
    dec  r14d
    jmp  .nb
.el:
    mov  byte [rbx], 0x0A
    inc  rbx
    inc  r12
    jmp  .em

.fl:
    ; Get Stdout Handle
    mov  rcx, -11
    call GetStdHandle
    mov  rdi, rax

    ; WriteFile
    mov  rcx, rdi
    lea  rdx, [_OB]
    lea  r8, [rbx]
    sub  r8, rdx
    xor  r9, r9
    push 0
    call WriteFile
    add  rsp, 8

    ; ExitProcess
    xor  rcx, rcx
    call ExitProcess