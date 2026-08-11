import React from 'react';
import { Platform } from '../types/post';
import { useAppDispatch, useAppSelector } from '../store';
import { setSearchQuery, setPlatformFilter } from '../store/filterSlice';
import { PlatformIcon } from './SocialIcons';

const FILTER_PLATFORMS: Array<Platform | 'all'> = ['all', 'twitter', 'facebook', 'linkedin', 'instagram'];

export const FilterBarComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector((state) => state.filter.searchQuery);
  const platformFilter = useAppSelector((state) => state.filter.platformFilter);

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search Input Box */}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="url-input"
            placeholder="Search posts by content or #hashtags..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          />
        </div>

        {/* Platform Filter Selector Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Platform:
          </span>
          {FILTER_PLATFORMS.map((filterKey) => {
            const isSelected = platformFilter === filterKey;
            return (
              <button
                type="button"
                key={filterKey}
                className={`platform-chip ${filterKey} ${isSelected ? 'selected' : ''}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => dispatch(setPlatformFilter(filterKey))}
              >
                {filterKey !== 'all' && <PlatformIcon platform={filterKey as Platform} size={13} />}
                <span style={{ textTransform: 'capitalize' }}>{filterKey}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const FilterBar = React.memo(FilterBarComponent);
