<template>
  <div class="mood-view">
    <h2>Mood Tracker</h2>
    
    <!-- Mood Input Section -->
    <div class="mood-input">
      <h3>Log Your Mood</h3>
      <form @submit.prevent="createMood" class="p-fluid">
        <div class="field">
          <label for="mood_score">Overall Mood Score (1-10)</label>
          <InputNumber id="mood_score" v-model="newMood.mood_score" :min="1" :max="10" />
        </div>
        <div class="field">
          <label for="emotions">Emotions</label>
          <MultiSelect
            id="emotions"
            v-model="selectedEmotions"
            :options="emotionOptions"
            optionLabel="name"
            placeholder="Select Emotions"
            :filter="true"
            :showClear="true"
          >
            <template #footer>
              <Button label="Add Custom" icon="pi pi-plus" @click="addCustomEmotion" />
            </template>
          </MultiSelect>
        </div>
        <Button type="submit" label="Log Mood" />
      </form>
    </div>

    <!-- Mood List Section -->
    <div class="mood-list">
      <h3>Your Recent Moods</h3>
      <ul>
        <li v-for="mood in moods" :key="mood.id">
          Date: {{ formatDate(mood.date) }}, 
          Score: {{ mood.mood_score !== null && mood.mood_score !== undefined ? mood.mood_score : 'N/A' }}, 
          Emotions: {{ Array.isArray(mood.emotions) ? mood.emotions.join(', ') : mood.emotions }}
        </li>
      </ul>
    </div>

    <!-- Dialog for custom emotion input -->
    <Dialog v-model:visible="displayCustomEmotionDialog" header="Add Custom Emotion" :modal="true">
      <InputText v-model="customEmotion" placeholder="Enter custom emotion" />
      <template #footer>
        <Button label="Add" icon="pi pi-check" @click="confirmCustomEmotion" autofocus />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { trpc } from '../utils/trpc'
import { format, parseISO } from 'date-fns'
import InputNumber from 'primevue/inputnumber'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'

interface Mood {
  id: number;
  date: string;
  mood_score: number | null; // Allow for null in case it's not set
  emotions: string[] | string;
}

interface EmotionOption {
  name: string;
  code: string;
}

const moods = ref<Mood[]>([])
const newMood = ref({
  mood_score: 5,
})

const selectedEmotions = ref<EmotionOption[]>([])
const emotionOptions = ref<EmotionOption[]>([
  { name: 'Happy', code: 'happy' },
  { name: 'Sad', code: 'sad' },
  { name: 'Angry', code: 'angry' },
  { name: 'Excited', code: 'excited' },
  { name: 'Anxious', code: 'anxious' },
  { name: 'Calm', code: 'calm' },
])

const displayCustomEmotionDialog = ref(false)
const customEmotion = ref('')

const getMoods = async () => {
  try {
    const fetchedMoods = await trpc.mood.getMoods.query()
    console.log('Fetched moods:', fetchedMoods) // Debug log
    moods.value = fetchedMoods.map(mood => ({
      ...mood,
      mood_score: mood.mood_score ?? null, // Use null if mood_score is undefined
      emotions: Array.isArray(mood.emotions) ? mood.emotions : [mood.emotions]
    }))
    console.log('Processed moods:', moods.value) // Debug log
  } catch (error) {
    console.error('Failed to fetch moods:', error)
  }
}

const createMood = async () => {
  try {
    const createdMood = await trpc.mood.createMood.mutate({
      date: new Date().toISOString(),
      mood_score: newMood.value.mood_score,
      emotions: selectedEmotions.value.map(e => e.name)
    })
    console.log('Created mood:', createdMood) // Debug log
    await getMoods()
    newMood.value.mood_score = 5
    selectedEmotions.value = []
  } catch (error) {
    console.error('Failed to create mood:', error)
  }
}

const formatDate = (dateString: string) => {
  const date = parseISO(dateString)
  return format(date, 'PPP p') // e.g., "Apr 29, 2023, 3:00 PM"
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

onMounted(getMoods)
</script>

<style scoped>
.mood-view {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.mood-input, .mood-list {
  margin-bottom: 30px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
}

.field {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

.p-inputnumber, .p-multiselect {
  width: 100%;
}

.p-button {
  margin-top: 1rem;
}
</style>