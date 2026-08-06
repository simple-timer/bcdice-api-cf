import { type InferOutput, object, string } from "valibot";

export const postGameSystemRollBodySchema = object({
	command: string(),
});

export type PostGameSystemRollBody = InferOutput<
	typeof postGameSystemRollBodySchema
>;
