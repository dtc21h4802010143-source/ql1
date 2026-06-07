<template>
  <div class="page">
    <h2>{{ isEdit ? 'Edit Task' : 'Create Task' }}</h2>
    <FormControl label="Subject">
      <Input v-model="form.subject" placeholder="Short, descriptive title" />
      <div v-if="errors.subject" class="error">{{ errors.subject }}</div>
    </FormControl>
    <FormControl label="Description">
      <textarea v-model="form.description" rows="4" class="textarea" placeholder="Details, acceptance criteria"></textarea>
    </FormControl>
    <FormControl label="Due Date">
      <input type="date" v-model="form.due_date" />
      <div v-if="errors.due_date" class="error">{{ errors.due_date }}</div>
    </FormControl>
    <FormControl label="Priority">
      <select v-model="form.priority">
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
        <option>Critical</option>
      </select>
    </FormControl>
    <FormControl label="Project">
      <select v-model="form.project">
        <option value="">-- none --</option>
        <option v-for="p in projects.list" :key="p.name" :value="p.name">{{ p.project_name || p.name }}</option>
      </select>
    </FormControl>

    <FormControl label="Assigned To (select multiple)">
      <select v-model="form.assigned_to" multiple>
        <option v-for="u in users.list" :key="u.name" :value="u.name">{{ u.full_name || u.name }}</option>
      </select>
    </FormControl>

    <FormControl label="Estimated Hours">
      <Input type="number" v-model="form.estimated_hours" />
    </FormControl>

    <div class="actions">
      <Button @click="save" :disabled="!isValid" :variant="isValid ? 'primary' : 'disabled'">Save</Button>
      <Button @click="cancel" :variant="'tertiary'">Cancel</Button>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from "vue"
import { frappeRequest } from "frappe-ui"

export default {
  name: "TaskForm",
  props: {
    docName: { type: String, default: null },
  },
  setup(props) {
    const form = reactive({ subject: "", description: "", due_date: "", priority: "Medium", project: "", assigned_to: [], estimated_hours: 0 })
    const users = reactive({ list: [] })
    const projects = reactive({ list: [] })
    const isEdit = !!props.docName

    const loadOptions = async () => {
      try {
        const u = await frappeRequest({ url: "/api/resource/User?fields=[\"name\",\"full_name\"]&limit_page_length=200" })
        users.list = u?.data?.data || []
      } catch (e) {
        console.warn("Failed to load users", e)
      }

      try {
        const p = await frappeRequest({ url: "/api/resource/Project?fields=[\"name\",\"project_name\"]&limit_page_length=200" })
        projects.list = p?.data?.data || []
      } catch (e) {
        console.warn("Failed to load projects", e)
      }
    }

    const load = async () => {
      if (isEdit) {
        const res = await frappeRequest({ url: `/api/resource/Task/${props.docName}` })
        Object.assign(form, res.data.data)
        // normalize assigned_to if present
        if (form.assigned_to && Array.isArray(form.assigned_to)) {
          form.assigned_to = form.assigned_to.map((a) => a.user || a)
        }
      }
    }

    const errors = reactive({ subject: "", due_date: "" })

    const validate = () => {
      errors.subject = ""
      errors.due_date = ""
      let ok = true
      if (!form.subject || !form.subject.trim()) {
        errors.subject = "Subject is required"
        ok = false
      }
      if (!form.due_date) {
        errors.due_date = "Due date is required"
        ok = false
      }
      return ok
    }

    const save = async () => {
      if (!validate()) return
      try {
        const payload = { ...form }
        // send assigned_to as list of links
        if (payload.assigned_to && Array.isArray(payload.assigned_to)) {
          payload.assigned_to = payload.assigned_to.map((u) => ({ user: u }))
        }

        if (isEdit) {
          await frappeRequest({ method: "PUT", url: `/api/resource/Task/${props.docName}`, data: payload })
        } else {
          await frappeRequest({ method: "POST", url: "/api/resource/Task", data: payload })
        }
        alert("Saved")
        window.history.back()
      } catch (e) {
        console.error(e)
        alert("Save failed")
      }
    }

    loadOptions()
    load()

    const cancel = () => window.history.back()

    const isValid = () => validate()

    return { ...toRefs(form), form, isEdit, users, projects, save, errors, cancel, isValid }
  },
}
</script>

<style scoped>
.page { padding: 16px }
.textarea { width: 100%; }
</style>
