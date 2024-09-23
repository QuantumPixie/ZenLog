<template>
  <div class="journal-view">
    <div class="top-section">
      <div class="header-welcome">
        <h1 class="welcome-title">
          <span>Journal</span>
          <i class="pi pi-book custom-icon"></i>
        </h1>
        <ul class="welcome-message">
          <li>Record your thoughts, experiences, and reflections.</li>
          <li>Track your emotional journey over time.</li>
          <li>Gain insights into your mental well-being.</li>
          <li>Express yourself freely in a safe, private space.</li>
          <li>Receive an AI-generated sentiment score for each entry.</li>
        </ul>
      </div>
      <div class="journal-input">
        <h2>New Journal Entry</h2>
        <form class="p-fluid" @submit.prevent="createJournalEntry">
          <div class="field">
            <label for="entry">Your Thoughts</label>
            <Textarea
              id="entry"
              v-model="newEntry.entry"
              rows="6"
              auto-resize
              placeholder="Write your journal entry here..."
            />
          </div>
          <Button
            type="submit"
            label="Save Entry"
            class="p-button-raised p-button-rounded custom-button"
          />
        </form>
      </div>
    </div>

    <div class="journal-list">
      <h2>Your Recent Entries</h2>
      <div class="journal-grid">
        <div v-for="entry in journalEntries" :key="entry.id" class="journal-item">
          <h3>{{ formatDate(entry.date) }}</h3>
          <p>Sentiment Score: {{ formatSentiment(entry.sentiment) }}</p>
          <p>{{ truncateText(entry.entry, 150) }}</p>
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
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'

interface JournalEntry {
  id: number
  date: string
  sentiment: number
  entry: string
}

const journalEntries = ref<JournalEntry[]>([])
const newEntry = ref({
  entry: ''
})
const toast = useToast()

const getJournalEntries = async () => {
  try {
    const fetchedEntries = await trpc.journalEntry.getJournalEntries.query()
    console.log('Fetched journal entries:', fetchedEntries)
    journalEntries.value = fetchedEntries.map((entry: JournalEntry) => ({
      ...entry,
      sentiment: Number(entry.sentiment)
    }))
    console.log('Processed journal entries:', journalEntries.value)
  } catch (error) {
    console.error('Failed to fetch journal entries:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch journal entries',
      life: 3000
    })
  }
}

const createJournalEntry = async () => {
  if (!newEntry.value.entry.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Journal entry is required',
      life: 3000
    })
    return
  }

  try {
    const createdEntry = await trpc.journalEntry.createJournalEntry.mutate({
      date: new Date().toISOString(),
      entry: newEntry.value.entry
    })
    console.log('Created journal entry:', createdEntry)
    await getJournalEntries()
    newEntry.value.entry = ''
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Journal entry created',
      life: 3000
    })
  } catch (error) {
    console.error('Failed to create journal entry:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create journal entry',
      life: 3000
    })
  }
}

const formatSentiment = (sentiment: number | string | null | undefined) => {
  if (sentiment === null || sentiment === undefined) {
    return 'N/A'
  }
  const numSentiment = Number(sentiment)
  return isNaN(numSentiment) ? 'Invalid' : numSentiment.toFixed(2)
}

const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

onMounted(getJournalEntries)
</script>

<style scoped>
.journal-view {
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

.journal-input {
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

.journal-input,
.journal-item {
  background-color: var(--surface-card);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid #1b968a;
}

.journal-input h2 {
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

.journal-list {
  margin-top: 3rem;
}

.journal-list h2 {
  color: var(--primary-color);
  margin-bottom: 2rem;
}

.journal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  width: 100%;
}

.journal-item {
  text-align: center;
  transition: transform 0.3s ease;
}

.journal-item:hover {
  transform: translateY(-5px);
}

.journal-item h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.journal-item p {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

@media (max-width: 1024px) {
  .top-section {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .journal-input {
    margin-top: 2rem;
  }
}

@media (min-width: 768px) {
  .journal-view {
    padding: 2rem;
  }

  .welcome-title {
    font-size: 2.5rem;
  }

  .custom-icon {
    font-size: 2.5rem;
  }

  .welcome-message {
    font-size: 1.2rem;
  }

  .journal-input,
  .journal-item {
    padding: 2rem;
  }

  .journal-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }
}

@media (min-width: 1024px) {
  .welcome-title {
    font-size: 3rem;
  }

  .custom-icon {
    font-size: 3rem;
  }

  .journal-input,
  .journal-item {
    border: 2px solid #1b968a;
  }

  .journal-input h2,
  .journal-list h2 {
    font-size: 1.8rem;
  }
}
</style>
