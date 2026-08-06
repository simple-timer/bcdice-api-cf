import { type InferOutput, object, string } from "valibot";

export const getGameSystemRollQuerySchema = object({
	command: string(),
});

export type GetGameSystemRollQuery = InferOutput<
	typeof getGameSystemRollQuerySchema
>;
