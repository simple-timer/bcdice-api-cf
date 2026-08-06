import { type InferOutput, object, string } from "valibot";

export const postOriginalTableBodySchema = object({
	table: string(),
});

export type PostOriginalTableBody = InferOutput<
	typeof postOriginalTableBodySchema
>;
