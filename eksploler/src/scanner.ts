import { promises as fs } from 'fs';
import { join } from 'path';
import { FileInfo, DirectoryStats, ListOptions } from './types';

export class DirectoryScanner {
  private homePath: string;

  constructor(homePath?: string) {
    this.homePath = homePath || process.env.HOME || process.env.USERPROFILE || '/home';
  }

  async getFileInfo(filePath: string, relativePath: string): Promise<FileInfo> {
    try {
      const stat = await fs.stat(filePath);
      const isHidden = relativePath.startsWith('.');
      
      let type: FileInfo['type'] = 'file';
      if (stat.isDirectory()) type = 'directory';
      else if (stat.isSymbolicLink()) type = 'symlink';

      return {
        name: relativePath,
        path: filePath,
        size: stat.size,
        isDirectory: stat.isDirectory(),
        isHidden,
        modified: stat.mtime,
        permissions: this.getPermissions(stat),
        type
      };
    } catch (error) {
      throw new Error(`Tidak dapat mengakses file: ${relativePath}`);
    }
  }

  private getPermissions(stat: fs.Stats): string {
    const mode = stat.mode;
    const isDir = stat.isDirectory() ? 'd' : '-';
    const ownerRead = (mode & 0o400) ? 'r' : '-';
    const ownerWrite = (mode & 0o200) ? 'w' : '-';
    const ownerExec = (mode & 0o100) ? 'x' : '-';
    const groupRead = (mode & 0o040) ? 'r' : '-';
    const groupWrite = (mode & 0o020) ? 'w' : '-';
    const groupExec = (mode & 0o010) ? 'x' : '-';
    const otherRead = (mode & 0o004) ? 'r' : '-';
    const otherWrite = (mode & 0o002) ? 'w' : '-';
    const otherExec = (mode & 0o001) ? 'x' : '-';
    
    return `${isDir}${ownerRead}${ownerWrite}${ownerExec}${groupRead}${groupWrite}${groupExec}${otherRead}${otherWrite}${otherExec}`;
  }

  async scanDirectory(
    dirPath: string = this.homePath,
    options: ListOptions = {},
    depth: number = 0
  ): Promise<{ files: FileInfo[]; stats: DirectoryStats }> {
    const files: FileInfo[] = [];
    let stats: DirectoryStats = {
      totalFiles: 0,
      totalDirectories: 0,
      totalSize: 0,
      hiddenFiles: 0
    };

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        const relativePath = depth === 0 ? entry.name : join(
          ...Array(depth).fill('..'), 
          entry.name
        );

        // Skip hidden files jika tidak diminta
        if (entry.name.startsWith('.') && !options.showHidden) {
          continue;
        }

        // Filter berdasarkan nama
        if (options.filter && !entry.name.toLowerCase().includes(options.filter.toLowerCase())) {
          continue;
        }

        try {
          const fileInfo = await this.getFileInfo(fullPath, entry.name);
          
          // Tambahkan ke statistik
          if (fileInfo.isHidden) stats.hiddenFiles++;
          if (fileInfo.isDirectory) {
            stats.totalDirectories++;
          } else {
            stats.totalFiles++;
            stats.totalSize += fileInfo.size;
          }

          files.push(fileInfo);

          // Rekursif jika diminta
          if (options.recursive && fileInfo.isDirectory) {
            if (options.maxDepth === undefined || depth < options.maxDepth - 1) {
              const subDirResult = await this.scanDirectory(fullPath, options, depth + 1);
              files.push(...subDirResult.files);
              stats.totalFiles += subDirResult.stats.totalFiles;
              stats.totalDirectories += subDirResult.stats.totalDirectories;
              stats.totalSize += subDirResult.stats.totalSize;
              stats.hiddenFiles += subDirResult.stats.hiddenFiles;
            }
          }
        } catch (err) {
          // Skip file yang tidak bisa diakses
          continue;
        }
      }
    } catch (error) {
      throw new Error(`Tidak dapat membaca direktori: ${dirPath}`);
    }

    // Sorting
    if (options.sortBy || options.foldersFirst) {
      files.sort((a, b) => {
        let comparison = 0;
        
        // Folders first priority
        if (options.foldersFirst !== undefined) {
          if (a.isDirectory && !b.isDirectory) return options.foldersFirst ? -1 : 1;
          if (!a.isDirectory && b.isDirectory) return options.foldersFirst ? 1 : -1;
        }
        
        // Then sort by specified field
        if (options.sortBy) {
          switch (options.sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'size':
              comparison = a.size - b.size;
              break;
            case 'modified':
              comparison = a.modified.getTime() - b.modified.getTime();
              break;
            case 'type':
              comparison = a.type.localeCompare(b.type);
              break;
          }
          
          return options.sortOrder === 'desc' ? -comparison : comparison;
        }
        
        return 0;
      });
    }

    return { files, stats };
  }

  async getStats(): Promise<DirectoryStats> {
    const result = await this.scanDirectory();
    return result.stats;
  }
}