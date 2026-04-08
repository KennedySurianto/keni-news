import Parser from 'rss-parser';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

const parser = new Parser();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Free RSS feeds for Stocks, ETFs, and Crypto
const FEEDS = [
    'https://finance.yahoo.com/news/rss',            // General Market & Stocks
    'https://www.coindesk.com/arc/outboundfeeds/rss/' // Crypto
];

async function fetchNews() {
    let combinedNews = '';
    
    for (const feedUrl of FEEDS) {
        const feed = await parser.parseURL(feedUrl);
        // Grab the top 4 articles from each feed
        feed.items.slice(0, 4).forEach(item => {
            combinedNews += `Title: ${item.title}\nSnippet: ${item.contentSnippet}\n\n`;
        });
    }
    
    return combinedNews;
}

// A simple helper function to pause execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function analyzeNews(newsText) {
    const prompt = `
    You are an expert financial analyst. Read the following news snippets and format them into an email report. 
    For each news item, you must strictly provide:
    1. A clear Headline (wrapped in <h2>)
    2. A concise Content summary (wrapped in <p>)
    3. Your Analysis of what it could affect in the market (wrapped in <p> with a bold label like <strong>Market Impact:</strong>)
    
    Here is the news data:
    ${newsText}
    `;

    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Attempt to call the API
            const response = await ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt,
            });
            
            // If successful, return the text and break out of the loop
            return response.text;
        } catch (error) {
            // Check if the error is a 503 (Server Busy) and we haven't run out of retries
            if (error.status === 503 && attempt < MAX_RETRIES) {
                // Calculate wait time
                const waitTime = Math.pow(2, attempt) * 1000; 
                console.warn(`⚠️ Gemini API busy (503). Retrying attempt ${attempt + 1} in ${waitTime / 1000} seconds...`);
                
                // Wait before looping again
                await delay(waitTime);
            } else {
                // If it's a different error
                throw new Error(`Gemini API failed after ${attempt} attempts: ${error.message}`);
            }
        }
    }
}

async function sendEmail(htmlContent) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD 
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Sending it to yourself
        subject: '📈 Daily Market & Crypto Analysis',
        html: htmlContent
    };

    await transporter.sendMail(mailOptions);
}

async function run() {
    try {
        console.log('1. Fetching RSS news feeds...');
        const news = await fetchNews();
        
        console.log('2. Generating analysis with Gemini...');
        const analysisHtml = await analyzeNews(news);
        
        console.log('3. Sending email via Gmail...');
        await sendEmail(analysisHtml);
        
        console.log('✅ Success! Check your inbox.');
    } catch (error) {
        console.error('❌ Error running the bot:', error);
    }
}

// Execute the script
run();