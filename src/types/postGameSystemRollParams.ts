import { z } from "zod";

export const postGameSystemRollParamsSchema = z.object({
	id: z.string(),
});

export type PostGameSystemRollParams = z.infer<
	typeof postGameSystemRollParamsSchema
>;
