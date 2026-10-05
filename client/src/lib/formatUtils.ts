export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getFileExtension(filename: string): string {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function truncateFilename(filename: string, maxLength = 26): string {
  if (filename.length <= maxLength) return filename;
  const ext = getFileExtension(filename);
  const base = filename.slice(0, filename.lastIndexOf('.'));
  const frontLength = maxLength - ext.length - 4;
  return `${base.slice(0, frontLength)}...${ext ? `.${ext}` : ''}`;
}

export function getCategoryBadge(category: string): { bg: string; text: string; label: string } {
  switch (category) {
    case 'document':
      return { bg: 'bg-[#e7f3eb]', text: 'text-[#046634]', label: 'DOC' };
    case 'image':
      return { bg: 'bg-[#fdf0f6]', text: 'text-[#f00f77]', label: 'IMG' };
    case 'audio':
      return { bg: 'bg-[#fef9e7]', text: 'text-[#9c7d00]', label: 'AUDIO' };
    case 'video':
      return { bg: 'bg-[#f0f4f8]', text: 'text-[#1d4ed8]', label: 'VIDEO' };
    case 'archive':
      return { bg: 'bg-[#f5f0fa]', text: 'text-[#6d28d9]', label: 'ARCHIVE' };
    case 'spreadsheet':
      return { bg: 'bg-[#e6f4ea]', text: 'text-[#137333]', label: 'SHEET' };
    default:
      return { bg: 'bg-[#f1efe7]', text: 'text-[#444444]', label: 'FILE' };
  }
}
