export const PageFrame = ({ title, description, children, actions }) => {
	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Module</p>
					<h1 className="mt-2 text-3xl font-semibold">{title}</h1>
					<p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p>
				</div>
				{actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
			</div>
			{children}
		</div>
	);
};