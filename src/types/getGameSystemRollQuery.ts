import { z } from "zod/mini";

export const getGameSystemRollQuerySchema = z.object({
	command: z.string(),
});

export type GetGameSystemRollQuery = z.infer<
	typeof getGameSystemRollQuerySchema
>;
