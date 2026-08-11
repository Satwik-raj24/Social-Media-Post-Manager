import React from 'react';
import { Post, PLATFORM_CONFIGS } from '../types/post';
import { useAppSelector } from '../store';
import { hasPermission } from '../utils/permissions';
import { PlatformIcon } from './SocialIcons';

interface PostListProps {
  posts: Post[];
  onDeletePost?: (id: string) => void;
}

export const PostListComponent: React.FC<PostListProps> = ({ posts, onDeletePost }) => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const userRole = currentUser?.role;
  const canDelete = hasPermission(userRole, 'delete');

  return (
    <div className="card published-section">
      <h2 className="card-title">
        <span>Published Posts ({posts.length})</span>
      </h2>

      {posts.length === 0 ? (
        <div className="empty-preview">
          No published posts found matching criteria. Compose a post above and click "Publish Now" to share!
        </div>
      ) : (
        <div className="post-feed">
          {posts.map((post) => (
            <div key={post.id} className="feed-item">
              <div className="feed-header">
                <div className="feed-platforms">
                  {post.platforms.map((platform) => (
                    <span key={platform} className={`platform-tag ${platform}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <PlatformIcon platform={platform} size={13} />
                      <span>{PLATFORM_CONFIGS[platform]?.name || platform}</span>
                    </span>
                  ))}
                </div>
                <span className="feed-date">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="feed-content">{post.content}</div>

              {post.mediaUrl && (
                <img
                  src={post.mediaUrl}
                  alt="Post attachment"
                  className="feed-media"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}

              {onDeletePost && (
                <div className="draft-actions" style={{ marginTop: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={!canDelete}
                    onClick={() => onDeletePost(post.id)}
                    title={
                      canDelete
                        ? 'Delete published post permanently'
                        : 'Permission restricted: Admin role required to delete published posts'
                    }
                  >
                    {canDelete ? 'Delete Post' : 'Delete Post (Admin Only)'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const PostList = React.memo(PostListComponent);
