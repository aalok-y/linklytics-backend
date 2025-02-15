// import { Request, Response, NextFunction } from "express";
// import axios from "axios";
// import useragent from "useragent";
// import userAgentParser from "express-useragent";
// import { prismaClient } from "..";

// const IPINFO_API_KEY = process.env.IPINFO_API_KEY;

// export const trackLinkMiddleware = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const shortUrl = req.params.shortUrl; // Assuming your route is "/:shortUrl"
//   // const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";
//   const fetchPublicIp = await axios.get('https://api64.ipify.org?format=json');
//   const pubIp = fetchPublicIp.data.ip;
//   // const agent = useragent.parse(req.headers["user-agent"] || "");
//   const userAgentDetails = userAgentParser.parse(
//     req.headers["user-agent"] || ""
//   );

//   let country, region, city;

//   // Fetch geolocation data (only for public IPs)
//   if (
//     typeof pubIp === "string" &&
//     pubIp !== "Unknown" &&
//     !pubIp.startsWith("10.") &&
//     !pubIp.startsWith("192.168")
//   ) {
//     try {
//       const response = await axios.get(
//         `https://ipinfo.io/${pubIp}?token=${IPINFO_API_KEY}`
//       );
//       const data = response.data;
//       country = data.country;
//       region = data.region;
//       city = data.city;
//     } catch (error) {
//       console.error("Error fetching geolocation:", error);
//     }
//   }

//   const deviceType = userAgentDetails.isMobile ? "Mobile" : "Desktop";
//   const browser = userAgentDetails.browser;
//   const os = userAgentDetails.os;

//   try {
//     // Fetch the link ID associated with the short URL
//     const link = await prismaClient.link.findUnique({
//       where: { shortUrl },
//     });

//     if (!link) {
//       console.error(`Link not found for shortUrl: ${shortUrl}`);
//       res.status(404).json({
//         message: "Short link not found",
//       });
//       return;
//     }

//     // Check if analytics entry exists for this link
//     const existingAnalytics = await prismaClient.analytics.findUnique({
//       where: { linkId: link.id },
//     });

//     if (existingAnalytics) {
//       // Update existing analytics entry
//       await prismaClient.analytics.update({
//         where: { linkId: link.id },
//         data: {
//           clicks: existingAnalytics.clicks + 1,
//           lastAccessed: new Date(),
//           ipAddress: pubIp as string,
//           country,
//           region,
//           city,
//           deviceType,
//           browser,
//           os,
//         },
//       });
//     } else {
//       // Create new analytics entry
//       await prismaClient.analytics.create({
//         data: {
//           linkId: link.id,
//           clicks: 1,
//           lastAccessed: new Date(),
//           ipAddress: pubIp as string,
//           country,
//           region,
//           city,
//           deviceType,
//           browser,
//           os,
//         },
//       });
//     }

//     console.log(`Analytics recorded for ${shortUrl}`);
//   } catch (error) {
//     console.error("Error storing analytics:", error);
//   }

//   next();
// };

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
  // const fetchPublicIp = await axios.get("https://api64.ipify.org?format=json");
  // const pubIp = fetchPublicIp.data.ip;

  const userIp =
  req.headers["x-forwarded-for"]?.toString().split(",")[0] || // Gets the first IP in case of multiple proxies
  req.socket.remoteAddress || 
  "Unknown";


  const userAgentDetails = userAgentParser.parse(
    req.headers["user-agent"] || ""
  );

  let country, region, city;

  // Fetch geolocation data for public IPs
  // if (
  //   typeof pubIp === "string" &&
  //   pubIp !== "Unknown" &&
  //   !pubIp.startsWith("10.") &&
  //   !pubIp.startsWith("192.168")
  // ) {
  //   try {
  //     const response = await axios.get(
  //       `https://ipinfo.io/${pubIp}?token=${IPINFO_API_KEY}`
  //     );
  //     const data = response.data;
  //     country = data.country;
  //     region = data.region;
  //     city = data.city;
  //   } catch (error) {
  //     console.error("Error fetching geolocation:", error);
  //   }
  // }

  if (
    typeof userIp === "string" &&
    userIp !== "Unknown" &&
    !userIp.startsWith("10.") &&
    !userIp.startsWith("192.168") &&
    !userIp.startsWith("127.") // Exclude local IPs
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
    // Fetch the link associated with the short URL
    const link = await prismaClient.link.findUnique({
      where: { shortUrl },
    });

    if (!link) {
      res.status(404).json({ message: "Short link not found" });
      return;
    }

    // Increment click count in Link table
    await prismaClient.link.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } },
    });

    // Create a new analytics entry for each visit
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
