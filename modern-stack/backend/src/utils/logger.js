const formatMeta = (meta) => {
	if (meta === undefined || meta === null) {
		return "";
	}

	if (typeof meta === "string") {
		return ` ${meta}`;
	}

	try {
		return ` ${JSON.stringify(meta)}`;
	} catch {
		return " [unserializable-meta]";
	}
};

const write = (level, message, meta) => {
	const timestamp = new Date().toISOString();
	const line = `[${timestamp}] [${level}] ${message}${formatMeta(meta)}`;

	if (level === "ERROR") {
		console.error(line);
		return;
	}

	console.log(line);
};

export const logger = {
	info(message, meta) {
		write("INFO", message, meta);
	},
	warn(message, meta) {
		write("WARN", message, meta);
	},
	error(message, meta) {
		write("ERROR", message, meta);
	}
};
