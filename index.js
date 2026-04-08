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

    const response = await ai.models.generateContent({
        model: 'gemini-flash-latest', // Fast and cost-effective model
        contents: prompt,
    });

    return response.text;
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