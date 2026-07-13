export type DemoRow = { id: string; name: string; category: string; status: 'Ready' | 'Processing' | 'Paused'; updated: string }

const seeds = [
  ['Alpha item', 'Document', 'Ready'],
  ['Beta item', 'Media', 'Processing'],
  ['Gamma item', 'Archive', 'Paused'],
  ['Delta item', 'Document', 'Ready'],
] as const

export const tableRows: DemoRow[] = Array.from({ length: 24 }, (_, index) => {
  const seed = seeds[index % seeds.length]!
  return { id: `row-${index + 1}`, name: `${seed[0]} ${index + 1}`, category: seed[1], status: seed[2], updated: `2026-07-${String(12 - (index % 9)).padStart(2, '0')}` }
})
