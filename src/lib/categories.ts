export const CATEGORIES = ['Service', 'Product', 'Staff', 'Atmosphere', 'Other'] as const
export type Category = (typeof CATEGORIES)[number]

const NEUTRAL = '#8A8079'

export const CAT_COLOR: Record<string, string> = {
  Service: '#FF8A3D',
  Product: '#FB6B4B',
  Staff: '#2BB3A3',
  Atmosphere: '#7A5AE0',
  Other: '#8A8079',
}

export const catColor = (c: string): string => CAT_COLOR[c] ?? NEUTRAL

export const RATING_WORDS = ['', 'Not great', 'Could be better', 'It was okay', 'Really good!', 'Loved it!']
