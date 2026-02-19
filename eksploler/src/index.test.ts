import { describe, it, expect } from 'bun:test';
import { DirectoryScanner } from './scanner.js';
import { OutputFormatter } from './formatter.js';

describe('Home Analyzer', () => {
  const scanner = new DirectoryScanner();
  const formatter = new OutputFormatter();

  it('should scan current directory', async () => {
    const result = await scanner.scanDirectory('.', { showHidden: false });
    expect(result.files.length).toBeGreaterThan(0);
  });

  it('should calculate stats correctly', async () => {
    const stats = await scanner.getStats();
    expect(stats.totalFiles).toBeGreaterThanOrEqual(0);
    expect(stats.totalDirectories).toBeGreaterThanOrEqual(0);
  });

  it('should format file info correctly', () => {
    const fileInfo = {
      name: 'test.txt',
      path: '/test/test.txt',
      size: 1024,
      isDirectory: false,
      isHidden: false,
      modified: new Date(),
      permissions: '-rw-r--r--',
      type: 'file' as const
    };

    const longFormat = formatter.formatLong(fileInfo);
    expect(longFormat).toContain('test.txt');
    expect(longFormat).toContain('1.0 KB');
  });

  it('should format stats correctly', () => {
    const stats = {
      totalFiles: 10,
      totalDirectories: 5,
      totalSize: 1024000,
      hiddenFiles: 2
    };

    const formatted = formatter.formatStats(stats);
    expect(formatted).toContain('Total File:');
    expect(formatted).toContain('10');
    expect(formatted).toContain('Total Direktori:');
    expect(formatted).toContain('5');
  });
});