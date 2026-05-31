import React from "react";
import { cn } from "../../lib/utils";

export const Select = React.forwardRef(({ className, children, ...props }, ref) => (
	<select ref={ref} className={cn("flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring", className)} {...props}>
		{children}
	</select>
));

Select.displayName = "Select";