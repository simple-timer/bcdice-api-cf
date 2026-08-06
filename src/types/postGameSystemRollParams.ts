import { z } from "zod/mini";

export const postGameSystemRollParamsSchema = z.object({
	id: z.string(),
});

export type PostGameSystemRollParams = z.infer<
	typeof postGameSystemRollParamsSchema
>;
