import { Request, Response, NextFunction } from "express";
import axios from "axios";
import userAgentParser from "express-useragent";
import { prismaClient } from "..";

const IPINFO_API_KEY = process.env.IPINFO_API_KEY;

export const trackLinkMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const shortUrl = req.params.shortUrl;
  const userIp =
    req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
    req.socket.remoteAddress ||
    "Unknown";

  const userAgentDetails = userAgentParser.parse(
    req.headers["user-agent"] || ""
  );

  let country, region, city;
  if (
    typeof userIp === "string" &&
    userIp !== "Unknown" &&
    !userIp.startsWith("10.") &&
    !userIp.startsWith("192.168") &&
    !userIp.startsWith("127.")
  ) {
    try {
      const response = await axios.get(
        `https://ipinfo.io/${userIp}?token=${IPINFO_API_KEY}`
      );
      const data = response.data;
      country = data.country;
      region = data.region;
      city = data.city;
    } catch (error) {
      console.error("Error fetching geolocation:", error);
    }
  }

  const deviceType = userAgentDetails.isMobile ? "Mobile" : "Desktop";
  const browser = userAgentDetails.browser;
  const os = userAgentDetails.os;

  try {
    const link = await prismaClient.link.findUnique({
      where: { shortUrl },
    });

    (req as any).linkData = {
      linkId: link?.id,
      originalUrl: link?.originalUrl
    }

    if (!link) {
      res.status(404).json({ message: "Short link not found" });
      return;
    } 

    await prismaClient.link.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } },
    });

    await prismaClient.analytics.create({
      data: {
        linkId: link.id,
        lastAccessed: new Date(),
        ipAddress: userIp,
        country,
        region,
        city,
        deviceType,
        browser,
        os,
      },
    });

    console.log(`Analytics recorded for ${shortUrl}`);
  } catch (error) {
    console.error("Error storing analytics:", error);
  }

  next();
};
