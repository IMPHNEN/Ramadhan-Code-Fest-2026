# V4 Assembly Project (Windows 64-bit)

## What is this?

This is a simple 64-bit Assembly program for Windows.

The program:

- Creates random numbers using your CPU
- Stores 16 numbers (64-bit each)
- Mixes the numbers many times
- Prints the final result in HEX format

Every time you run the program, the output will be different.

---

## What does this program really do?

Think about this like a "number mixer".

Step by step:

1. It gets random value from your CPU.
2. It fills 16 slots with numbers.
3. It runs 8 rounds of mixing:
   - Change the numbers (sub_layer)
   - Mix numbers together (mix_layer)
   - Change position of numbers (shift_layer)
4. It converts the numbers into HEX text.
5. It prints the result on screen.

Example output:

```
046510AD40A66C49
E346226AC2C4F50C
9C091910505AFA3D
...
```

You will see 16 lines.
Each line is one 64-bit number in HEX.

If you run again, the numbers will change.

---

## What do you need?

You need:

- Windows 64-bit
- NASM (assembler)
- MinGW-w64 (for linking)

---

## How to install tools

### Install NASM

After install, open Command Prompt and type:

```
nasm -v
```

If version shows, NASM is installed.

---

### Install MinGW-w64

After install, test:

```
gcc --version
```

If version shows, it works.

---

## How to build the program

Make sure your file name is:

```
v4.asm
```

Open Command Prompt inside the folder.

### Step 1: Assemble

```
nasm -f win64 v4.asm -o v4.obj
```

### Step 2: Link

```
gcc v4.obj -o v4.exe -lkernel32
```

If no error, build is successful.

---

## How to run

In Command Prompt:

```
v4.exe
```

You will see 16 lines of HEX numbers.

Run again:

```
v4.exe
```

The numbers will be different.

---

## Simple explanation of main parts

_S  
Main storage of 16 numbers.

_T  
Temporary storage.

_OB  
Buffer to store output text.

sub_layer  
Changes each number using math.

mix_layer  
Mixes numbers together.

shift_layer  
Moves numbers to new positions.

xtime64  
Special math operation used in mixing.

---

## Important note

This is not a real encryption program.

This is a learning project to practice:

- Assembly programming
- 64 bit math
- Bit operations
- Windows API usage
- Burn your brain

---

## Author

dewaxyz
