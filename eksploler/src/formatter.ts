import { FileInfo, DirectoryStats } from './types';

export class OutputFormatter {
  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private getTypeIcon(type: FileInfo['type']): string {
    switch (type) {
      case 'directory': return '📁';
      case 'symlink': return '🔗';
      case 'file': return '📄';
      default: return '❓';
    }
  }

  formatLong(file: FileInfo): string {
    const date = this.formatDate(file.modified);
    const size = file.isDirectory ? this.formatSize(0) : this.formatSize(file.size);
    const icon = this.getTypeIcon(file.type);
    const name = file.isHidden ? `\x1b[90m${file.name}\x1b[0m` : file.name;
    
    return `${file.permissions} ${size.padStart(10)} ${date} ${icon} ${name}`;
  }

  formatSimple(file: FileInfo): string {
    const icon = this.getTypeIcon(file.type);
    const name = file.isHidden ? `\x1b[90m${file.name}\x1b[0m` : file.name;
    
    if (file.isDirectory) {
      return `\x1b[34m${icon} ${name}/\x1b[0m`;
    }
    return `${icon} ${name}`;
  }

  formatStats(stats: DirectoryStats): string {
    return `
\x1b[1mStatistik Direktori:\x1b[0m
  Total File: \x1b[32m${stats.totalFiles}\x1b[0m
  Total Direktori: \x1b[34m${stats.totalDirectories}\x1b[0m
  Total Ukuran: \x1b[36m${this.formatSize(stats.totalSize)}\x1b[0m
  File Tersembunyi: \x1b[90m${stats.hiddenFiles}\x1b[0m
`;
  }

  formatHeader(title: string): string {
    return `\n\x1b[1;36m=== ${title} ===\x1b[0m\n`;
  }

  formatError(message: string): string {
    return `\x1b[31mError: ${message}\x1b[0m`;
  }

  formatSuccess(message: string): string {
    return `\x1b[32m✓ ${message}\x1b[0m`;
  }
}