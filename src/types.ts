export type Rating = 1 | 2 | 3 | 4 | 5

export interface User {
  id: string
  email: string
  passwordHash: string
  salt: string
  cafeId: string
  createdAt: number
}

export interface Cafe {
  id: string
  ownerId: string
  name: string
  slug: string
  createdAt: number
}

export interface Feedback {
  id: string
  cafeId: string
  rating: Rating
  category: string
  comment: string
  at: number
}

export type Session = { userId: string } | null
