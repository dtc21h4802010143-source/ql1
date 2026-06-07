import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const palette = ["#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#f59e0b"];

export const KpiChart = ({ scores = [] }) => {
	const data = scores.map((item, index) => ({
		label: item.label,
		value: Number(item.value || 0),
		color: palette[index % palette.length]
	}));

	return (
		<ResponsiveContainer width="100%" height={220}>
			<BarChart data={data} margin={{ top: 8, right: 0, left: -16, bottom: 0 }}>
				<XAxis dataKey="label" tickLine={false} axisLine={false} />
				<YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
				<Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.12)" }} formatter={(value) => [`${value}/100`, "Score"]} />
				<Bar dataKey="value" radius={[10, 10, 0, 0]}>
					{data.map((entry) => <Cell key={entry.label} fill={entry.color} />)}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
};