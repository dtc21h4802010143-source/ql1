<template>
  <div class="page">
    <h2>Tasks</h2>
    <div v-if="loading">Loading...</div>
    <ul v-else>
      <li v-for="t in tasks" :key="t.name">{{ t.subject }} - {{ t.status }}</li>
    </ul>
    <Button @click="reload">Refresh</Button>
  </div>
</template>

<script>
import { ref } from "vue"
import { frappeRequest } from "frappe-ui"

export default {
  name: "Tasks",
  setup() {
    const tasks = ref([])
    const loading = ref(false)

    const load = async () => {
      loading.value = true
      try {
        const res = await frappeRequest({ url: "/api/resource/Task?fields=[\"name\",\"subject\",\"status\"]&limit_page_length=100" })
        tasks.value = res?.data?.data || []
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    load()

    return { tasks, loading, reload: load }
  },
}
</script>

<style scoped>
.page { padding: 16px }
</style>
