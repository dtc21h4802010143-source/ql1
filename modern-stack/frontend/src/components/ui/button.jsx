import React from "react";
import { cn } from "../../lib/utils";

export const Button = React.forwardRef(({ className, variant = "default", size = "md", ...props }, ref) => {
	const variants = {
		default: "bg-primary text-primary-foreground shadow-soft hover:opacity-95",
		secondary: "bg-muted text-foreground hover:bg-muted/80",
		ghost: "bg-transparent hover:bg-muted text-foreground",
		danger: "bg-red-600 text-white hover:bg-red-700"
	};

	const sizes = {
		sm: "h-9 px-3 text-sm",
		md: "h-10 px-4 text-sm",
		lg: "h-11 px-5 text-base"
	};

	return (
		<button
			ref={ref}
			className={cn("inline-flex items-center justify-center rounded-xl font-medium transition-all disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className)}
			{...props}
		/>
	);
});

Button.displayName = "Button";