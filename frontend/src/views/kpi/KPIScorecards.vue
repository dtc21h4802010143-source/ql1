<template>
  <div class="page">
    <h2>KPI Scorecards</h2>
    <div v-if="loading">Loading...</div>
    <ul v-else>
      <li v-for="s in scorecards" :key="s.name">{{ s.employee }} — {{ s.total_score }}%</li>
    </ul>
    <Button @click="create">Create Scorecard</Button>
  </div>
</template>

<script>
import { ref } from "vue"
import { frappeRequest } from "frappe-ui"

export default {
  name: "KPIScorecards",
  setup() {
    const scorecards = ref([])
    const loading = ref(false)

    const load = async () => {
      loading.value = true
      try {
        const res = await frappeRequest({ url: "/api/resource/KPI Scorecard?fields=[\"name\",\"employee\",\"total_score\"]&limit_page_length=100" })
        scorecards.value = res?.data?.data || []
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    const create = () => { window.location.href = "/hrms/my-kpis/create" }

    load()
    return { scorecards, loading, create }
  },
}
</script>

<style scoped>
.page { padding: 16px }
</style>
