<template>
  <div class="activity-view">
    <div class="top-section">
      <div class="header-welcome">
        <h1 class="welcome-title">
          <span>Activities</span>
          <i class="pi pi-bolt custom-icon"></i>
        </h1>
        <ul class="welcome-message">
          <li>Log your daily activities to track your lifestyle habits.</li>
          <li>Record the duration of each activity for better insights.</li>
          <li>Add notes to provide context or reflect on your experiences.</li>
          <li>Monitor your activity patterns over time.</li>
          <li>Use this data to correlate activities with mood and journal entries.</li>
        </ul>
      </div>
      <div class="activity-input">
        <h2>Log New Activity</h2>
        <form class="p-fluid" @submit.prevent="createActivity">
          <div class="field">
            <label for="activity">Activity Name</label>
            <InputText
              id="activity"
              v-model="newActivity.activity"
              placeholder="e.g., Running, Yoga, Reading"
            />
          </div>
          <div class="field">
            <label for="duration">Duration (minutes)</label>
            <InputNumber id="duration" v-model="newActivity.duration" placeholder="e.g., 30" />
          </div>
          <div class="field">
            <label for="notes">Notes</label>
            <Textarea
              id="notes"
              v-model="newActivity.notes"
              rows="3"
              auto-resize
              placeholder="Any additional details or reflections"
            />
          </div>
          <Button
            type="submit"
            label="Log Activity"
            class="p-button-raised p-button-rounded custom-button"
          />
        </form>
      </div>
    </div>

    <div class="activity-list">
      <h2>Your Recent Activities</h2>
      <div class="activity-grid">
        <div v-for="activity in activities" :key="activity.id" class="activity-item">
          <h3>{{ formatDate(activity.date) }}</h3>
          <p>
            <strong>{{ activity.activity }}</strong>
          </p>
          <p v-if="activity.duration">Duration: {{ activity.duration }} minutes</p>
          <p v-if="activity.notes">{{ truncateText(activity.notes, 100) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { trpc } from '../utils/trpc'
import { formatDate } from '../utils/dateUtils'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'

interface Activity {
  id: number
  date: string
  activity: string
  duration?: number
  notes?: string
}

const activities = ref<Activity[]>([])
const newActivity = ref({
  activity: '',
  duration: undefined as number | undefined,
  notes: ''
})

const getActivities = async () => {
  try {
    console.log('Fetching activities...')
    const fetchedActivities = await trpc.activity.getActivities.query()
    console.log('Raw fetched activities:', fetchedActivities)
    activities.value = fetchedActivities
    console.log('Activities after assignment:', activities.value)
  } catch (error) {
    console.error('Failed to fetch activities:', error)
  }
}

const createActivity = async () => {
  if (!newActivity.value.activity.trim()) {
    console.error('Activity name is required')
    return
  }

  try {
    const createdActivity = await trpc.activity.createActivity.mutate({
      date: new Date().toISOString(),
      ...newActivity.value
    })
    console.log('Created activity:', createdActivity)

    activities.value = [createdActivity, ...activities.value]

    await getActivities()

    newActivity.value = { activity: '', duration: undefined, notes: '' }
  } catch (error) {
    console.error('Failed to create activity:', error)
  }
}

const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

onMounted(getActivities)
</script>

<style scoped>
.activity-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  background-color: var(--surface-ground);
  color: var(--text-color);
}

.top-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 3rem;
}

.header-welcome {
  display: flex;
  flex-direction: column;
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

.activity-input,
.activity-item {
  background-color: var(--surface-card);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #1b968a;
}

.activity-input h2,
.activity-list h2 {
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.field {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

.custom-button {
  margin-top: 1rem;
  background-color: #1b968a !important;
  border-color: #1b968a !important;
}

.custom-button:hover {
  background-color: #22b8a8 !important;
  border-color: #22b8a8 !important;
}

.activity-list {
  margin-top: 2rem;
}

.activity-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.activity-item {
  text-align: center;
  transition: transform 0.3s ease;
}

.activity-item:hover {
  transform: translateY(-3px);
}

.activity-item h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.activity-item p {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

@media (min-width: 768px) {
  .activity-view {
    padding: 2rem;
  }

  .top-section {
    flex-direction: row;
    gap: 4rem;
    align-items: flex-start;
  }

  .welcome-title {
    font-size: 1.2rem;
  }

  .custom-icon {
    font-size: 3rem;
  }

  .welcome-message {
    font-size: 1.2rem;
  }

  .activity-input,
  .activity-item {
    padding: 2rem;
  }

  .activity-input {
    flex: 1;
  }

  .activity-list {
    flex-basis: 400px;
  }

  .activity-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .activity-item h3 {
    font-size: 1.2rem;
  }

  .activity-item p {
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .top-section {
    gap: 6rem;
  }

  .welcome-title {
    font-size: 3.3rem;
  }

  .custom-icon {
    font-size: 3.3rem;
  }

  .activity-input,
  .activity-item {
    border: 2px solid #1b968a;
  }

  .activity-input h2,
  .activity-list h2 {
    font-size: 1.8rem;
  }

  .activity-item h3 {
    font-size: 1.3rem;
  }

  .activity-item p {
    font-size: 1.1rem;
  }
}
</style>
