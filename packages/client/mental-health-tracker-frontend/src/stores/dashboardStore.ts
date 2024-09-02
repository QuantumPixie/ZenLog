import { defineStore } from 'pinia'
import { trpc } from '../utils/trpc'
import type { Summary } from '../types/dashboard'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    summary: null as Summary | null,
  }),
  actions: {
    async fetchSummary() {
      try {
        this.summary = await trpc.dashboard.getSummary.query()
      } catch (error) {
        console.error('Failed to fetch summary:', error)
        this.summary = null
      }
    },
    updateSummary(newData: Partial<Summary>) {
      if (this.summary) {
        this.summary = { ...this.summary, ...newData }
      }
    },
  },
})
