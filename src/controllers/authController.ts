import { Request, Response } from "express";
import { prismaClient } from "..";
import { SignupSchema, SigninSchema } from "../types/types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { any } from "zod";
import { error } from "console";

const generateToken = (userId: number): string => {
  return jwt.sign({ userId: userId }, process.env.JWT_SECRET ?? "Super-Secret");
};

const sendOtpEmail = async (email: string, subject: string, text: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return new Error("Invalid email format");
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // App password
    },
  });

  await transporter.sendMail({
    from: `"Linklytics" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    text: text,
  }).then(() => {
    console.log('Email sent successfully')
    return true
  }).catch((error) => {
    console.error("Error sending email:", error);
    return new Error(`Unable to send email: ${error}`)
  });
};


export const signup = async (req: Request, res: Response): Promise<void> => {
  const parsedData = SignupSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "Incorrect Inputs",
      errors: parsedData.error.errors,
    });
    return;
  }

  const otp = crypto.randomInt(100000, 999999).toString();


  const hashedPass = await bcrypt.hash(parsedData.data.password, 3);
  try {
    const user = prismaClient.user.create({
      data: {
        name: parsedData.data.name,
        username: parsedData.data?.username,
        password: hashedPass,
        isVerified: false,
      },
    });

    const subject = "Verify Your Account - OTP"
    const text = `Your OTP for account verification is ${otp}. It is valid for 5 minutes.`
    await sendOtpEmail(parsedData.data.username, subject, text);
    
    

    res.status(201).json({
      message: "OTP sent to email. Please verify.",
      userId: (await user).id,
      otp: otp
    });
  } catch (error) {
    res.status(400).json({
      message: "User already exists with this username",
      error: error
    });
  }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      message: "Incorrect Inputs",
      error: parsedData.error.errors
    });
    return;
  }


  const user = await prismaClient.user.findFirst({
    where: {
      username: parsedData.data?.username,
    },
  });
  if(!user){
    res.status(404).json({
      message: "User not found. Signup first to begin",
    });
    return;
  }

  const validUser = await bcrypt.compare(
    parsedData.data.password,
    user?.password as string
  );

  if (!validUser) {
    res.status(401).json({
      message: "Incorrect password or User does not exist",
    });
    return;
  }

  if(!user?.isVerified){
    res.status(401).json({
      message: "Account not verified. Please verify your email",
    });
    return;
  }

  const token = generateToken(user?.id as number);
  res.status(200).json({
    token,
    user: user?.name
  });
};




// export const verifyEmail = async (req: Request, res: Response) => {
//   const email = req.params.email;

//   const user = await prismaClient.user.findFirst({
//     where: {
//       username: email
//     },
//   });
//   if(!user){
//     res.status(404).json({
//       message: "User not found",
//     });
//     return;
//   }

//   if(user?.isVerified){
//     res.status(200).json({
//       message: "Account already verified",
//     });
//     return;
//   }

//   const otp = crypto.randomInt(100000, 999999).toString();
//   try {
//       await sendOtpEmail(email, otp)
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to send email"
//     })
//     return;
//   }
  

//   res.status(200).json({
//     message: "OTP sent to email. Please verify.",
//     userId: user?.id,
//     otp: otp
//   });

// }

export const verifyEmailOTP = async (req: Request, res: Response) => {
  const email = req.body.email;
  const otp = req.body.otp;
  const userotp = req.body.userotp;

  if(otp !== userotp){
    res.status(400).json({
      message: "Invalid OTP"
    })
    return;
  } 

  const user = await prismaClient.user.findFirst({
    where: {
      username: email
    },
  });
  if(!user){
    res.status(404).json({
      message: "User not found",
    });
    return;
  }

  if(user?.isVerified){
    res.status(200).json({
      message: "Account already verified",
    });
    return;
  }

  await prismaClient.user.update({
    where: {
      id: user?.id
    },
    data: {
      isVerified: true
    }
  })

  res.status(200).json({
    message: "Account verified successfully",
  })


}

export const sendOTP = async (req: Request, res: Response) => {
  const email = req.params.email;
  const otp = req.params.otp;

  const subject = "OTP for signin"
  const text = `Your OTP for account login is ${otp}. It is valid for 5 minutes.`
  await sendOtpEmail(email, subject, text);

  res.status(200).json({
    message: "OTP sent to email. Please verify.",
    otp: otp
  })
}

export const updatePassword = async (req: Request, res: Response) => {
  const email = req.query.email as string;
  const password = req.query.password as string;

  const hashedPass = await bcrypt.hash(password, 3);

  const user = await prismaClient.user.findFirst({
    where: {
      username: email
    },
  });
  if(!user){
    res.status(404).json({
      message: "User not found",
    });
    return;
  }

  await prismaClient.user.update({
    where: {
      id: user?.id
    },
    data: {
      password: hashedPass
    }
  })

  res.status(200).json({
    message: "Password updated successfully",
  })

}

export const sendResetPasswordLink = async (req: Request, res: Response) => {
  const email = req.params.email;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    res.status(400).json({
      message: "Invalid email format",
    });
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // App password
    },
  });

  await transporter.sendMail({
    from: `"Linklytics" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Password Link",
    text: `Your password reset link is: https://linklytics-backend.onrender.com/api/v1/auth/send-reset-password-template/${email}`,
  }).then(() => {
    console.log('Email sent successfully')
    return true
  }).catch((error) => {
    console.error("Error sending email:", error);
    
  });

  res.status(200).json({
    message: "Password reset link sent successfully",
  })
}
  
export const sendResetPasswordTemplate = (req: Request, res: Response)=>{
  const email = req.params.email;
  let data = {
    email : email
  }
  res.status(200).render('forget-password', data);

}