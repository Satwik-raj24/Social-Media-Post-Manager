import React, { useState, useEffect } from 'react';
import { Platform, PLATFORM_CONFIGS } from '../types/post';
import { useAppSelector } from '../store';
import { hasPermission } from '../utils/permissions';
import { PlatformIcon } from './SocialIcons';

interface ScheduleModalProps {
  isOpen: boolean;
  dateIso: string;
  onClose: () => void;
  onSchedulePost: (data: {
    content: string;
    platforms: Platform[];
    mediaUrl?: string;
    scheduledAt: string;
  }) => Promise<void>;
  onSaveDraft?: (data: {
    content: string;
    platforms: Platform[];
    mediaUrl?: string;
  }) => Promise<void>;
}

const AVAILABLE_PLATFORMS: Platform[] = ['twitter', 'facebook', 'linkedin', 'instagram'];

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  dateIso,
  onClose,
  onSchedulePost,
  onSaveDraft,
}) => {
  const [content, setContent] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['twitter']);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [datetime, setDatetime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const currentUser = useAppSelector((state) => state.auth.user);
  const canCreate = hasPermission(currentUser?.role, 'create');

  useEffect(() => {
    if (dateIso) {
      setDatetime(dateIso);
    } else {
      setDatetime('');
    }
    setContent('');
    setSelectedPlatforms(['twitter']);
    setMediaUrl('');
    setError(null);
  }, [dateIso, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentMaxLimit =
    selectedPlatforms.length > 0
      ? Math.min(...selectedPlatforms.map((p) => PLATFORM_CONFIGS[p].maxCharacters))
      : 280;

  const restrictingPlatform = selectedPlatforms.find(
    (p) => PLATFORM_CONFIGS[p].maxCharacters === currentMaxLimit
  );

  const charCount = content.length;
  const remainingChars = currentMaxLimit - charCount;
  const isExceeded = charCount > currentMaxLimit;
  const isWarning = remainingChars <= 30 && !isExceeded;

  const validHashtags = content.match(/#[a-zA-Z0-9_]+/g) || [];
  const invalidHashtagMatch = content.match(/#(?:[\s,!@#$%^&*()=+]|$)/g);
  const hasInvalidHashtagSyntax = Boolean(invalidHashtagMatch);

  const togglePlatform = (platform: Platform) => {
    if (!canCreate) return;
    if (selectedPlatforms.includes(platform)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
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
          setMediaUrl(event.target.result as string);
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
      const limitingName = restrictingPlatform
        ? PLATFORM_CONFIGS[restrictingPlatform].name
        : 'selected platform';
      setError(`Content exceeds ${limitingName} character limit of ${currentMaxLimit}.`);
      return false;
    }
    if (hasInvalidHashtagSyntax) {
      setError('Contains invalid hashtag format.');
      return false;
    }
    if (!datetime) {
      setError('Please specify a valid schedule date and time.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSchedulePost({
        content: content.trim(),
        platforms: selectedPlatforms,
        mediaUrl: mediaUrl.trim() || undefined,
        scheduledAt: new Date(datetime).toISOString(),
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to schedule post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraftSubmit = async () => {
    if (!validate() || !onSaveDraft) return;

    setIsSubmitting(true);
    try {
      await onSaveDraft({
        content: content.trim(),
        platforms: selectedPlatforms,
        mediaUrl: mediaUrl.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayDateStr = datetime
    ? new Date(datetime).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="modal-icon">📅</span>
            <div>
              <h3 className="modal-title">Schedule Post</h3>
              {displayDateStr && (
                <p className="modal-subtitle">For {displayDateStr}</p>
              )}
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <form onSubmit={handleScheduleSubmit}>
          <div className="modal-body">
            {/* Target Platform Selector */}
            <div className="form-group">
              <label className="form-label">Target Platforms</label>
              <div className="platform-selector">
                {AVAILABLE_PLATFORMS.map((platformKey) => {
                  const platform = PLATFORM_CONFIGS[platformKey];
                  const isSelected = selectedPlatforms.includes(platformKey);
                  return (
                    <button
                      type="button"
                      key={platformKey}
                      disabled={isSubmitting || !canCreate}
                      className={`platform-chip ${platformKey} ${isSelected ? 'selected' : ''}`}
                      onClick={() => togglePlatform(platformKey)}
                    >
                      <PlatformIcon platform={platformKey} size={15} />
                      <span>{platform.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schedule Datetime Field */}
            <div className="form-group">
              <label htmlFor="modal-datetime" className="form-label">
                Scheduled Date & Time
              </label>
              <input
                id="modal-datetime"
                type="datetime-local"
                className="url-input"
                disabled={isSubmitting || !canCreate}
                value={datetime}
                onChange={(e) => {
                  setError(null);
                  setDatetime(e.target.value);
                }}
              />
            </div>

            {/* Post Content Textarea */}
            <div className="form-group">
              <label htmlFor="modal-post-content" className="form-label">
                Post Content
              </label>
              <textarea
                id="modal-post-content"
                className="post-textarea"
                rows={4}
                disabled={isSubmitting || !canCreate}
                placeholder="What would you like to schedule? Type content and hashtags..."
                value={content}
                onChange={(e) => {
                  setError(null);
                  setContent(e.target.value);
                }}
                autoFocus
              />
              <div className="counter-container">
                <span className="form-label" style={{ marginBottom: 0 }}>
                  Character Count
                </span>
                <span
                  className={`char-counter ${isWarning ? 'warning' : ''} ${
                    isExceeded ? 'exceeded' : ''
                  }`}
                >
                  {charCount} / {currentMaxLimit} chars
                </span>
              </div>
            </div>

            {/* Hashtags display */}
            {validHashtags.length > 0 && (
              <div className="form-group" style={{ marginTop: '-6px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hashtags:</span>
                  {validHashtags.map((tag, idx) => (
                    <span key={idx} className="hashtag-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Media URL attachment */}
            <div className="form-group">
              <label className="form-label">Attach Image (Optional)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="url"
                  className="url-input"
                  disabled={isSubmitting || !canCreate}
                  placeholder="Image URL (https://...)"
                  value={mediaUrl.startsWith('data:') ? '' : mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Or upload file:</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isSubmitting || !canCreate}
                    onChange={handleFileUpload}
                    style={{ fontSize: '0.78rem' }}
                  />
                </div>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </button>

            {onSaveDraft && (
              <button
                type="button"
                className="btn btn-draft"
                disabled={!content.trim() || isExceeded || isSubmitting || !canCreate}
                onClick={handleSaveDraftSubmit}
              >
                Save as Draft
              </button>
            )}

            <button
              type="submit"
              className="btn btn-schedule"
              disabled={!content.trim() || isExceeded || isSubmitting || !canCreate || !datetime}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
