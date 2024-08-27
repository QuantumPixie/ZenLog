<template>
  <div class="journal">
    <h2>Journal</h2>
    <form @submit.prevent="addEntry">
      <div class="p-fluid">
        <div class="field">
          <label for="title">Entry Title</label>
          <InputText id="title" v-model="title" required />
        </div>
        <div class="field">
          <label for="content">Your thoughts...</label>
          <Textarea id="content" v-model="content" rows="5" autoResize required />
        </div>
        <Button type="submit" label="Add Entry" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'

const title = ref('')
const content = ref('')

const addEntry = () => {
  // Implement journal entry adding logic here
  console.log('Journal entry added:', title.value, content.value)
}
</script>