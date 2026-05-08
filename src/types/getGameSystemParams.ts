import { z } from "zod";

export const getGameSystemParamsSchema = z.object({
	id: z.string(),
});

export type GetGameSystemParams = z.infer<typeof getGameSystemParamsSchema>;
