import { link } from "fs";
import { number, string, z } from "zod";

export const SignupSchema = z.object({
  name: z.string(),
  username: z.string().min(5).max(20),
  password: z.string(),
});

export const SigninSchema = z.object({
  username: z.string().min(5).max(20),
  password: z.string(),
});

export const linkSchema = z.object({
  url: z.string().url(),
});

export const ShortenLinkSchema = z.object({
  ogLink: linkSchema,
});

export const campaignSchema = z.object({
  camName: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  links: z.array(z.string().url("Each link must be a valid URL")),
});

export const addLinkToCampaignSchema = z.object({
  camId: z.number(),
  links: z.array(z.string().url("Each link must be a valid URL")),
});

export const deleteLinkSchema = z.object({
    linkIds: z.array(number())
});

export const expandLinkSchema = z.object({
    shortLinks: z.array(string())
})
