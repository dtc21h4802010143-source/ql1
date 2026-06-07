import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const frontendDist = path.join(rootDir, "modern-stack", "frontend", "dist");
const backendPublic = path.join(rootDir, "modern-stack", "backend", "src", "public");

const run = (command) => {
	console.log(`\n> ${command}`);
	execSync(command, { cwd: rootDir, stdio: "inherit" });
};

run("npm run install-modern-backend");
run("npm run install-modern-frontend");
run("npm --prefix modern-stack/frontend run build");

if (!existsSync(frontendDist)) {
	throw new Error(`Frontend build output not found at: ${frontendDist}`);
}

rmSync(backendPublic, { recursive: true, force: true });
cpSync(frontendDist, backendPublic, { recursive: true });

console.log("\nRender build assets copied successfully.");
