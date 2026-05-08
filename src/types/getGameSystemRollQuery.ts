import { z } from "zod";

export const getGameSystemRollQuerySchema = z.object({
	command: z.string(),
});

export type GetGameSystemRollQuery = z.infer<
	typeof getGameSystemRollQuerySchema
>;
