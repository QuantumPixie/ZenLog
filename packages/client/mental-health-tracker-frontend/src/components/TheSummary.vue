<template>
    <div class="summary-view">
      <h2>Dashboard Summary</h2>
      <div v-if="summary">
        <h3>Recent Moods</h3>
        <ul>
          <li v-for="mood in summary?.recentMoods" :key="mood.id">
            Date: {{ mood.date }}, Score: {{ mood.mood_score }}
          </li>
        </ul>
        <h3>Recent Journal Entries</h3>
        <ul>
          <li v-for="entry in summary?.recentEntries" :key="entry.id">
            Date: {{ entry.date }}, Sentiment: {{ entry.sentiment }}
          </li>
        </ul>
        <h3>Recent Activities</h3>
        <ul>
          <li v-for="activity in summary?.recentActivities" :key="activity.id">
            Date: {{ activity.date }}, Activity: {{ activity.activity }}
          </li>
        </ul>
        <p>Average Mood (Last Week): {{ summary?.averageMoodLastWeek }}</p>
        <p>Average Sentiment (Last Week): {{ summary?.averageSentimentLastWeek }}</p>
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { trpc } from '../utils/trpc'

  interface Mood {
    id: number
    date: string
    mood_score: number
    emotions: string[]
  }

  interface JournalEntry {
    id?: number
    date: string
    entry: string
    sentiment: number
  }

  interface Activity {
    id?: number
    date: string
    activity: string
    duration?: number
    notes?: string
  }

  interface Summary {
    recentMoods: Mood[]
    recentEntries: JournalEntry[]
    recentActivities: Activity[]
    averageMoodLastWeek: number
    averageSentimentLastWeek: number
  }

  const summary = ref<Summary | null>(null)

  const getSummary = async () => {
    try {
      const result = await trpc.dashboard.getSummary.query()
      summary.value = result as Summary
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    }
  }

  onMounted(getSummary)
  </script>