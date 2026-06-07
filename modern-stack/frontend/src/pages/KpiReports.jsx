import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from "recharts";
import { useTranslation } from "../lib/i18n";

export const KpiReports = () => {
  const { t } = useTranslation();
  const [ranking, setRanking] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/kpi-rankings').then(({ data }) => setRanking(data || []));
    api.get('/dashboard/summary').then(({ data }) => setSummary(data));
  }, []);

  const barData = ranking.map((r) => ({ name: r.fullName, score: Number(r.finalScore) }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('pages.kpiReports.title') || 'KPI Reports'}</CardTitle>
              <CardDescription>{t('pages.kpiReports.description') || 'Overview and trends for KPI.'}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trend</CardTitle>
            <CardDescription>Final score trend for top employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={barData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Active period and top performers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Period: {summary?.period?.label || 'N/A'}</p>
              <div className="space-y-2">
                {ranking.slice(0,5).map((r) => (
                  <div key={r.userId} className="flex items-center justify-between rounded-2xl border border-border/60 p-3">
                    <div>
                      <p className="font-medium">{r.fullName}</p>
                      <p className="text-sm text-muted-foreground">{r.departmentName}</p>
                    </div>
                    <div className="text-lg font-semibold">{r.finalScore}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KpiReports;
