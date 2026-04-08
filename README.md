# keni-news 📈

A lightweight, automated backend script that fetches daily financial news (Stocks, ETFs, Crypto) via free RSS feeds, analyzes it using the Gemini API, and emails a custom-formatted report straight to your inbox. 

Built to run entirely for free using GitHub Actions and Gmail SMTP.

---

## Features

* **Automated Aggregation:** Pulls the top articles from free RSS feeds (Yahoo Finance, CoinDesk).
* **AI Market Analysis:** Uses Gemini to extract a Headline, summarize the Content, and predict the Market Impact.
* **Zero Infrastructure Costs:** Designed to be scheduled and executed via GitHub Actions.
* **Direct Delivery:** Emails the HTML-formatted report directly to you using standard Gmail SMTP.

---

## Prerequisites

To run this project locally, you will need:
* Node.js (v20+)
* `pnpm` installed (`npm install -g pnpm`)
* A free [Google Gemini API Key](https://aistudio.google.com/app/apikey)
* A Gmail account with a generated [16-character App Password](https://support.google.com/accounts/answer/185833?hl=en)

---

## Local Setup

1. **Clone the repository:** Run `git clone https://github.com/KennedySurianto/keni-news.git` and then `cd keni-news`.
2. **Install dependencies:** Run `pnpm install` to download all required packages.
3. **Set up environment variables:** Create a `.env` file in the root directory and add your `GEMINI_API_KEY`, `EMAIL_USER`, and `EMAIL_APP_PASSWORD`.
4. **Run the script:** Execute `pnpm start` and check your terminal for progress logs. Once successful, check your inbox for the market report.

---

## Cloud Automation (GitHub Actions)

This repository includes a GitHub Actions workflow (`.github/workflows/daily-news.yml`) configured to run the script automatically every day at 07:00 AM WIB (00:00 UTC).

1. Push your code to a **private** GitHub repository.
2. Go to your repository **Settings** > **Secrets and variables** > **Actions**.
3. Add three separate **Repository secrets** to exactly match your local environment variables: `GEMINI_API_KEY`, `EMAIL_USER`, and `EMAIL_APP_PASSWORD`.
4. The bot will now run automatically on schedule. You can also trigger it manually from the **Actions** tab in GitHub.

---

## Built With

* [Node.js](https://nodejs.org/) & [pnpm](https://pnpm.io/)
* [@google/genai](https://www.npmjs.com/package/@google/genai)
* [rss-parser](https://www.npmjs.com/package/rss-parser)
* [nodemailer](https://nodemailer.com/)