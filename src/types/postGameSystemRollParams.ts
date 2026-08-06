import { type InferOutput, object, string } from "valibot";

export const postGameSystemRollParamsSchema = object({
	id: string(),
});

export type PostGameSystemRollParams = InferOutput<
	typeof postGameSystemRollParamsSchema
>;
