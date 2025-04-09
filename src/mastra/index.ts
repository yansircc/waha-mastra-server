import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";
import { ragAgent } from "./agents";

export const mastra = new Mastra({
	agents: { ragAgent },
	logger: createLogger({
		name: "Mastra",
		level: "info",
	}),
});
