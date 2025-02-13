import { Request, Response } from "express";
import { prismaClient } from "..";
import { SignupSchema, SigninSchema } from "../types/types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (userId: number): string => {
  return jwt.sign({ userId: userId }, process.env.JWT_SECRET ?? "Super-Secret");
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  const parsedData = SignupSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "Incorrect Inputs",
    });
    return;
  }

  // TODO: hash the password using bcrypt

  const hashedPass = await bcrypt.hash(parsedData.data.password, 3);
  try {
    const user = prismaClient.user.create({
      data: {
        name: parsedData.data.name,
        username: parsedData.data?.username,
        password: hashedPass,
      },
    });

    res.status(201).json({
      userId: (await user).id,
    });
  } catch (error) {
    res.status(400).json({
      message: "User already exists with this username",
    });
  }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(201).json({
      message: "Incorrect Inputs",
    });
    return;
  }

  // TODO: compare hash passwords
  const user = await prismaClient.user.findFirst({
    where: {
      username: parsedData.data?.username,
    },
  });

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

  const token = generateToken(user?.id as number);
  res.status(200).json({
    token,
  });
};
