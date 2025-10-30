import { z } from "zod";

import { DEFAULT_PARTNERS, partnerSchema } from "./partner";
import { DEFAULT_QUICK_ACTIONS, quickActionSchema } from "./quickAction";

export const eventConfigSchema = z.object({
  quickActions: z.array(quickActionSchema).default(DEFAULT_QUICK_ACTIONS),
  partners: z.array(partnerSchema).default(DEFAULT_PARTNERS),
  isPitchNight: z.boolean().default(false),
  surveyUrl: z.string().optional(),
});

export type EventConfig = z.infer<typeof eventConfigSchema>;

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  quickActions: DEFAULT_QUICK_ACTIONS,
  partners: DEFAULT_PARTNERS,
  isPitchNight: false,
};
