import React, { useState } from 'react';
import { Platform, PLATFORM_CONFIGS } from '../types/post';
import { useAppSelector } from '../store';
import { hasPermission } from '../utils/permissions';
import { PlatformIcon } from './SocialIcons';

interface PostComposerProps {
  content: string;
  onContentChange: (content: string) => void;
  selectedPlatforms: Platform[];
  onPlatformsChange: (platforms: Platform[]) => void;
  mediaUrl: string;
  onMediaUrlChange: (url: string) => void;
  scheduledAt: string;
  onScheduledAtChange: (datetime: string) => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  onSchedulePost: () => void;
  onReset: () => void;
  editingDraftId?: string | null;
  onCancelEdit?: () => void;
  isSaving?: boolean;
}

const AVAILABLE_PLATFORMS: Platform[] = ['twitter', 'facebook', 'linkedin', 'instagram'];

export const PostComposerComponent: React.FC<PostComposerProps> = ({
  content,
  onContentChange,
  selectedPlatforms,
  onPlatformsChange,
  mediaUrl,
  onMediaUrlChange,
  scheduledAt,
  onScheduledAtChange,
  onPublish,
  onSaveDraft,
  onSchedulePost,
  onReset,
  editingDraftId,
  onCancelEdit,
  isSaving = false,
}) => {
  const [error, setError] = useState<string | null>(null);

  // RBAC Permission Checks
  const currentUser = useAppSelector((state) => state.auth.user);
  const userRole = currentUser?.role;
  const canCreate = hasPermission(userRole, 'create');
  const canPublish = hasPermission(userRole, 'publish');

  // Platform-specific character limit calculation
  const currentMaxLimit = selectedPlatforms.length > 0
    ? Math.min(...selectedPlatforms.map((p) => PLATFORM_CONFIGS[p].maxCharacters))
    : 280;

  const restrictingPlatform = selectedPlatforms.find(
    (p) => PLATFORM_CONFIGS[p].maxCharacters === currentMaxLimit
  );

  const charCount = content.length;
  const remainingChars = currentMaxLimit - charCount;
  const isExceeded = charCount > currentMaxLimit;
  const isWarning = remainingChars <= 30 && !isExceeded;

  // Hashtag Extraction & Validation
  const validHashtags = (content.match(/#[a-zA-Z0-9_]+/g) || []);
  const invalidHashtagMatch = content.match(/#(?:[\s,!@#$%^&*()=+]|$)/g);
  const hasInvalidHashtagSyntax = Boolean(invalidHashtagMatch);

  const togglePlatform = (platform: Platform) => {
    if (!canCreate) return;
    if (selectedPlatforms.includes(platform)) {
      onPlatformsChange(selectedPlatforms.filter((p) => p !== platform));
    } else {
      onPlatformsChange([...selectedPlatforms, platform]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canCreate) return;
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (PNG, JPG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onMediaUrlChange(event.target.result as string);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = (): boolean => {
    if (!canCreate) {
      setError('Permission denied: Viewer role is restricted to read-only mode.');
      return false;
    }

    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return false;
    }

    if (selectedPlatforms.length === 0) {
      setError('Please select at least one target platform.');
      return false;
    }

    if (isExceeded) {
      const limitingName = restrictingPlatform ? PLATFORM_CONFIGS[restrictingPlatform].name : 'selected platform';
      setError(`Content exceeds ${limitingName} character limit of ${currentMaxLimit}.`);
      return false;
    }

    if (hasInvalidHashtagSyntax) {
      setError('Contains invalid hashtag format. Hashtags must start with # followed by letters or numbers.');
      return false;
    }

    setError(null);
    return true;
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onPublish();
    }
  };

  const handleDraftClick = () => {
    if (validate()) {
      onSaveDraft();
    }
  };

  const handleScheduleClick = () => {
    if (!scheduledAt) {
      setError('Please select a valid date & time to schedule your post.');
      return;
    }
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (new Date(scheduledAt).getTime() < startOfToday) {
      setError('Cannot schedule posts for past dates.');
      return;
    }
    if (validate()) {
      onSchedulePost();
    }
  };

  const handleClear = () => {
    setError(null);
    onReset();
  };

  return (
    <div className="card" id="post-composer-section">
      <div className="card-title" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <span>{editingDraftId ? 'Edit Post / Schedule' : 'Create Post'}</span>

        {!canCreate && (
          <div className="rbac-warning-chip">
            Read-Only Mode (Viewer Role)
          </div>
        )}

        {editingDraftId && (
          <div className="editing-banner">
            <span>Editing Mode</span>
            {onCancelEdit && (
              <button
                type="button"
                className="btn-link"
                onClick={onCancelEdit}
                disabled={isSaving}
              >
                Cancel Edit
              </button>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handlePublish}>
        {/* Target Platform Selection */}
        <div className="form-group">
          <label className="form-label">Target Platforms (Multi-select)</label>
          <div className="platform-selector">
            {AVAILABLE_PLATFORMS.map((platformKey) => {
              const platform = PLATFORM_CONFIGS[platformKey];
              const isSelected = selectedPlatforms.includes(platformKey);
              return (
                <button
                  type="button"
                  key={platformKey}
                  disabled={isSaving || !canCreate}
                  className={`platform-chip ${platformKey} ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setError(null);
                    togglePlatform(platformKey);
                  }}
                  title={`Max limit: ${platform.maxCharacters} chars`}
                >
                  <PlatformIcon platform={platformKey} size={15} />
                  <span>{platform.name}</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>({platform.maxCharacters})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Post Content Textarea */}
        <div className="form-group">
          <label htmlFor="post-content" className="form-label">
            Post Content
          </label>
          <textarea
            id="post-content"
            className="post-textarea"
            disabled={isSaving || !canCreate}
            placeholder={
              canCreate
                ? 'What would you like to share today? Use #hashtags to increase reach...'
                : 'Read-only mode active: Viewer role cannot create or edit posts.'
            }
            value={content}
            onChange={(e) => {
              setError(null);
              onContentChange(e.target.value);
            }}
          />
          <div className="counter-container">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="form-label" style={{ marginBottom: 0 }}>
                Character Count
              </span>
              {restrictingPlatform && selectedPlatforms.length > 1 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  (Limited by {PLATFORM_CONFIGS[restrictingPlatform].name})
                </span>
              )}
            </div>
            <span
              className={`char-counter ${isWarning ? 'warning' : ''} ${
                isExceeded ? 'exceeded' : ''
              }`}
            >
              {charCount} / {currentMaxLimit} chars
            </span>
          </div>
        </div>

        {/* Hashtag Insights */}
        {(validHashtags.length > 0 || hasInvalidHashtagSyntax) && (
          <div className="form-group" style={{ marginTop: '-8px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Hashtags detected ({validHashtags.length}):
              </span>
              {validHashtags.map((tag, idx) => (
                <span key={idx} className="hashtag-chip">
                  {tag}
                </span>
              ))}
            </div>
            {hasInvalidHashtagSyntax && (
              <div className="error-message" style={{ fontSize: '0.78rem' }}>
                Warning: Incomplete hashtag detected (e.g. '#' without tag name).
              </div>
            )}
          </div>
        )}

        {/* Active Schedule Date Highlight Banner */}
        {scheduledAt && (
          <div className="scheduled-date-banner">
            <span>
              📅 Scheduled for:{' '}
              <strong>
                {isNaN(new Date(scheduledAt).getTime())
                  ? scheduledAt
                  : new Date(scheduledAt).toLocaleString([], {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
              </strong>
            </span>
            <button
              type="button"
              className="btn-link"
              onClick={() => onScheduledAtChange('')}
              style={{ textDecoration: 'none', marginLeft: 'auto', fontSize: '0.8rem' }}
            >
              Remove Schedule
            </button>
          </div>
        )}

        {/* Schedule Date & Time Picker */}
        <div className="form-group">
          <label htmlFor="schedule-time" className="form-label">
            Schedule Date & Time (Optional)
          </label>
          <input
            id="schedule-time"
            type="datetime-local"
            className="url-input"
            min={(() => {
              const now = new Date();
              const p = (n: number) => String(n).padStart(2, '0');
              return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}T00:00`;
            })()}
            disabled={isSaving || !canCreate}
            value={scheduledAt}
            onChange={(e) => {
              setError(null);
              onScheduledAtChange(e.target.value);
            }}
          />
        </div>

        {/* Media Attachment */}
        <div className="form-group">
          <label className="form-label">Attach Media (URL or Local File)</label>
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <input
              id="media-url"
              type="url"
              className="url-input"
              disabled={isSaving || !canCreate}
              placeholder="Paste Image URL (https://...)"
              value={mediaUrl.startsWith('data:') ? '' : mediaUrl}
              onChange={(e) => onMediaUrlChange(e.target.value)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Or upload image file:</span>
              <input
                type="file"
                accept="image/*"
                disabled={isSaving || !canCreate}
                onChange={handleFileUpload}
                style={{ fontSize: '0.8rem' }}
              />
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && <div className="error-message">{error}</div>}

        {/* Form Action Buttons */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={isSaving || !canCreate}
            onClick={handleClear}
          >
            Clear
          </button>
          
          <button
            type="button"
            className="btn btn-draft"
            disabled={!content.trim() || selectedPlatforms.length === 0 || isExceeded || isSaving || !canCreate}
            onClick={handleDraftClick}
          >
            {isSaving ? 'Saving...' : 'Save as Draft'}
          </button>

          <button
            type="button"
            className="btn btn-schedule"
            disabled={!content.trim() || selectedPlatforms.length === 0 || isExceeded || isSaving || !canCreate || !scheduledAt}
            onClick={handleScheduleClick}
          >
            {isSaving ? 'Scheduling...' : 'Schedule Post'}
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!content.trim() || selectedPlatforms.length === 0 || isExceeded || isSaving || !canCreate || !canPublish}
          >
            {isSaving ? 'Publishing...' : 'Publish Now'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const PostComposer = React.memo(PostComposerComponent);
