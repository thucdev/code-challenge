import { z } from "zod";

export const RESOURCE_STATUSES = ["active", "inactive", "archived"] as const;

const resourceFields = {
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000),
  category: z.string().trim().min(1).max(100),
  status: z.enum(RESOURCE_STATUSES),
};

export const createResourceSchema = z
  .object({
    ...resourceFields,
    description: resourceFields.description.default(""),
    status: resourceFields.status.default("active"),
  })
  .strict();

export const updateResourceSchema = z
  .object(resourceFields)
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: "At least one field must be provided",
  });

export const listResourcesQuerySchema = z.object({
  name: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  status: z.enum(RESOURCE_STATUSES).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ListResourcesQuery = z.infer<typeof listResourcesQuerySchema>;

export interface Resource {
  id: number;
  name: string;
  description: string;
  category: string;
  status: ResourceStatus;
  createdAt: string;
  updatedAt: string;
}
