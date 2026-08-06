import { type InferOutput, object, string } from "valibot";

export const getGameSystemRollParamsSchema = object({
	id: string(),
});

export type GetGameSystemRollParams = InferOutput<
	typeof getGameSystemRollParamsSchema
>;
