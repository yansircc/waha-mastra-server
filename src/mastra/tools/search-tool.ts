import { cohere } from "@ai-sdk/cohere";
import { openai } from "@ai-sdk/openai";
import { createTool } from "@mastra/core";
import { QdrantVector } from "@mastra/qdrant";
import { rerank } from "@mastra/rag";
import { embed } from "ai";
import { z } from "zod";

const qdrant = new QdrantVector(
	process.env.QDRANT_URL ?? "",
	process.env.QDRANT_API_KEY ?? "",
);

// Define input and output schemas
const searchInputSchema = z.object({
	query: z
		.string()
		.describe(
			"The search query to find relevant information, you need to rewrite the query to be more specific and professional",
		),
});

const searchOutputSchema = z.array(z.string().describe("The search results"));

export const searchTool = createTool({
	id: "searchKnowledgeBase",
	description: "Search through the knowledge base to find relevant information",
	inputSchema: searchInputSchema,
	outputSchema: searchOutputSchema,
	execute: async ({ context }) => {
		// 1. Generate embedding for the query
		const { embedding } = await embed({
			value: context.query,
			model: cohere.embedding("embed-multilingual-v3.0"),
		});

		if (!embedding) {
			throw new Error("Failed to generate query embedding");
		}

		// 2. Search in Qdrant
		const initialResults = await qdrant.query({
			indexName: "waha",
			queryVector: embedding,
			topK: 10, // Get more results for reranking
		});

		if (!initialResults?.length) {
			return [];
		}

		// 3. Rerank results
		const rerankedResults = await rerank(
			initialResults,
			context.query,
			openai("gpt-4o-mini"),
			{
				topK: 3,
			},
		);

		const results = rerankedResults.map(
			(data) => data.result?.metadata?.text,
		) as string[];

		return results;
	},
});
