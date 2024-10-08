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
          <li>Track your average mood and sentiment over time.</li>
          <li>Gain insights into your overall well-being and daily patterns.</li>
          <li>Use this information to make positive changes in your life.</li>
        </ul>
      </div>
    </div>

    <div class="view-toggle">
      <Button
        :class="[
          'p-button-raised p-button-rounded custom-button',
          { active: currentView === 'detailed' }
        ]"
        @click="currentView = 'detailed'"
        >Detailed View</Button
      >
      <Button
        :class="[
          'p-button-raised p-button-rounded custom-button',
          { active: currentView === 'chart' }
        ]"
        @click="currentView = 'chart'"
        >Chart View</Button
      >
      <Button
        icon="pi pi-refresh"
        label="Refresh Data"
        class="p-button-raised p-button-rounded custom-button refresh-button"
        @click="refreshData"
      />
    </div>

    <ProgressSpinner v-if="isLoading" />

    <div v-else-if="summary">
      <div v-if="currentView === 'detailed'" class="summary-grid">
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
            <p>{{ truncateText(entry.entry, 100) }}</p>
          </div>
        </div>

        <div class="summary-section">
          <h2>Recent Activities</h2>
          <div v-for="activity in summary.recentActivities" :key="activity.id" class="summary-item">
            <h3>{{ formatDate(activity.date) }}</h3>
            <p>
              <strong>{{ activity.activity }}</strong>
            </p>
            <p v-if="activity.duration">Duration: {{ activity.duration }} minutes</p>
            <p v-if="activity.notes">{{ truncateText(activity.notes, 100) }}</p>
          </div>
        </div>

        <div class="summary-section averages">
          <h2>Weekly Averages</h2>
          <div class="summary-item">
            <p>
              <strong>Average Mood:</strong> {{ summary.averageMoodLastWeek?.toFixed(2) || 'N/A' }}
            </p>
            <p>
              <strong>Average Sentiment:</strong>
              {{ summary.averageSentimentLastWeek?.toFixed(2) || 'N/A' }}
            </p>
          </div>
        </div>
      </div>

      <div v-else-if="currentView === 'chart'" class="chart-view">
        <div class="chart-container">
          <h2>Mood Trend</h2>
          <Chart type="line" :data="moodChartData" :options="moodChartOptions" />
        </div>

        <div class="chart-container">
          <h2>Activity Distribution</h2>
          <Chart type="pie" :data="activityChartData" :options="activityChartOptions" />
        </div>

        <div class="chart-container">
          <h2>Journal Sentiment Trend</h2>
          <Chart type="line" :data="sentimentChartData" :options="sentimentChartOptions" />
        </div>
      </div>
    </div>

    <div v-else class="error-message">Failed to load dashboard data. Please try refreshing.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import Button from 'primevue/button'
import Chart from 'primevue/chart'
import ProgressSpinner from 'primevue/progressspinner'
import { useDashboardStore } from '../stores/dashboardStore'
import { Mood, JournalEntry, Activity } from '../types/dashboard'
import { formatDate } from '../utils/dateUtils'
import { format, parseISO } from 'date-fns'

const dashboardStore = useDashboardStore()
const currentView = ref('detailed')
const isLoading = ref(false)

const summary = computed(() => dashboardStore.summary)

const refreshData = async () => {
  isLoading.value = true
  await dashboardStore.fetchSummary()
  isLoading.value = false
}

const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Chart data computations
const moodChartData = computed(() => {
  if (!summary.value) return { labels: [], datasets: [] }
  const labels = summary.value.recentMoods.map((mood: Mood) => format(parseISO(mood.date), 'MMM d'))
  const data = summary.value.recentMoods.map((mood: Mood) => mood.mood_score)
  return {
    labels,
    datasets: [
      {
        label: 'Mood Score',
        data,
        fill: false,
        borderColor: '#4bc0c0'
      }
    ]
  }
})

const activityChartData = computed(() => {
  if (!summary.value) return { labels: [], datasets: [] }
  const activityCounts = summary.value.recentActivities.reduce(
    (acc: Record<string, number>, activity: Activity) => {
      acc[activity.activity] = (acc[activity.activity] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return {
    labels: Object.keys(activityCounts),
    datasets: [
      {
        data: Object.values(activityCounts),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
      }
    ]
  }
})

const sentimentChartData = computed(() => {
  if (!summary.value) return { labels: [], datasets: [] }
  const labels = summary.value.recentEntries.map((entry: JournalEntry) =>
    format(parseISO(entry.date), 'MMM d')
  )
  const data = summary.value.recentEntries.map((entry: JournalEntry) => entry.sentiment)
  return {
    labels,
    datasets: [
      {
        label: 'Sentiment Score',
        data,
        fill: false,
        borderColor: '#FF6384'
      }
    ]
  }
})

// Chart options
const moodChartOptions = {
  responsive: true,
  scales: {
    y: {
      beginAtZero: true,
      max: 10
    }
  }
}

const activityChartOptions = {
  responsive: true
}

const sentimentChartOptions = {
  responsive: true,
  scales: {
    y: {
      beginAtZero: true,
      max: 10
    }
  }
}

watch(
  () => dashboardStore.summary,
  (newSummary) => {
    if (newSummary) {
      console.log('Dashboard data updated')
    }
  }
)

onMounted(async () => {
  if (!dashboardStore.summary) {
    await refreshData()
  }
})
</script>

<style scoped>
.dashboard-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  background-color: var(--surface-ground);
  color: var(--text-color);
}

.top-section {
  margin-bottom: 2rem;
}

.header-welcome {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.welcome-title {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.custom-icon {
  color: #1b968a;
  margin-left: 0.5rem;
  font-size: 2.5rem;
}

.welcome-message {
  font-size: 1rem;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.welcome-message li {
  margin-bottom: 0.5rem;
}

.view-toggle {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.view-toggle .custom-button {
  background-color: #1b968a !important;
  border-color: #1b968a !important;
  color: white !important;
  text-align: left;
}

.view-toggle .custom-button:hover {
  background-color: #22b8a8 !important;
  border-color: #22b8a8 !important;
}

.view-toggle .custom-button.active {
  background-color: #19635c !important;
  border-color: #19635c !important;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.summary-section,
.chart-container {
  background-color: var(--surface-card);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #1b968a;
}

.summary-section h2,
.chart-container h2 {
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-size: 1.3rem;
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
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.summary-item p {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.3rem;
}

.chart-view {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.chart-container :deep(canvas) {
  max-width: 100%;
  height: auto !important;
}

.error-message {
  text-align: center;
  color: var(--red-500);
  font-size: 1.1rem;
  margin-top: 1.5rem;
}

@media (min-width: 768px) {
  .dashboard-view {
    padding: 2rem;
  }

  .welcome-title {
    font-size: 3rem;
  }

  .custom-icon {
    font-size: 3rem;
  }

  .welcome-message {
    font-size: 1.2rem;
  }

  .view-toggle {
    flex-direction: row;
    justify-content: center;
    margin-bottom: 3rem;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-view {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-section h2,
  .chart-container h2 {
    font-size: 1.5rem;
  }

  .summary-item h3 {
    font-size: 1.2rem;
  }

  .summary-item p {
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .welcome-title {
    font-size: 3.3rem;
  }

  .custom-icon {
    font-size: 3.3rem;
  }

  .summary-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .summary-section.averages {
    grid-column: span 3;
  }

  .chart-view {
    grid-template-columns: repeat(3, 1fr);
  }

  .summary-section,
  .chart-container {
    border: 2px solid #1b968a;
  }

  .summary-section h2,
  .chart-container h2 {
    font-size: 1.8rem;
  }

  .summary-item h3 {
    font-size: 1.3rem;
  }

  .summary-item p {
    font-size: 1.1rem;
  }
}
</style>
