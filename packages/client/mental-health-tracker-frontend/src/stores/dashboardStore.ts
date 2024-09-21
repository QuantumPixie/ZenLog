import { defineStore } from 'pinia'
import { trpc } from '../utils/trpc.ts'
import type { Summary } from '../types/dashboard.ts'
import type { RecentEntry } from '../types/recentEntry.ts'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    summary: null as Summary | null,
    recentEntries: [] as RecentEntry[]
  }),
  actions: {
    async fetchSummary() {
      try {
        console.log('Fetching summary...')
        const result = await trpc.dashboard.getSummary.query()

        console.log('API Response:', result)
        console.log('recentEntries structure:', JSON.stringify(result.recentEntries))

        if (Array.isArray(result.recentEntries)) {
          const mappedEntries: RecentEntry[] = result.recentEntries.map(
            (entry: {
              sentiment: number
              id?: number
              date?: string
              entry?: string
            }): RecentEntry => ({
              id: entry.id,
              date: entry.date ?? '',
              entry: entry.entry ?? '',
              sentiment: entry.sentiment
            })
          )

          this.summary = {
            recentMoods: result.recentMoods,
            recentEntries: mappedEntries,
            recentActivities: result.recentActivities,
            averageMoodLastWeek: result.averageMoodLastWeek,
            averageSentimentLastWeek: result.averageSentimentLastWeek
          }

          this.recentEntries = mappedEntries
        } else {
          console.warn('Unexpected recentEntries format:', result.recentEntries)
          this.summary = null
          this.recentEntries = []
        }
      } catch (error) {
        console.error('Failed to fetch summary:', error)
        this.summary = null
        this.recentEntries = []
      }
    },
    updateSummary(newData: Partial<Summary>) {
      if (this.summary) {
        this.summary = { ...this.summary, ...newData }
      }
    }
  }
})
