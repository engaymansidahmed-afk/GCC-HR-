import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
    "NODE_ENV"
];

requiredEnv.forEach((key) => {

    if (!process.env[key]) {

        console.warn(`⚠ Missing Environment Variable: ${key}`);

    }

});

export const env = {

    NODE_ENV: process.env.NODE_ENV || "development",

    HOST: process.env.HOST || "0.0.0.0",

    PORT: Number(process.env.PORT) || 3000,

    CLIENT_URL: process.env.CLIENT_URL || "*",

    DATABASE_URL: process.env.DATABASE_URL || "",

    JWT_SECRET: process.env.JWT_SECRET || "",

    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",

    SMTP_HOST: process.env.SMTP_HOST || "",

    SMTP_PORT: Number(process.env.SMTP_PORT) || 587,

    SMTP_USER: process.env.SMTP_USER || "",

    SMTP_PASS: process.env.SMTP_PASS || "",

    SMTP_FROM: process.env.SMTP_FROM || ""

};

export default env;
