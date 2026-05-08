import { z } from "zod";

export const postOriginalTableBodySchema = z.object({
	table: z.string(),
});

export type PostOriginalTableBody = z.infer<typeof postOriginalTableBodySchema>;
