import express, {Request, Response} from "express"
import cors from "cors"
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/authRoutes"
import linkRoutes from "./routes/linkRoutes"
import { authenticateUser } from "./middlewares/authMiddleware";
import analyticsRoutes from "./routes/analyticsRoutes"

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8000;

export const prismaClient = new PrismaClient();

app.use('/api/v1',authRoutes);

app.use('/api/v1',analyticsRoutes);


app.use(authenticateUser);


app.use('/api/v1',linkRoutes);


app.get('/',(req: Request, res: Response)=>{
    const serverInfo = {
        NODE_ENV: process.env.NODE_ENV, // E.g., 'development', 'production', 'test'
        platform: process.platform,     // E.g., 'darwin', 'linux', 'win32'
        architecture: process.arch,     // E.g., 'x64', 'arm'
        memoryUsage: process.memoryUsage(),
        pid: process.pid,               // The current process ID
        uptime: process.uptime(),       // Server uptime in seconds
        version: process.version,       // Node.js version
        hostname: require('os').hostname() 
    }

    res.status(200).json({
        message: "I'm alive 👍",
        serverInfo
    })
})

app.get('/protected', (req:Request, res: Response)=>{
    res.json({
        message: "You should not see this without logged in"
    })
})

app.listen(port, ()=>{
    console.log("Server listening on :",port);
    
})