import React from 'react';
import { Post } from '../types/post';
import { useAppSelector } from '../store';
import { hasPermission } from '../utils/permissions';
import { PlatformIcon } from './SocialIcons';

interface DraftListProps {
  drafts: Post[];
  onEditDraft: (draft: Post) => void;
  onDeleteDraft: (id: string) => void;
  onPublishDraft: (draft: Post) => void;
  activeEditingId?: string | null;
  isLoading?: boolean;
}

export const DraftListComponent: React.FC<DraftListProps> = ({
  drafts,
  onEditDraft,
  onDeleteDraft,
  onPublishDraft,
  activeEditingId,
  isLoading = false,
}) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const userRole = currentUser?.role;

  const canEdit = hasPermission(userRole, 'edit');
  const canPublish = hasPermission(userRole, 'publish');
  const canDelete = hasPermission(userRole, 'delete'); // Strictly Admin role permission

  if (drafts.length === 0) {
    return (
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 className="card-title">Saved Drafts (0)</h2>
        <div className="empty-preview">
          No drafts saved yet. Compose a post above and click "Save as Draft" to store your work.
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <h2 className="card-title">
        <span>Saved Drafts ({drafts.length})</span>
      </h2>

      <div className="post-feed">
        {drafts.map((draft) => {
          const isCurrentlyEditing = activeEditingId === draft.id;

          return (
            <div
              key={draft.id}
              className={`feed-item draft-item ${isCurrentlyEditing ? 'editing' : ''}`}
            >
              <div className="feed-header">
                <div className="feed-platforms">
                  <span className="draft-badge">DRAFT</span>
                  {draft.platforms.map((platform) => (
                    <span key={platform} className={`platform-tag ${platform}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <PlatformIcon platform={platform} size={13} />
                      <span style={{ textTransform: 'capitalize' }}>{platform}</span>
                    </span>
                  ))}
                </div>

                <span className="feed-date">
                  Saved: {new Date(draft.updatedAt || draft.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="feed-content">{draft.content}</div>

              {draft.mediaUrl && (
                <img
                  src={draft.mediaUrl}
                  alt="Draft Media Attachment"
                  className="feed-media"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}

              <div className="draft-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={isLoading || !canEdit}
                  onClick={() => onEditDraft(draft)}
                >
                  {isCurrentlyEditing ? 'Currently Editing' : 'Edit Draft'}
                </button>

                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  disabled={isLoading || !canDelete}
                  onClick={() => onDeleteDraft(draft.id)}
                  title={
                    canDelete
                      ? 'Delete draft'
                      : 'Permission restricted: Admin role required to delete drafts'
                  }
                >
                  {canDelete ? 'Delete Draft' : 'Delete (Admin Only)'}
                </button>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={isLoading || !canPublish}
                  onClick={() => onPublishDraft(draft)}
                >
                  Publish Draft
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DraftList = React.memo(DraftListComponent);
