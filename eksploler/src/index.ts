#!/usr/bin/env bun

import { DirectoryScanner } from './scanner.js';
import { OutputFormatter } from './formatter.js';
import { ListOptions } from './types.js';

class HomeAnalyzerCLI {
  private scanner: DirectoryScanner;
  private formatter: OutputFormatter;

  constructor() {
    this.scanner = new DirectoryScanner();
    this.formatter = new OutputFormatter();
  }

  private parseArgs(): ListOptions & { path?: string; statsOnly: boolean } {
    const args = process.argv.slice(2);
    const options: ListOptions = {
      showHidden: false,
      sortBy: 'name',
      sortOrder: 'asc',
      foldersFirst: false,
      recursive: false,
      longFormat: false
    };
    
    let path: string | undefined;
    let statsOnly = false;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '-a':
        case '--all':
          options.showHidden = true;
          break;
        case '-l':
        case '--long':
          options.longFormat = true;
          break;
        case '-r':
        case '--reverse':
          options.sortOrder = 'desc';
          break;
        case '-R':
        case '--recursive':
          options.recursive = true;
          break;
        case '-S':
          options.sortBy = 'size';
          break;
        case '-t':
          options.sortBy = 'modified';
          break;
        case '-f':
        case '--filter':
          options.filter = args[++i] || '';
          break;
        case '-d':
        case '--depth':
          options.maxDepth = parseInt(args[++i]) || undefined;
          break;
        case '-F':
        case '--folders-first':
          options.foldersFirst = true;
          break;
        case '--stats':
          statsOnly = true;
          break;
        default:
          if (!arg.startsWith('-') && !path) {
            path = arg;
          }
      }
    }

    return { ...options, path, statsOnly };
  }

  private async run(): Promise<void> {
    const { path, statsOnly, ...options } = this.parseArgs();
    
    try {
      const targetPath = path || this.scanner['homePath'];
      
      if (statsOnly) {
        const stats = await this.scanner.getStats();
        console.log(this.formatter.formatHeader(`Analisis: ${targetPath}`));
        console.log(this.formatter.formatStats(stats));
        return;
      }

      const result = await this.scanner.scanDirectory(targetPath, options);
      
      console.log(this.formatter.formatHeader(`Isi: ${targetPath}`));
      
      if (result.files.length === 0) {
        console.log(this.formatter.formatError('Direktori kosong atau tidak dapat diakses'));
        return;
      }

      // Tampilkan file
      for (const file of result.files) {
        if (options.longFormat) {
          console.log(this.formatter.formatLong(file));
        } else {
          console.log(this.formatter.formatSimple(file));
        }
      }

      // Tampilkan statistik
      console.log(this.formatter.formatStats(result.stats));
      
    } catch (error: any) {
      console.error(this.formatter.formatError(error.message));
      process.exit(1);
    }
  }

  async start(): Promise<void> {
    await this.run();
  }
}

// Jalankan CLI
const cli = new HomeAnalyzerCLI();
await cli.start();