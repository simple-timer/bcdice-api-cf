import { z } from "zod";

export const postGameSystemRollBodySchema = z.object({
	command: z.string(),
});

export type PostGameSystemRollBody = z.infer<
	typeof postGameSystemRollBodySchema
>;
