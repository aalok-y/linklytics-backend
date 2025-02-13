import { Request, Response } from "express";
import { nanoid } from "nanoid";
import { prismaClient } from "..";
import { campaignSchema, addLinkToCampaignSchema, deleteLinkSchema, expandLinkSchema } from "../types/types";
import { any, number } from "zod";

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


export const addToCampaign = async (req: Request, res: Response) => {
    const parsedData = addLinkToCampaignSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Incorrect Inputs",
            errors: parsedData.error.errors,
        });

        return;
    }

    try {
        const { camId, links } = parsedData.data;

        const campaign = await prismaClient.campaign.findUnique({
            where: { id: camId },
        });

        if (!campaign) {
            res.status(404).json({ message: "Campaign not found" });
            return;
        }

        if (!Array.isArray(links) || !links.every(link => typeof link === "string")) {
            res.status(400).json({ message: "Links should be an array of strings" });
            return;
        }

        const shortLinks = links.map(() => nanoid(6));

        await prismaClient.link.createMany({
            data: links.map((originalUrl, index) => ({
                originalUrl,
                shortUrl: shortLinks[index],
                campaignId: camId,
            })),
        });

        res.status(201).json({
            message: "Links added to campaign successfully",
            campaignId: camId,
            shortLinks,
        });
    } catch (error) {
        console.error("Error adding links to campaign:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error,
        });
        return;
    }
};


export const deleteLink = async (req: Request, res: Response) => {
    const parsedData = deleteLinkSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Incorrect Inputs",
            errors: parsedData.error.errors,
        });

        return;
    }


    try {
        const {linkIds} = parsedData.data;


        const links = await prismaClient.link.findMany({
            where: { id: { in: linkIds } },
            select: { id: true, campaignId: true },
        });

        if (links.length === 0) {
            res.status(404).json({ message: "No matching links found" });
            return;
        }

        const campaignIds = [...new Set(links.map(link => link.campaignId))];

        await prismaClient.link.deleteMany({
            where: { id: { in: linkIds } },
        });

        for (const campaignId of campaignIds) {
            const remainingLinks = await prismaClient.link.count({
                where: { campaignId },
            });

            if (remainingLinks === 0) {
                await prismaClient.campaign.delete({
                    where: { id: campaignId },
                });
            }
        }

        res.status(200).json({
            message: "Links deleted successfully",
            deletedLinkIds: linkIds,
        });
    } catch (error) {
        console.error("Error deleting links:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error,
        });
    }
};


export const expandLink = async (req: Request, res: Response) => {
    const parsedData = expandLinkSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({
            message: "Incorrect Inputs",
            errors: parsedData.error.errors,
        });
        return;
    }

    try {
        const { shortLinks } = parsedData.data;

        const links = await prismaClient.link.findMany({
            where: { shortUrl: { in: shortLinks } },
            select: { shortUrl: true, originalUrl: true, id: true },
        });

        if (links.length === 0) {
            res.status(404).json({ message: "No matching short links found" });
            return;
        }

        const expandedLinks = links.reduce((acc, link) => {
            acc[link.shortUrl] = link.originalUrl;
            return acc;
        }, {} as Record<string, string>);

        res.status(200).json({
            message: "Links expanded successfully",
            expandedLinks,
        });
        return;
    } catch (error) {
        console.error("Error expanding links:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error,
        });
        return;
    }
};