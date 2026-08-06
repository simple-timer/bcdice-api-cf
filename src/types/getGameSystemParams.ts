import { type InferOutput, object, string } from "valibot";

export const getGameSystemParamsSchema = object({
	id: string(),
});

export type GetGameSystemParams = InferOutput<typeof getGameSystemParamsSchema>;
