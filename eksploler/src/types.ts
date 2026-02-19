export interface FileInfo {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  isHidden: boolean;
  modified: Date;
  permissions: string;
  type: 'file' | 'directory' | 'symlink' | 'other';
}

export interface DirectoryStats {
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
  hiddenFiles: number;
}

export interface ListOptions {
  showHidden?: boolean;
  sortBy?: 'name' | 'size' | 'modified' | 'type';
  sortOrder?: 'asc' | 'desc';
  foldersFirst?: boolean;
  recursive?: boolean;
  maxDepth?: number;
  filter?: string;
  longFormat?: boolean;
}