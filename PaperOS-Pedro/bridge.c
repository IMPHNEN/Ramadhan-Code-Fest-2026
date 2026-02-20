#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/socket.h>
#include <arpa/inet.h>

#define MOUSE_DEV "/dev/input/mice"
#define QEMU_PORT 4444
#define QEMU_IP "127.0.0.1"

int main() {
    int mouse_fd, sock_fd;
    struct sockaddr_in server_addr;
    unsigned char data[3]; // Paket mouse standar PS/2 (3 bytes)

    // 1. Buka Device Mouse (Butuh sudo/root)
    printf("[*] Membuka %s...\n", MOUSE_DEV);
    mouse_fd = open(MOUSE_DEV, O_RDONLY);
    if (mouse_fd == -1) {
        perror("[-] Gagal membuka mouse (apakah anda menggunakan sudo?)");
        return 1;
    }

    // 2. Koneksi ke QEMU Serial Socket
    printf("[*] Menghubungkan ke PaperOS di Port %d...\n", QEMU_PORT);
    sock_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (sock_fd == -1) {
        perror("[-] Gagal membuat socket");
        return 1;
    }

    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(QEMU_PORT);
    server_addr.sin_addr.s_addr = inet_addr(QEMU_IP);

    if (connect(sock_fd, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        perror("[-] Gagal connect ke QEMU. Pastikan QEMU sudah jalan!");
        return 1;
    }
    printf("[+] TERHUBUNG! Klik mouse untuk mengirim sinyal ke PaperOS.\n");

    // 3. Loop Membaca Data Mouse
    int left_pressed = 0;
    int right_pressed = 0;

    while (1) {
        if (read(mouse_fd, data, sizeof(data)) > 0) {
            // Byte 0 dari /dev/input/mice formatnya:
            // Bit 0 = Left Click
            // Bit 1 = Right Click
            
            int l_click = data[0] & 0x1;
            int r_click = data[0] & 0x2;

            // Deteksi Klik Kiri (Hanya kirim saat ditekan pertama kali)
            if (l_click && !left_pressed) {
                printf("-> Left Click\n");
                send(sock_fd, "L", 1, 0);
                left_pressed = 1;
            } else if (!l_click) {
                left_pressed = 0;
            }

            // Deteksi Klik Kanan
            if (r_click && !right_pressed) {
                printf("-> Right Click\n");
                send(sock_fd, "R", 1, 0);
                right_pressed = 1;
            } else if (!r_click) {
                right_pressed = 0;
            }
        }
    }

    close(sock_fd);
    close(mouse_fd);
    return 0;
}