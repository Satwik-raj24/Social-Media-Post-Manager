export type Platform = 'twitter' | 'facebook' | 'linkedin' | 'instagram';

export interface PlatformConfig {
  id: Platform;
  name: string;
  maxCharacters: number;
}

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    maxCharacters: 280,
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    maxCharacters: 63206,
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    maxCharacters: 3000,
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    maxCharacters: 2200,
  },
};

export interface Post {
  id: string;
  content: string;
  platforms: Platform[];
  mediaUrl?: string;
  createdAt: string;
  updatedAt?: string;
  scheduledAt?: string;
  status: 'published' | 'draft' | 'scheduled';
  hashtags?: string[];
}
