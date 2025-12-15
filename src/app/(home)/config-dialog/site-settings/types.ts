export type FileItem = { type: 'file'; file: File; previewUrl: string; hash?: string } | { type: 'url'; url: string }
export type ArtImageUploads = Record<string, FileItem>
export type BackgroundImageUploads = Record<string, FileItem>
export type SocialButtonImageUploads = Record<string, FileItem>
