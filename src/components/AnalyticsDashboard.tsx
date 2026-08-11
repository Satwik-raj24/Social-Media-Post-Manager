import React from 'react';
import { Platform } from '../types/post';
import { PlatformIcon } from './SocialIcons';

interface AnalyticsProps {
  stats: {
    totalPublished: number;
    totalDrafts: number;
    totalScheduled: number;
    totalHashtags: number;
    platformCounts: Record<Platform, number>;
    topPlatform: string;
  };
}

const PLATFORM_LABELS: Record<Platform, string> = {
  twitter: 'Twitter / X',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
};

export const AnalyticsDashboardComponent: React.FC<AnalyticsProps> = ({ stats }) => {
  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <h2 className="card-title">System Analytics & Distribution Dashboard</h2>

      {/* Aggregate Statistics Grid */}
      <div className="analytics-grid">
        <div className="stat-card">
          <span className="stat-label">Published Posts</span>
          <span className="stat-value">{stats.totalPublished}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Saved Drafts</span>
          <span className="stat-value">{stats.totalDrafts}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Scheduled Posts</span>
          <span className="stat-value">{stats.totalScheduled}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Unique Hashtags</span>
          <span className="stat-value">{stats.totalHashtags}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Top Target Platform</span>
          <span className="stat-value" style={{ fontSize: '1.1rem', textTransform: 'capitalize' }}>
            {stats.topPlatform}
          </span>
        </div>
      </div>

      {/* Platform Breakdown Counts */}
      <div style={{ marginTop: '16px' }}>
        <span className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Platform Distribution breakdown:
        </span>
        <div className="platform-breakdown">
          {(Object.keys(stats.platformCounts) as Platform[]).map((platformKey) => (
            <div key={platformKey} className="breakdown-item">
              <PlatformIcon platform={platformKey} size={14} />
              <span>{PLATFORM_LABELS[platformKey]}:</span>
              <span className="breakdown-count">{stats.platformCounts[platformKey]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AnalyticsDashboard = React.memo(AnalyticsDashboardComponent);
