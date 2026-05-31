<template>
  <div class="page">
    <h2>Create KPI Scorecard</h2>
    <FormControl label="Employee">
      <Input v-model="form.employee" />
    </FormControl>
    <FormControl label="Period Start">
      <input type="date" v-model="form.period_start" />
    </FormControl>
    <FormControl label="Period End">
      <input type="date" v-model="form.period_end" />
    </FormControl>
    <Button @click="create">Create</Button>
  </div>
</template>

<script>
import { reactive } from "vue"
import { frappeRequest } from "frappe-ui"

export default {
  name: "KPIForm",
  setup() {
    const form = reactive({ employee: "", period_start: "", period_end: "" })

    const create = async () => {
      try {
        const res = await frappeRequest({ method: "POST", url: "/api/method/hrms.api.kpi.create_scorecard", data: form })
        alert("Scorecard created: " + res?.data)
        window.location.href = "/hrms/kpi-scorecards"
      } catch (e) {
        console.error(e)
        alert("Create failed")
      }
    }

    return { form, create }
  },
}
</script>

<style scoped>
.page { padding: 16px }
</style>
