<template>
  <div class="mood">
    <h2>Mood Tracker</h2>
    <form @submit.prevent="logMood">
      <div class="p-fluid">
        <div class="field">
          <label for="mood">How are you feeling?</label>
          <Dropdown id="mood" v-model="mood" :options="moodOptions" optionLabel="name" placeholder="Select a mood" class="w-full md:w-14rem" />
        </div>
        <div class="field">
          <label for="notes">Any notes about your mood?</label>
          <Textarea id="notes" v-model="notes" rows="3" autoResize />
        </div>
        <Button type="submit" label="Log Mood" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'

const mood = ref('')
const notes = ref('')
const moodOptions = [
  { name: 'Happy', code: 'happy' },
  { name: 'Sad', code: 'sad' },
  { name: 'Anxious', code: 'anxious' },
  { name: 'Excited', code: 'excited' },
  { name: 'Calm', code: 'calm' },
  { name: 'Angry', code: 'angry' }
]

const logMood = () => {
  // Implement mood logging logic here
  console.log('Mood logged:', mood.value, notes.value)
}
</script>