const kpiRoutes = [
  {
    path: "/my-kpis",
    name: "MyKPIs",
    component: () => import("@/views/kpi/MyKPIs.vue"),
  },
  {
    path: "/my-kpis/create",
    name: "KPICreate",
    component: () => import("@/views/kpi/KPIForm.vue"),
  },
  {
    path: "/kpi-scorecards",
    name: "KPIScorecards",
    component: () => import("@/views/kpi/KPIScorecards.vue"),
  },
]

export default kpiRoutes
