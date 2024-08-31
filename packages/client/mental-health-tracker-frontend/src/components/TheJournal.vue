<template>
    <div class="journal-view">
      <h2>Journal</h2>
      <div class="journal-input">
        <h3>New Journal Entry</h3>
        <textarea v-model="newEntry.entry" placeholder="Write your journal entry here..."></textarea>
        <Button label="Save Entry" @click="createJournalEntry" />
      </div>
      <div class="journal-list">
        <h3>Your Recent Entries</h3>
        <ul>
          <li v-for="entry in journalEntries" :key="entry.id">
            Date: {{ entry.date }}, Sentiment: {{ entry.sentiment }}
            <p>{{ entry.entry }}</p>
          </li>
        </ul>
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { trpc } from '../utils/trpc'
  import Button from 'primevue/button'

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

  const getJournalEntries = async () => {
    try {
      journalEntries.value = await trpc.journalEntry.getJournalEntries.query()
    } catch (error) {
      console.error('Failed to fetch journal entries:', error)
    }
  }
  
  const createJournalEntry = async () => {
    try {
      await trpc.journalEntry.createJournalEntry.mutate({
        date: new Date().toISOString().split('T')[0],
        entry: newEntry.value.entry
      })
      await getJournalEntries()
      newEntry.value.entry = ''
    } catch (error) {
      console.error('Failed to create journal entry:', error)
    }
  }
  
  onMounted(getJournalEntries)
  </script>
