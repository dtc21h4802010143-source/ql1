<template>
  <div class="page">
    <h2>My KPIs</h2>
    <div v-if="loading">Loading...</div>
    <ul v-else>
      <li v-for="k in kpis" :key="k.name">{{ k.title }} — target: {{ k.target_value }}{{ k.unit }} (weight: {{ k.weight }})</li>
    </ul>
    <Button @click="reload">Refresh</Button>
  </div>
</template>

<script>
import { ref } from "vue"
import { frappeRequest } from "frappe-ui"

export default {
  name: "MyKPIs",
  setup() {
    const kpis = ref([])
    const loading = ref(false)

    const load = async () => {
      loading.value = true
      try {
        const res = await frappeRequest({ url: "/api/method/hrms.api.kpi.get_kpis" })
        kpis.value = res?.data || []
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    load()

    return { kpis, loading, reload: load }
  },
}
</script>

<style scoped>
.page { padding: 16px }
</style>
