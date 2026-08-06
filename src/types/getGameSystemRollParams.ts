import { z } from "zod/mini";

export const getGameSystemRollParamsSchema = z.object({
	id: z.string(),
});

export type GetGameSystemRollParams = z.infer<
	typeof getGameSystemRollParamsSchema
>;
