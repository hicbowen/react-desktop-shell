export type DemoRow = {
  id: string
  name: string
  category: string
  status: 'Ready' | 'Processing' | 'Paused'
  owner: string
  priority: 'High' | 'Medium' | 'Low'
  region: string
  updated: string
}

const seeds = [
  ['Alpha item', 'Document', 'Ready'],
  ['Beta item', 'Media', 'Processing'],
  ['Gamma item', 'Archive', 'Paused'],
  ['Delta item', 'Document', 'Ready'],
] as const

const owners = ['Avery Chen', 'Jordan Lee', 'Morgan Wu', 'Riley Zhang']
const priorities = ['High', 'Medium', 'Low'] as const
const regions = ['Asia Pacific', 'Europe', 'North America']

export const tableRows: DemoRow[] = Array.from({ length: 200 }, (_, index) => {
  const seed = seeds[index % seeds.length]!

  return {
    id: `row-${index + 1}`,
    name: `${seed[0]} ${index + 1}`,
    category: seed[1],
    status: seed[2],
    owner: owners[Math.floor(index / seeds.length) % owners.length]!,
    priority: priorities[Math.floor(index / 2) % priorities.length]!,
    region: regions[Math.floor(index / 3) % regions.length]!,
    updated: `2026-07-${String(12 - (index % 9)).padStart(2, '0')}`,
  }
})
