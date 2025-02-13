import { link } from 'fs';
import {string, z} from 'zod'

export const SignupSchema = z.object({
    name: z.string(),
    username: z.string().min(5).max(20),
    password: z.string()
})


export const SigninSchema = z.object({
    username: z.string().min(5).max(20),
    password: z.string()
})


export const linkSchema = z.object({
    url: z.string().url(), // Ensures the URL is a valid string
  });

export const ShortenLinkSchema = z.object({
    ogLink: linkSchema
})

export const campaignSchema = z.object({
    camName: z.string().min(1, "Campaign name is required"), 
    description: z.string().optional(),
    links: z.array(z.string().url("Each link must be a valid URL")) // Ensuring links are an array of valid URLs
});


export const addLinkToCampaignSchema = z.object({
    name: z.string().min(1, 'Name is required'), 
    links: z.string().array()

})


export const deleteLink = z.object({
    name: z.string(),
    links: z.array(linkSchema)
})

