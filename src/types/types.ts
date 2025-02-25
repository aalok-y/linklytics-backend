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
  linkName: z.string()
});

export const deleteLinkSchema = z.object({
    linkIds: z.array(number())
});

export const expandLinkSchema = z.object({
    shortLinks: z.array(string())
})

export const createPortfolioSchema = z.object({
  portName: z.string().min(1, "Portfolio name is required"), // Ensures name is not empty
  endpoint: z.string().min(3, "Custom"),
  description: z.string().optional(), // Description is optional
  avatar: z.string().url().optional(),
  links: z.array(
    z.object({
      name: z.string().min(1),
      link: z.string().url() 
    })
  ).optional(), // Links are optional
});

export const updatePortfolioSchema = z.object({
  portName: z.string().min(1, "Portfolio name is required").optional(), // Ensures name is not empty
  description: z.string().optional(), // Description is optional
  endpoint: z.string().min(3, "Custom endpoint must be at least 3 characters long").optional(),
  links: z.array(
    z.object({
      name: z.string().min(1),
      link: z.string().url() 
    })
  ).optional(), // Links are optional
});