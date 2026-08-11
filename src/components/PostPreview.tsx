import React from 'react';
import { Platform, PLATFORM_CONFIGS } from '../types/post';
import { PlatformIcon } from './SocialIcons';

interface PostPreviewProps {
  content: string;
  selectedPlatforms: Platform[];
  mediaUrl?: string;
}

export const PostPreviewComponent: React.FC<PostPreviewProps> = ({
  content,
  selectedPlatforms,
  mediaUrl,
}) => {
  const hashtags = (content.match(/#[a-zA-Z0-9_]+/g) || []);

  if (selectedPlatforms.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">Live Social Preview</h2>
        <div className="empty-preview">
          Select at least one target platform above to preview your post rendering across social networks.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">Live Social Preview</h2>

      <div className="preview-container">
        {selectedPlatforms.map((platformKey) => {
          const platform = PLATFORM_CONFIGS[platformKey];
          return (
            <div key={platformKey} className="preview-card">
              <div className="preview-card-header">
                <div className="preview-avatar">{platform.name.charAt(0)}</div>
                <div className="preview-user-info">
                  <span className="preview-username">Campus Brand Account</span>
                  <span className="preview-handle">@{platformKey}_handle</span>
                </div>
                <span className={`platform-tag ${platformKey}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <PlatformIcon platform={platformKey} size={13} />
                  <span>{platform.name}</span>
                </span>
              </div>

              <div className="preview-body">
                {content || <em style={{ color: 'var(--text-muted)' }}>Drafting post content...</em>}
              </div>

              {mediaUrl && (
                <img
                  src={mediaUrl}
                  alt="Post Preview Attachment"
                  className="preview-media"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}

              {hashtags.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {hashtags.map((tag, idx) => (
                    <span key={idx} className="hashtag-chip" style={{ fontSize: '0.7rem' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PostPreview = React.memo(PostPreviewComponent);
