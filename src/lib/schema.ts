import { z } from "zod";

export const formSchema = z.object({
  age: z.string().min(1, "La edad es obligatoria"),
  weight: z.string().min(1, "El peso es obligatorio"),
  height: z.string().min(1, "La altura es obligatoria"),
  goal: z.string().min(1, "Elegí un objetivo"),
  level: z.string().min(1, "Elegí tu nivel"),
  place: z.string().min(1, "Elegí un lugar"),
  equipment: z.string().optional(),
  injuries: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;