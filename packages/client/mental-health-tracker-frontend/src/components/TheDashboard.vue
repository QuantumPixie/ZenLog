<template>
  <div class="summary-view">
    <h2>Dashboard Summary</h2>
    <div v-if="summary">
      <h3>Recent Moods</h3>
      <ul>
        <li v-for="mood in summary.recentMoods" :key="mood.id">
          Date: {{ formatDate(mood.date) }}, 
          MoodScore: {{ mood.mood_score }}, 
          Emotions: {{ mood.emotions.join(', ') }}
        </li>
      </ul>
      <h3>Recent Journal Entries</h3>
      <ul>
        <li v-for="entry in summary.recentEntries" :key="entry.id">
          Date: {{ formatDate(entry.date) }}, 
          Sentiment: {{ entry.sentiment }}
        </li>
      </ul>
      <h3>Recent Activities</h3>
      <ul>
        <li v-for="activity in summary.recentActivities" :key="activity.id">
          Date: {{ formatDate(activity.date) }}, 
          Activity: {{ activity.activity }}
          {{ activity.duration ? `, Duration: ${activity.duration} minutes` : '' }}
          {{ activity.notes ? `, Notes: ${activity.notes}` : '' }}
        </li>
      </ul>
      <p>Average Mood (Last Week): {{ summary.averageMoodLastWeek?.toFixed(2) }}</p>
      <p>Average Sentiment (Last Week): {{ summary.averageSentimentLastWeek?.toFixed(2) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { trpc } from '../utils/trpc'
import { format, parseISO } from 'date-fns'

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
  averageMoodLastWeek: number | null
  averageSentimentLastWeek: number | null
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

const formatDate = (dateString: string) => {
  const date = parseISO(dateString)
  return format(date, 'PPP p') // e.g., "Apr 29, 2023, 3:00 PM"
}

onMounted(getSummary)
</script>

<style scoped>
.summary-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h2, h3 {
  color: #333;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
}

p {
  font-weight: bold;
}
</style>