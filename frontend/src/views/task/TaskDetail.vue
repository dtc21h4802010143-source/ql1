<template>
  <div class="page">
    <h2>Task Detail</h2>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <h3>{{ task.subject }}</h3>
      <p>{{ task.description }}</p>
      <p>Status: {{ task.status }} | Priority: {{ task.priority }}</p>
      <p>Due: {{ task.due_date }}</p>

      <h4>Time Logs</h4>
      <ul>
        <li v-for="t in time_logs" :key="t.name">{{ t.user }} — {{ t.hours }}h</li>
      </ul>

        <h4>Comments</h4>
        <ul>
          <li v-for="c in comments" :key="c.name">
            <strong>{{ c.owner }}</strong>
            <small class="muted"> — {{ c.creation ? new Date(c.creation).toLocaleString() : '' }}</small>
            <div>{{ c.content }}</div>
          </li>
        </ul>
        <div v-if="comment_has_more">
          <Button @click="loadComments(comment_page + 1)">Load more comments</Button>
        </div>
        <FormControl label="Add comment">
          <Input v-model="new_comment" placeholder="Write a comment..." />
          <Button @click="postComment">Post</Button>
        </FormControl>

        <h4>Attachments</h4>
        <ul>
          <li v-for="a in attachments" :key="a.name"><a :href="a.file_url" target="_blank">{{ a.file_name }}</a></li>
        </ul>
        <input type="file" @change="uploadFile" />

      <Button @click="edit">Edit</Button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue"
import { frappeRequest } from "frappe-ui"

export default {
  name: "TaskDetail",
  props: ["name"],
  setup(props) {
    const task = ref({})
    const time_logs = ref([])
    const comments = ref([])
    const new_comment = ref("")
    const comment_page = ref(0)
    const comment_page_size = 10
    const comment_has_more = ref(false)
    const attachments = ref([])
    const loading = ref(true)

    const load = async () => {
      loading.value = true
      try {
        const res = await frappeRequest({ url: `/api/resource/Task/${props.name}` })
        task.value = res.data.data
        const tl = await frappeRequest({ url: `/api/resource/Time Log?filters=[["Time Log","task","=","${props.name}"]]` })
        time_logs.value = tl?.data?.data || []

        // initial comments (paginated)
        comments.value = []
        comment_page.value = 0
        await loadComments(1)

        // attachments (File doctype)
        try {
          const af = await frappeRequest({ url: `/api/resource/File?filters=[["File","attached_to_name","=","${props.name}"]]&limit_page_length=200` })
          attachments.value = af?.data?.data || []
        } catch (e) {
          attachments.value = []
        }
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    const loadComments = async (page = 1) => {
      try {
        const start = (page - 1) * comment_page_size
        const url = `/api/resource/Comment?filters=[["Comment","reference_doctype","=","Task"],["Comment","reference_name","=","${props.name}"]]&limit_start=${start}&limit_page_length=${comment_page_size}&orderby=creation%20desc`
        const res = await frappeRequest({ url })
        const data = res?.data?.data || []
        if (page === 1) comments.value = data
        else comments.value = comments.value.concat(data)
        comment_page.value = page
        comment_has_more.value = (data.length === comment_page_size)
      } catch (e) {
        console.error(e)
      }
    }

    const edit = () => {
      window.location.href = `/hrms/tasks/create?name=${props.name}`
    }

    const postComment = async () => {
      if (!new_comment.value) return
      try {
        await frappeRequest({ method: "POST", url: "/api/resource/Comment", data: { reference_doctype: "Task", reference_name: props.name, comment_type: "Comment", content: new_comment.value } })
        new_comment.value = ""
        await loadComments(1)
      } catch (e) {
        console.error(e)
        alert("Failed to post comment")
      }
    }

    const uploadFile = async (ev) => {
      const file = ev.target.files[0]
      if (!file) return
      const formData = new FormData()
      formData.append("file", file)
      formData.append("doctype", "Task")
      formData.append("docname", props.name)

      try {
        const res = await fetch("/api/method/upload_file", { method: "POST", body: formData, credentials: "same-origin" })
        const data = await res.json()
        if (data && !data.exc) {
          alert("Uploaded")
          await load()
        } else {
          console.error(data)
          alert("Upload failed")
        }
      } catch (e) {
        console.error(e)
        alert("Upload failed")
      }
    }

    onMounted(load)
    return { task, time_logs, comments, new_comment, attachments, loading, edit, postComment, uploadFile, loadComments, comment_has_more, comment_page }
  },
}
</script>

<style scoped>
.page { padding: 16px }
</style>
