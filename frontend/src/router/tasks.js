const taskRoutes = [
  {
    path: "/tasks",
    name: "Tasks",
    component: () => import("@/views/task/Tasks.vue"),
  },
  {
    path: "/tasks/create",
    name: "TaskCreate",
    component: () => import("@/views/task/TaskForm.vue"),
  },
  {
    path: "/tasks/:name",
    name: "TaskDetail",
    component: () => import("@/views/task/TaskDetail.vue"),
  },
]

export default taskRoutes
