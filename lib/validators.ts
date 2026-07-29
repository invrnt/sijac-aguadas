import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((value) => value || null);

export const juntaInput = z.object({
  code: z.string().trim().min(2, "Ingrese el código.").max(30),
  officialName: z.string().trim().min(4, "Ingrese el nombre oficial.").max(180),
  neighborhood: z.string().trim().min(2, "Ingrese la vereda o barrio.").max(120),
  zone: z.enum(["urbana", "rural"]),
  affiliatesCount: z.coerce.number().int().min(0).max(100000),
  status: z.enum(["activa", "inactiva", "archivada"]).default("activa"),
  nit: optionalText,
  legalEntityNumber: optionalText,
  resolutionNumber: optionalText,
  recognitionDate: z.string().optional().transform((value) => value || null),
  recognitionEntity: optionalText,
  address: optionalText,
  phone: optionalText,
  email: z
    .union([z.literal(""), z.string().email("Correo inválido.")])
    .optional()
    .transform((value) => value || null),
  locationReference: optionalText,
});

export const operationInput = z.object({
  juntaId: z.string().uuid(),
  title: z.string().trim().min(4).max(220),
  description: z.string().trim().max(5000).optional(),
  responsibleName: z.string().trim().max(180).optional(),
  location: z.string().trim().max(240).optional(),
  date: z.string().min(8),
  status: z.string().trim().min(3).max(30),
});
