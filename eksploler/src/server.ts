import { serve } from 'bun';
import { DirectoryScanner } from './scanner.js';
import { ListOptions } from './types.js';
import path from 'path';
import { promises as fs } from 'fs';

const scanner = new DirectoryScanner();

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

function jsonResponse(data: any): Response {
  return new Response(JSON.stringify(data, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const routePath = url.pathname;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse query parameters
    const options: ListOptions = {
      showHidden: url.searchParams.get('all') === 'true',
      sortBy: (url.searchParams.get('sortBy') as any) || 'name',
      sortOrder: (url.searchParams.get('order') as any) || 'asc',
      foldersFirst: url.searchParams.get('foldersFirst') === 'true',
      recursive: url.searchParams.get('recursive') === 'true',
      longFormat: url.searchParams.get('long') === 'true',
      filter: url.searchParams.get('filter') || undefined,
      maxDepth: url.searchParams.get('depth') ? parseInt(url.searchParams.get('depth')!) : undefined
    };

    const pathParam = url.searchParams.get('path') || scanner['homePath'];

    if (routePath === '/api/files' || routePath === '/api/files/') {
      const result = await scanner.scanDirectory(pathParam, options);
      
      const response: ApiResponse = {
        success: true,
        data: {
          files: result.files.map(f => ({
            name: f.name,
            path: f.path,
            size: f.size,
            isDirectory: f.isDirectory,
            isHidden: f.isHidden,
            modified: f.modified.toISOString(),
            permissions: f.permissions,
            type: f.type
          })),
          stats: result.stats
        }
      };
      
      return jsonResponse(response);
    }

    if (routePath === '/api/stats' || routePath === '/api/stats/') {
      const stats = await scanner.getStats();
      return jsonResponse({ success: true, data: stats });
    }

    if (routePath === '/' || routePath === '/index.html') {
      const html = await Bun.file('public/index.html').text();
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    if (routePath.startsWith('/static/')) {
      const filePath = `public${path}`;
      try {
        const file = Bun.file(filePath);
        if (await file.exists()) {
          return new Response(file);
        }
      } catch {
        // File not found, continue to 404
      }
    }

    if (routePath.startsWith('/media/')) {
      const filePath = decodeURIComponent(routePath.replace('/media/', ''));
      try {
        const file = Bun.file(filePath);
        if (await file.exists()) {
          const ext = filePath.split('.').pop()?.toLowerCase() || '';
          const mimeTypes: Record<string, string> = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'flac': 'audio/flac',
            'aac': 'audio/aac',
            'm4a': 'audio/mp4',
            'wma': 'audio/x-ms-wma',
            'mp4': 'video/mp4',
            'avi': 'video/x-msvideo',
            'mkv': 'video/x-matroska',
            'mov': 'video/quicktime',
            'webm': 'video/webm',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'svg': 'image/svg+xml',
            'webp': 'image/webp'
          };
          
          return new Response(file, {
            headers: {
              'Content-Type': mimeTypes[ext] || 'application/octet-stream',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, HEAD',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        }
      } catch {
        // File not found, continue to 404
      }
    }

    if (routePath === '/download' || routePath === '/download/') {
      const filePath = url.searchParams.get('path');
      if (!filePath) {
        return new Response(JSON.stringify({ success: false, error: 'Path parameter is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const file = Bun.file(filePath);
      if (await file.exists()) {
        const stats = await Bun.file(filePath).stat();
        const fileName = filePath.split('/').pop() || 'download';
        const ext = filePath.split('.').pop()?.toLowerCase() || '';
        
        const mimeTypes: Record<string, string> = {
          'pdf': 'application/pdf',
          'txt': 'text/plain',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'mp3': 'audio/mpeg',
          'wav': 'audio/wav',
          'mp4': 'video/mp4',
          'avi': 'video/x-msvideo',
          'mkv': 'video/x-matroska',
          'zip': 'application/zip',
          'rar': 'application/vnd.rar',
          '7z': 'application/x-7z-compressed',
          'tar': 'application/x-tar',
          'gz': 'application/gzip',
          'json': 'application/json',
          'xml': 'application/xml',
          'html': 'text/html',
          'css': 'text/css',
          'js': 'application/javascript',
          'ts': 'application/typescript'
        };
        
        return new Response(file, {
          headers: {
            'Content-Type': mimeTypes[ext] || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
            'Content-Length': stats.size.toString(),
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
          }
        });
      } else {
        return new Response(JSON.stringify({ success: false, error: 'File not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Handle file upload
    if (routePath === '/api/upload' && request.method === 'POST') {
      const formData = await request.formData();
      const files = formData.getAll('file[]') as File[];
      const destPath = formData.get('path') as string;

      if (!files || files.length === 0) {
        return new Response(JSON.stringify({ success: false, error: 'At least one file is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!destPath) {
        return new Response(JSON.stringify({ success: false, error: 'Destination path is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Validate destination path (prevent directory traversal)
      const normalizedDest = path.normalize(destPath);
      if (normalizedDest.includes('..')) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid destination path' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Ensure destination is within allowed directory
      const absoluteDest = path.resolve(process.cwd(), normalizedDest);
      if (!absoluteDest.startsWith(scanner['homePath'])) {
        return new Response(JSON.stringify({ success: false, error: 'Access denied: destination outside allowed directory' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Determine if destination is a directory (check once for all files)
      let isDirectory = false;
      try {
        const destStat = await Bun.file(absoluteDest).stat();
        isDirectory = destStat.isDirectory();
      } catch {
        // Destination doesn't exist, will create parent directories
      }

      const results: Array<{
        success: boolean;
        name: string;
        path?: string;
        error?: string;
        size?: number;
        type?: string;
      }> = [];

      // Process each file
      for (const file of files) {
        let finalPath = absoluteDest;
        
        // If destination is a directory, append filename
        if (isDirectory) {
          finalPath = path.join(absoluteDest, file.name);
        }

        // Create parent directories if they don't exist
        const parentDir = path.dirname(finalPath);
        try {
          await fs.mkdir(parentDir, { recursive: true });
        } catch (error) {
          results.push({
            success: false,
            name: file.name,
            error: `Failed to create directory: ${error}`
          });
          continue;
        }

        // Write the file
        try {
          const fileBuffer = Buffer.from(await file.arrayBuffer());
          await Bun.write(finalPath, fileBuffer);
          
          results.push({
            success: true,
            name: file.name,
            path: finalPath,
            size: file.size,
            type: file.type
          });
        } catch (error) {
          results.push({
            success: false,
            name: file.name,
            error: `Failed to write file: ${error}`
          });
        }
      }

      // Check if all uploads failed
      const allFailed = results.every(r => !r.success);
      if (allFailed) {
        return new Response(JSON.stringify({
          success: false,
          error: 'All file uploads failed',
          results
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Some or all succeeded
      return new Response(JSON.stringify({
        success: true,
        results
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response('Not Found', { status: 404 });

  } catch (error: any) {
    return jsonResponse({
      success: false,
      error: error.message
    });
  }
}

console.log('🚀 Server starting on http://localhost:3000');
serve({
  fetch: handleRequest,
  port: 3000,
  idleTimeout: 30 // 30 seconds timeout to prevent request timeout errors
});