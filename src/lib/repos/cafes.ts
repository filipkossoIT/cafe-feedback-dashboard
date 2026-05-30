import { readCollection, writeCollection } from '../storage'
import type { Cafe } from '../../types'

const NAME = 'cafes'
const all = (): Cafe[] => readCollection<Cafe>(NAME)

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'cafe'
  )
}

export function uniqueSlug(name: string): string {
  const base = slugify(name)
  const taken = new Set(all().map((c) => c.slug))
  if (!taken.has(base)) return base
  let i = 2
  while (taken.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}

export function findBySlug(slug: string): Cafe | undefined {
  return all().find((c) => c.slug === slug)
}

export function findByOwner(ownerId: string): Cafe | undefined {
  return all().find((c) => c.ownerId === ownerId)
}

export function createCafe(input: { ownerId: string; name: string }): Cafe {
  const cafe: Cafe = {
    id: crypto.randomUUID(),
    ownerId: input.ownerId,
    name: input.name.trim(),
    slug: uniqueSlug(input.name),
    createdAt: Date.now(),
  }
  writeCollection(NAME, [...all(), cafe])
  return cafe
}
