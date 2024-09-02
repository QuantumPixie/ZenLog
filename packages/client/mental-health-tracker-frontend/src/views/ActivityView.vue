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
        <form @submit.prevent="createActivity" class="p-fluid">
          <div class="field">
            <label for="activity">Activity Name</label>
            <InputText id="activity" v-model="newActivity.activity" placeholder="e.g., Running, Yoga, Reading" />
          </div>
          <div class="field">
            <label for="duration">Duration (minutes)</label>
            <InputNumber id="duration" v-model="newActivity.duration" placeholder="e.g., 30" />
          </div>
          <div class="field">
            <label for="notes">Notes</label>
            <Textarea id="notes" v-model="newActivity.notes" rows="3" autoResize placeholder="Any additional details or reflections" />
          </div>
          <Button type="submit" label="Log Activity" class="p-button-raised p-button-rounded custom-button" />
        </form>
      </div>
    </div>

    <div class="activity-list">
      <h2>Your Recent Activities</h2>
      <div class="activity-grid">
        <div v-for="activity in activities" :key="activity.id" class="activity-item">
          <h3>{{ formatDate(activity.date) }}</h3>
          <p><strong>{{ activity.activity }}</strong></p>
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
import { format, parseISO } from 'date-fns'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'

interface Activity {
  id: number;
  date: string;
  activity: string;
  duration?: number;
  notes?: string;
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

const formatDate = (dateString: string) => {
  const date = parseISO(dateString)
  return format(date, 'PPP p')
}

const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

onMounted(getActivities)
</script>

<style scoped>
.activity-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--surface-ground);
  color: var(--text-color);
}

.top-section {
  display: grid;
  grid-template-columns: 1fr 500px;
  gap: 12rem;
  margin-bottom: 5rem;
  align-items: start;
}

.header-welcome {
  display: flex;
  flex-direction: column;
}

.activity-input {
  align-self: end;
  margin-top: 3rem;
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

.activity-input, .activity-item {
  background-color: var(--surface-card);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #1b968a;
}

.activity-input h2 {
  color: var(--primary-color);
  margin-bottom: 1rem;
  margin-top: 0;
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
  margin-top: 3rem;
}

.activity-list h2 {
  color: var(--primary-color);
  margin-bottom: 2rem;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  width: 100%;
}

.activity-item {
  text-align: center;
  transition: transform 0.3s ease;
}

.activity-item:hover {
  transform: translateY(-5px);
}

.activity-item h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.activity-item p {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

@media (max-width: 1024px) {
  .top-section {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .activity-input {
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 2.5rem;
  }
}
</style>