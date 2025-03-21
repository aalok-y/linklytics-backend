import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import path from 'path';
import authRoutes from "./routes/authRoutes"
import linkRoutes from "./routes/linkRoutes"
import portfolioRoutes from "./routes/portfolioRoutes"
import analyticsRoutes from "./routes/analyticsRoutes"
import { authenticateUser } from "./middlewares/authMiddleware";
import visitLinkRoutes from "./routes/linkVisitRoutes"
import otpRoutes from "./routes/otpRoutes"

const app = express();
app.use(cors());
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'src', 'views'));

// Serve static files first
app.use(express.static(path.join(__dirname, '..', 'src', 'public')));

const port = process.env.PORT || 8000;

export const prismaClient = new PrismaClient();

app.use((req, res, next) => {
    console.log(`🔥 Incoming request: ${req.method} ${req.path}`);
    next();
});

app.use('/api/v1',otpRoutes);

app.use('/api/v1',authRoutes);

app.get('/status',(req: Request, res: Response)=>{
    const serverInfo = {
        NODE_ENV: process.env.NODE_ENV, 
        platform: process.platform,    
        architecture: process.arch,     
        memoryUsage: process.memoryUsage(),
        pid: process.pid,               
        uptime: process.uptime(),       
        version: process.version,       
        hostname: require('os').hostname() 
    }

    res.status(200).json({
        message: "I'm alive👍",
        serverInfo
    })
    return;
})

// Handle link visits after static files
app.use('/',visitLinkRoutes)

app.use(authenticateUser);

app.use('/api/v1',portfolioRoutes);

app.use('/api/v1',linkRoutes);

app.use('/api/v1',analyticsRoutes);


app.get('/protected', (req:Request, res: Response)=>{
    res.json({
        message: "You should not see this without logged in"
    })
})

app.listen(port, ()=>{
    console.log("Server listening on :",port);
    
})
