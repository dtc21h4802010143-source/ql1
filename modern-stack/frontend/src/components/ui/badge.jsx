import React from "react";
import { cn } from "../../lib/utils";

export const Badge = ({ className, variant = "default", ...props }) => {
	const variants = {
		default: "bg-primary/10 text-primary",
		secondary: "bg-muted text-foreground",
		outline: "border border-border text-foreground"
	};

	return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", variants[variant], className)} {...props} />;
};