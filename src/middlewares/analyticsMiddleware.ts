import { Request, Response, NextFunction } from "express";
import axios from "axios";
import useragent from "useragent";
import userAgentParser from "express-useragent";
import { prismaClient } from "..";


const IPINFO_API_KEY = process.env.IPINFO_API_KEY

interface LinkAnalytics {
  shortUrl: string;
  clicks: number;
  lastAccessed: Date;
  userAgent: string;
  ipAddress: string;
  country?: string;
  region?: string;
  city?: string;
  continent?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
}

const linkAnalyticsStore: Record<string, LinkAnalytics> = {};

export const trackLinkMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const shortUrl = req.params.shortUrl; // Assuming your route is "/:shortUrl"
  const ip =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";
  const agent = useragent.parse(req.headers["user-agent"] || "");
  const userAgentDetails = userAgentParser.parse(
    req.headers["user-agent"] || ""
  );

  let country, region, city, continent;

  if (
    typeof ip === "string" &&
    ip !== "Unknown" &&
    !ip.startsWith("10.") &&
    !ip.startsWith("192.168")
  ) {
    try {
      const response = await axios.get(
        `https://ipinfo.io/${ip}?token=${IPINFO_API_KEY}`
      );
      const data = response.data;
      country = data.country;
      region = data.region;
      city = data.city;
    } catch (error) {
      console.error("Error fetching geolocation:", error);
    }
  }

  if (!linkAnalyticsStore[shortUrl]) {
    linkAnalyticsStore[shortUrl] = {
      shortUrl,
      clicks: 0,
      lastAccessed: new Date(),
      userAgent: agent.toString(),
      ipAddress: ip as string,
      country,
      region,
      city,
      continent,
      deviceType: userAgentDetails.isMobile ? "Mobile" : "Desktop",
      browser: userAgentDetails.browser,
      os: userAgentDetails.os,
    };
  }

  linkAnalyticsStore[shortUrl].clicks++;
  linkAnalyticsStore[shortUrl].lastAccessed = new Date();
  linkAnalyticsStore[shortUrl].userAgent = agent.toString();
  linkAnalyticsStore[shortUrl].ipAddress = ip as string;
  linkAnalyticsStore[shortUrl].country = country;
  linkAnalyticsStore[shortUrl].region = region;
  linkAnalyticsStore[shortUrl].city = city;
  linkAnalyticsStore[shortUrl].deviceType = userAgentDetails.isMobile
    ? "Mobile"
    : "Desktop";
  linkAnalyticsStore[shortUrl].browser = userAgentDetails.browser;
  linkAnalyticsStore[shortUrl].os = userAgentDetails.os;

  console.log("Link Analytics: ", linkAnalyticsStore[shortUrl]);

  next();
};


