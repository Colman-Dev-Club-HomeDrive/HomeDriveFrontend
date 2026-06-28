import { API_BASE_URL } from '@/consts/consts';

export async function downloadFileBlob(fileId: string): Promise<Blob> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    throw new Error('Download failed');
  }

  return response.blob();
}

export async function downloadFileAsText(fileId: string): Promise<string> {
  const blob = await downloadFileBlob(fileId);
  return blob.text();
}
