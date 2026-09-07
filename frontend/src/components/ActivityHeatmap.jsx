import React, { useState, useEffect, useMemo } from 'react';
import { Flame, Trophy, Calendar, CheckCircle2, PlusCircle, Sparkles, Filter, Info } from 'lucide-react';
import { api } from '../utils/api';
import { isAuthenticated } from '../utils/auth';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export default function ActivityHeatmap({ refreshTrigger = 0 }) {
  const [heatmapData, setHeatmapData] = useState({});
  const [stats, setStats] = useState({
    totalSolved: 0,
    totalAdded: 0,
    activeDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    isUserSpecific: false
  });
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'solved' | 'added'
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const fetchHeatmap = async () => {
    try {
      setLoading(true);
      const res = await api.getDailyHeatmap();
      if (res.success) {
        setHeatmapData(res.heatmap || {});
        setStats(res.stats || {});
      }
    } catch (err) {
      console.error('Failed to load heatmap data:', err);
    } finally {
      setLoading(false);
    }
  };

  const [paletteKey, setPaletteKey] = useState(() => (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-palette') : 'earth'));

  useEffect(() => {
    fetchHeatmap();
    const handlePaletteChange = () => {
      setPaletteKey(document.documentElement.getAttribute('data-palette') || 'earth');
    };
    const handleAuthChange = () => {
      fetchHeatmap();
    };

    window.addEventListener('palette-changed', handlePaletteChange);
    window.addEventListener('auth-changed', handleAuthChange);
    return () => {
      window.removeEventListener('palette-changed', handlePaletteChange);
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, [refreshTrigger]);

  // Generate 52 weeks (364 days) leading up to today
  const { calendarWeeks, monthHeaders } = useMemo(() => {
    const today = new Date();
    // End on current day's Saturday to make a full grid week
    const currentDayOfWeek = today.getDay(); // 0 = Sun, 6 = Sat
    const daysToEndOfWeek = 6 - currentDayOfWeek;
    
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + daysToEndOfWeek);

    const totalDays = 52 * 7; // 52 weeks
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - totalDays + 1);

    const weeks = [];
    let currentWeek = [];
    const months = [];
    let lastMonth = -1;

    let cursor = new Date(startDate);

    for (let i = 0; i < totalDays; i++) {
      const dateStr = cursor.toISOString().slice(0, 10);
      const isFuture = cursor > today;
      const month = cursor.getMonth();

      // Track first occurrence of a month to place header label
      if (cursor.getDate() <= 7 && month !== lastMonth && !isFuture) {
        months.push({
          month: MONTH_NAMES[month],
          weekIndex: weeks.length
        });
        lastMonth = month;
      }

      currentWeek.push({
        date: dateStr,
        isFuture,
        dayOfWeek: cursor.getDay(),
        data: heatmapData[dateStr] || null
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return { calendarWeeks: weeks, monthHeaders: months };
  }, [heatmapData]);

  // Determine intensity level (0 to 4)
  const getIntensityLevel = (day) => {
    if (!day || day.isFuture || !day.data) return 0;
    let count = 0;
    if (filterMode === 'all') {
      count = (day.data.solvedCount || 0) + (day.data.addedCount || 0);
    } else if (filterMode === 'solved') {
      count = day.data.solvedCount || 0;
    } else if (filterMode === 'added') {
      count = day.data.addedCount || 0;
    }

    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count <= 4) return 3;
    return 4;
  };

  // Get color for intensity level
  const getColor = (level) => {
    // Check if light mode is active on document
    const isLight = typeof document !== 'undefined' && document.documentElement.getAttribute('data-palette') === 'light';

    if (filterMode === 'solved') {
      if (isLight) {
        const colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
        return colors[level];
      }
      const colors = ['rgba(255, 255, 255, 0.05)', '#065f46', '#059669', '#10b981', '#34d399'];
      return colors[level];
    }

    if (filterMode === 'added') {
      if (isLight) {
        const colors = ['#ebedf0', '#fed7aa', '#fb923c', '#ea580c', '#c2410c'];
        return colors[level];
      }
      const colors = ['rgba(255, 255, 255, 0.05)', '#7c2d12', '#c2410c', '#ea580c', '#f97316'];
      return colors[level];
    }

    // Default 'all'
    if (isLight) {
      const colors = ['#ebedf0', '#cbd5e1', '#94a3b8', '#5E3122', '#3b1c13'];
      return colors[level];
    }
    const colors = ['rgba(255, 255, 255, 0.05)', '#4e291c', '#7c3b25', '#b45309', '#f59e0b'];
    return colors[level];
  };

  const handleMouseEnter = (day, e) => {
    if (day.isFuture) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8
    });
    setHoveredDay(day);
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', position: 'relative' }}>
      {/* Top Header & Filters */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent-copper))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Flame size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Daily Progress Heatmap
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {stats.isUserSpecific ? 'Your personal problem solving & addition activity' : 'Platform problem solving & addition activity'}
            </span>
          </div>
        </div>

        {/* View Filter Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '20px',
          padding: '0.2rem'
        }}>
          <button
            onClick={() => setFilterMode('all')}
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '14px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: filterMode === 'all' ? 'var(--primary)' : 'transparent',
              color: filterMode === 'all' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilterMode('solved')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '14px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: filterMode === 'solved' ? '#10b981' : 'transparent',
              color: filterMode === 'solved' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <CheckCircle2 size={12} />
            Questions Solved
          </button>
          <button
            onClick={() => setFilterMode('added')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '14px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: filterMode === 'added' ? '#ea580c' : 'transparent',
              color: filterMode === 'added' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <PlusCircle size={12} />
            Questions Added
          </button>
        </div>
      </div>

      {/* Metric Badges */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <Flame size={13} color="#f59e0b" />
            Current Streak
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>
            {stats.currentStreak} {stats.currentStreak === 1 ? 'Day' : 'Days'}
          </div>
        </div>

        <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <Trophy size={13} color="#e59866" />
            Longest Streak
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e59866' }}>
            {stats.longestStreak} {stats.longestStreak === 1 ? 'Day' : 'Days'}
          </div>
        </div>

        <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={13} color="#10b981" />
            Solved Count
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
            {stats.totalSolved}
          </div>
        </div>

        <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <PlusCircle size={13} color="#c76f51" />
            Questions Added
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.totalAdded}
          </div>
        </div>

        <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <Calendar size={13} color="var(--text-secondary)" />
            Active Days
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.activeDays}
          </div>
        </div>
      </div>

      {/* Heatmap Grid Wrapper */}
      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', minWidth: '760px' }}>
          {/* Month Labels Row */}
          <div style={{ display: 'flex', marginLeft: '32px', marginBottom: '4px', fontSize: '0.68rem', color: 'var(--text-muted)', height: '16px' }}>
            {monthHeaders.map((m, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  left: `${m.weekIndex * 14}px`,
                  marginRight: idx < monthHeaders.length - 1 ? '0' : 'auto'
                }}
              >
                {m.month}
              </div>
            ))}
          </div>

          {/* Day Rows (Sun - Sat) */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {/* Day Labels Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '28px', fontSize: '0.62rem', color: 'var(--text-muted)', textAlign: 'right', paddingRight: '4px', justifyContent: 'space-between', height: '98px' }}>
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Weeks Columns */}
            {calendarWeeks.map((week, weekIdx) => (
              <div key={weekIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {week.map((day, dayIdx) => {
                  const level = getIntensityLevel(day);
                  const bg = getColor(level);
                  const isToday = day.date === new Date().toISOString().slice(0, 10);

                  return (
                    <div
                      key={dayIdx}
                      onMouseEnter={(e) => handleMouseEnter(day, e)}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        width: '11px',
                        height: '11px',
                        borderRadius: '2px',
                        backgroundColor: day.isFuture ? 'transparent' : bg,
                        border: isToday
                          ? '1px solid #f59e0b'
                          : day.isFuture
                          ? '1px dashed rgba(255, 255, 255, 0.05)'
                          : '1px solid rgba(0, 0, 0, 0.1)',
                        cursor: day.isFuture ? 'default' : 'pointer',
                        transition: 'transform 0.1s ease, box-shadow 0.1s ease'
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '0.4rem',
        marginTop: '0.75rem',
        fontSize: '0.7rem',
        color: 'var(--text-muted)'
      }}>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <div
            key={lvl}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '2px',
              backgroundColor: getColor(lvl),
              border: '1px solid rgba(0,0,0,0.1)'
            }}
          />
        ))}
        <span>More</span>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredDay && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.72rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            border: '1px solid var(--border-subtle)',
            pointerEvents: 'none',
            zIndex: 100,
            whiteSpace: 'nowrap',
            lineHeight: 1.4
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            {new Date(hoveredDay.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          {hoveredDay.data ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
                <CheckCircle2 size={12} />
                <span>{hoveredDay.data.solvedCount || 0} questions solved</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ea580c' }}>
                <PlusCircle size={12} />
                <span>{hoveredDay.data.addedCount || 0} questions added</span>
              </div>
              {hoveredDay.data.questionsSolved?.length > 0 && (
                <div style={{ marginTop: '0.25rem', paddingTop: '0.25rem', borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  Solved: {hoveredDay.data.questionsSolved.slice(0, 2).map((q) => q.title).join(', ')}
                  {hoveredDay.data.questionsSolved.length > 2 && '...'}
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>No questions solved or added on this day</div>
          )}
        </div>
      )}
    </div>
  );
}
