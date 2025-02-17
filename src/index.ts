import express, {Request, Response} from "express"
import cors from "cors"
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/authRoutes"
import linkRoutes from "./routes/linkRoutes"
import portfolioRoutes from "./routes/portfolioRoutes"
import { authenticateUser } from "./middlewares/authMiddleware";

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8000;

export const prismaClient = new PrismaClient();

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
        message: "I'm alive 👍",
        serverInfo
    })
})


app.use(authenticateUser);

app.use('/api/v1/',portfolioRoutes);

app.use('/api/v1',linkRoutes);



app.get('/protected', (req:Request, res: Response)=>{
    res.json({
        message: "You should not see this without logged in"
    })
})

app.listen(port, ()=>{
    console.log("Server listening on :",port);
    
})

