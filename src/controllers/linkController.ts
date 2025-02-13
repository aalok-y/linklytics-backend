import { Request, Response } from "express";
import { nanoid } from "nanoid";
import { prismaClient } from "..";
import { campaignSchema } from "../types/types";
import { number } from "zod";

// Function to generate shortened links
const generateShortLinks = (count: number): string[] => {
    return Array.from({ length: count }, () => nanoid(6));
};

export const shortenLink = async (req: Request, res: Response) => {
    // Validate request body
    const parsedData = campaignSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Incorrect Inputs",
            errors: parsedData.error.errors,
        });

        return;
    }

    try {
        const { camName, description, links } = parsedData.data;
        const userId = req.userId; // Extracted from auth middleware

        // Ensure links are just strings (not objects)
        if (!Array.isArray(links) || !links.every(link => typeof link === "string")) {
            res.status(400).json({ message: "Links should be an array of strings" });
            return;
        }

        // Step 1: Create the campaign without links
        const campaign = await prismaClient.campaign.create({
            data: {
                name: camName,
                description: description || "",
                userId: userId as number,
            },
        });

        // Step 2: Generate shortened links
        const shortLinks = generateShortLinks(links.length);

        // Step 3: Insert shortened links into the database
        const createdLinks = await prismaClient.link.createMany({
            data: links.map((originalUrl, index) => ({
                originalUrl, // Now explicitly ensured as a string
                shortUrl: shortLinks[index],
                campaignId: campaign.id,
            })),
        });

        res.status(201).json({
            message: "Campaign created and links shortened successfully",
            campaignId: campaign.id,
            shortLinks,
        });
        return;
    } catch (error) {
        console.error("Error shortening links:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error,
        });
        return;
    }
};
