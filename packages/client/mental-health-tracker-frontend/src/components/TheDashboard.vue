<template>
  <div class="dashboard-view">
    <div class="top-section">
      <div class="header-welcome">
        <h1 class="welcome-title">
          <span>Dashboard</span>
          <i class="pi pi-chart-bar custom-icon"></i>
        </h1>
        <ul class="welcome-message">
          <li>View a summary of your recent moods, activities, and journal entries.</li>
          <li>Track your average mood and sentiment over the past week.</li>
          <li>Gain insights into your overall well-being and daily patterns.</li>
          <li>Use this information to make positive changes in your life.</li>
        </ul>
      </div>
    </div>

    <div v-if="summary" class="summary-grid">
      <div class="summary-section">
        <h2>Recent Moods</h2>
        <div v-for="mood in summary.recentMoods" :key="mood.id" class="summary-item">
          <h3>{{ formatDate(mood.date) }}</h3>
          <p><strong>Mood Score:</strong> {{ mood.mood_score }}</p>
          <p><strong>Emotions:</strong> {{ mood.emotions.join(', ') }}</p>
        </div>
      </div>

      <div class="summary-section">
        <h2>Recent Journal Entries</h2>
        <div v-for="entry in summary.recentEntries" :key="entry.id" class="summary-item">
          <h3>{{ formatDate(entry.date) }}</h3>
          <p><strong>Sentiment:</strong> {{ entry.sentiment.toFixed(2) }}</p>
        </div>
      </div>

      <div class="summary-section">
        <h2>Recent Activities</h2>
        <div v-for="activity in summary.recentActivities" :key="activity.id" class="summary-item">
          <h3>{{ formatDate(activity.date) }}</h3>
          <p><strong>{{ activity.activity }}</strong></p>
          <p v-if="activity.duration">Duration: {{ activity.duration }} minutes</p>
          <p v-if="activity.notes">{{ truncateText(activity.notes, 100) }}</p>
        </div>
      </div>

      <div class="summary-section averages">
        <h2>Weekly Averages</h2>
        <div class="summary-item">
          <p><strong>Average Mood:</strong> {{ summary.averageMoodLastWeek?.toFixed(2) || 'N/A' }}</p>
          <p><strong>Average Sentiment:</strong> {{ summary.averageSentimentLastWeek?.toFixed(2) || 'N/A' }}</p>
        </div>
      </div>
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
  return format(date, 'PPP p')
}

const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

onMounted(getSummary)
</script>

<style scoped>
.dashboard-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--surface-ground);
  color: var(--text-color);
}

.top-section {
  margin-bottom: 3rem;
}

.header-welcome {
  display: flex;
  flex-direction: column;
}

.welcome-title {
  font-size: 3.3rem;
  color: var(--primary-color);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
}

.custom-icon {
  color: #1b968a;
  margin-left: 1rem;
  font-size: 3.3rem;
}

.welcome-message {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  max-width: 600px;
  padding-left: 1.5rem;
}

.welcome-message li {
  margin-bottom: 0.5rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.summary-section {
  background-color: var(--surface-card);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #1b968a;
}

.summary-section h2 {
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.summary-item {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--surface-border);
}

.summary-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.summary-item h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.summary-item p {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.3rem;
}

.averages {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 2.5rem;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>