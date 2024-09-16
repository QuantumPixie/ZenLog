<template>
  <div class="mood-view">
    <div class="top-section">
      <div class="header-welcome">
        <h1 class="welcome-title">
          <span>Mood Tracker</span>
          <i class="pi pi-heart custom-icon"></i>
        </h1>
        <ul class="welcome-message">
          <li>Log your daily emotions to gain insights into your mental state.</li>
          <li>Select your moods from the list or add custom emotions.</li>
          <li>Choose an overall mood score (1-10) that reflects your emotions.</li>
          <li>Track your mood patterns over time.</li>
        </ul>
      </div>
      <div class="mood-input">
        <h2>Log Your Mood</h2>
        <form class="p-fluid" @submit.prevent="createMood">
          <div class="field">
            <label for="mood_score">Overall Mood Score (1-10)</label>
            <InputNumber
              id="mood_score"
              v-model="newMood.mood_score"
              :min="1"
              :max="10"
              placeholder="Enter mood score"
            />
          </div>
          <div class="field">
            <label for="emotions">Emotions</label>
            <MultiSelect
              v-model="selectedEmotions"
              :options="emotionOptions"
              option-label="name"
              placeholder="Select Emotions"
              :filter="true"
              :show-clear="true"
              display="chip"
            >
              <template #footer>
                <Button
                  label="Add Custom"
                  icon="pi pi-plus"
                  class="p-button-text"
                  @click="addCustomEmotion"
                />
              </template>
            </MultiSelect>
          </div>
          <Button
            type="submit"
            label="Log Mood"
            class="p-button-raised p-button-rounded custom-button"
          />
        </form>
      </div>
    </div>

    <div class="mood-list">
      <h2>Your Recent Moods</h2>
      <div class="mood-grid">
        <div v-for="mood in moods" :key="mood.id" class="mood-item">
          <h3>{{ formatDate(mood.date) }}</h3>
          <p>
            Score:
            {{
              mood.mood_score !== null && mood.mood_score !== undefined ? mood.mood_score : 'N/A'
            }}
          </p>
          <p>
            Emotions: {{ Array.isArray(mood.emotions) ? mood.emotions.join(', ') : mood.emotions }}
          </p>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="displayCustomEmotionDialog" header="Add Custom Emotion" :modal="true">
      <InputText v-model="customEmotion" placeholder="Enter custom emotion" />
      <template #footer>
        <Button label="Add" icon="pi pi-check" autofocus @click="confirmCustomEmotion" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { trpc } from '../utils/trpc'
import { useAuthStore } from '../stores/authStore'
import InputNumber from 'primevue/inputnumber'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import { formatDate } from '../utils/dateUtils'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

interface Mood {
  id: number
  date: string
  mood_score: number | null
  emotions: string[] | string
}

interface EmotionOption {
  name: string
  code: string
}

const moods = ref<Mood[]>([])
const newMood = ref({
  mood_score: null as number | null
})

const selectedEmotions = ref<EmotionOption[]>([])
const emotionOptions = ref<EmotionOption[]>([
  { name: 'Happy', code: 'happy' },
  { name: 'Sad', code: 'sad' },
  { name: 'Angry', code: 'angry' },
  { name: 'Excited', code: 'excited' },
  { name: 'Anxious', code: 'anxious' },
  { name: 'Calm', code: 'calm' }
])

const displayCustomEmotionDialog = ref(false)
const customEmotion = ref('')

// Fetch moods from the server
const getMoods = async () => {
  try {
    const fetchedMoods = await trpc.mood.getMoods.query()
    console.log('Fetched moods:', fetchedMoods)
    moods.value = fetchedMoods.map((mood) => ({
      ...mood,
      mood_score: mood.mood_score ?? null,
      emotions: Array.isArray(mood.emotions) ? mood.emotions : [mood.emotions],
      date: mood.date
    }))
    console.log('Processed moods:', moods.value)
  } catch (error) {
    console.error('Failed to fetch moods:', error)
    if (error instanceof Error && error.message.includes('You must be logged in')) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please log in to view your moods',
        life: 5000
      })
      authStore.logout(router)
      router.push('/login-signup')
    }
  }
}

const createMood = async () => {
  if (newMood.value.mood_score === null) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Mood score is required', life: 3000 })
    return
  }

  try {
    const now = new Date()
    const isoDate = now.toISOString()

    const createdMood = await trpc.mood.createMood.mutate({
      date: isoDate,
      mood_score: newMood.value.mood_score,
      emotions: selectedEmotions.value.map((e) => e.name)
    })
    console.log('Created mood:', createdMood)
    await getMoods()
    newMood.value.mood_score = null
    selectedEmotions.value = []
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Mood logged successfully',
      life: 3000
    })
  } catch (error) {
    console.error('Failed to create mood:', error)
    if (error instanceof Error && error.message.includes('You must be logged in')) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please log in to log your mood',
        life: 5000
      })
      authStore.logout(router)
      router.push('/login-signup')
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to log mood', life: 3000 })
    }
  }
}

const addCustomEmotion = () => {
  displayCustomEmotionDialog.value = true
}

const confirmCustomEmotion = () => {
  if (customEmotion.value) {
    const newEmotionOption = {
      name: customEmotion.value,
      code: customEmotion.value.toLowerCase().replace(/\s+/g, '_')
    }
    emotionOptions.value.push(newEmotionOption)
    selectedEmotions.value.push(newEmotionOption)
    customEmotion.value = ''
    displayCustomEmotionDialog.value = false
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    await authStore.checkAuth()
  }
  if (authStore.isAuthenticated) {
    await getMoods()
  } else {
    toast.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Please log in to view your moods',
      life: 5000
    })
    router.push('/login-signup')
  }
})
</script>

<style scoped>
.mood-view {
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

.mood-input {
  align-self: end;
  margin-top: 3rem;
}

.welcome-title {
  font-size: 3.3rem;
  color: var(--primary-color);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.custom-icon {
  color: #1b968a;
  margin-left: 0.5rem;
  font-size: 3rem;
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

.mood-input,
.mood-item {
  background-color: var(--surface-card);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #3a7e77;
}

.mood-input h2 {
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

.p-button-label {
  flex: 1 1 auto;
  color: black;
}

.p-inputnumber,
.p-multiselect {
  width: 100%;
}

.custom-button {
  margin-top: 1rem;
  background-color: #3a7e77 !important;
  border-color: #3a7e77 !important;
}

.custom-button:hover {
  background-color: #3ccdc2 !important;
  border-color: #3ccdc2 !important;
}

.mood-list {
  margin-top: 3rem;
}

.mood-list h2 {
  color: var(--primary-color);
  margin-bottom: 2rem;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  width: 100%;
}

.mood-item {
  text-align: center;
  transition: transform 0.3s ease;
}

.mood-item:hover {
  transform: translateY(-5px);
}

.mood-item h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.mood-item p {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

@media (max-width: 1024px) {
  .top-section {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .mood-input {
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 2.5rem;
  }
}
</style>
