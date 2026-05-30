export const Star = ({ filled, cls = '' }: { filled: boolean; cls?: string }) => (
  <svg viewBox="0 0 24 24" className={cls}>
    <path className={filled ? 'star-fill' : 'star-empty'} d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 18.56l-5.9 3.11 1.13-6.57L2.45 9.44l6.6-.96L12 2.5z" />
  </svg>
)

export const MiniStar = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%' }}>
    <path fill={color} d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 18.56l-5.9 3.11 1.13-6.57L2.45 9.44l6.6-.96L12 2.5z" />
  </svg>
)
