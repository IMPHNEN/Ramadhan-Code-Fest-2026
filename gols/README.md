# gols

`gols` adalah implementasi sederhana dari command `ls` Unix yang ditulis menggunakan bahasa Go.

Entahlah.

## Features

- List file dalam directory
- Support flag `-a` untuk menampilkan hidden files
- Support flag `-l` untuk long format listing
- Bisa membaca directory tertentu

## Usage

Basic:
```bash
./gols
```

Show hidden files:
```bash
./gols -a
```

Long listing format:
```bash
./gols -l
```

Combine flags:
```bash
./gols -l -a
```

List specific directory:
```bash
./gols -l /path/to/dir
```

Example Output
```bash
-rw-r--r--   1 user  staff   1234 Mar 10 14:22 main.go
drwxr-xr-x   3 user  staff    96 Mar 10 14:20 cmd
-rw-r--r--   1 user  staff   542 Mar 10 14:18 README.md
```

---
