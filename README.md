# Weather Order Tracker

A Node.js script that monitors weather conditions for orders and flags potential delivery delays.

## Features
- Parallel API calls to OpenWeatherMap using Promise.all
- AI-generated apology messages using OpenAI
- Graceful error handling for invalid cities

## Setup
1. Clone repository
2. Copy `.env.example` to `.env` and add your API keys
3. Run `npm install`
4. Run `node script.js`

## Requirements Met
- ✅ Parallel fetching with Promise.all
- ✅ Error handling (InvalidCity123 doesn't crash script)
- ✅ AI apology generation for delayed orders
- ✅ Environment variables for API keys

## Technologies
- Node.js
- Axios (HTTP requests)
- OpenAI API
- OpenWeatherMap API