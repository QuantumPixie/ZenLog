<template>
    <div class="activities-view">
      <h2>Activities</h2>
      <div class="activity-input">
        <h3>Log New Activity</h3>
        <input v-model="newActivity.activity" placeholder="Activity Name">
        <input v-model="newActivity.duration" type="number" placeholder="Duration (minutes)">
        <input v-model="newActivity.notes" placeholder="Notes">
        <Button label="Log Activity" @click="createActivity" />
      </div>
      <div class="activity-list">
        <h3>Your Recent Activities</h3>
        <ul>
          <li v-for="activity in activities" :key="activity.id">
            Date: {{ activity.date }}, Activity: {{ activity.activity }}, Duration: {{ activity.duration }} minutes
            <p>Notes: {{ activity.notes }}</p>
          </li>
        </ul>
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { trpc } from '../utils/trpc'
  import Button from 'primevue/button'

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
    duration: undefined,
    notes: ''
  })


  const getActivities = async () => {
    try {
      activities.value = await trpc.activity.getActivities.query()
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    }
  }

  const createActivity = async () => {
    try {
      await trpc.activity.createActivity.mutate({
        date: new Date().toISOString().split('T')[0],
        ...newActivity.value
      })
      await getActivities()
      newActivity.value = { activity: '', duration: undefined, notes: '' }
    } catch (error) {
      console.error('Failed to create activity:', error)
    }
  }

  onMounted(getActivities)
  </script>
