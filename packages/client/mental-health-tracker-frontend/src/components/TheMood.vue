<!-- <template>
    <div class="mood-view">
      <h2>Mood Tracker</h2>
      <div class="mood-input">
        <h3>Log Your Mood</h3>
        <input v-model="newMood.mood_score" type="number" min="1" max="10" placeholder="Mood Score (1-10)">
        <input v-model="newMood.emotions" placeholder="Emotions (comma-separated)">
        <Button label="Log Mood" @click="createMood" />
      </div>
      <div class="mood-list">
        <h3>Your Recent Moods</h3>
        <ul>
          <li v-for="mood in moods" :key="mood.id">
            Date: {{ mood.date }}, Score: {{ mood.mood_score }}, Emotions: {{ mood.emotions.join(', ') }}
          </li>
        </ul>
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { trpc } from '../utils/trpc'
  import Button from 'primevue/button'

  interface Mood {
  id: number;
  date: string;
  mood_score: number;
  emotions: string[];
}

  const moods = ref<Mood[]>([])
  const newMood = ref({
    mood_score: 5,
    emotions: ''
  })

  const getMoods = async () => {
    try {
      moods.value = await trpc.mood.getMoods.query()
    } catch (error) {
      console.error('Failed to fetch moods:', error)
    }
  }

  const createMood = async () => {
    try {
      await trpc.mood.createMood.mutate({
        date: new Date().toISOString().split('T')[0],
        mood_score: newMood.value.mood_score,
        emotions: newMood.value.emotions.split(',').map(e => e.trim())
      })
      await getMoods()
      newMood.value = { mood_score: 5, emotions: '' }
    } catch (error) {
      console.error('Failed to create mood:', error)
    }
  }

  onMounted(getMoods)
  </script> -->
