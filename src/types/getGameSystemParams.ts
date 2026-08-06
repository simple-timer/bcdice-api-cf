import { z } from "zod/mini";

export const getGameSystemParamsSchema = z.object({
	id: z.string(),
});

export type GetGameSystemParams = z.infer<typeof getGameSystemParamsSchema>;
