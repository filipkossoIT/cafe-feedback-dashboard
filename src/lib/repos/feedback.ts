import { readCollection, writeCollection } from '../storage'
import type { Feedback } from '../../types'

const NAME = 'feedback'
const all = (): Feedback[] => readCollection<Feedback>(NAME)

export function listByCafe(cafeId: string): Feedback[] {
  return all()
    .filter((f) => f.cafeId === cafeId)
    .sort((a, b) => b.at - a.at)
}

export function addFeedback(input: Omit<Feedback, 'id'>): Feedback {
  const fb: Feedback = { ...input, id: crypto.randomUUID() }
  writeCollection(NAME, [...all(), fb])
  return fb
}
