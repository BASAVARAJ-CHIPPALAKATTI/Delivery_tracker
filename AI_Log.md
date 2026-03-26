# AI Log - Weather Order Tracker

## Prompts I Used to Build This Project

### 1. Understanding Parallel Fetching
**Prompt:** "How does Promise.all work in JavaScript for parallel API calls?"
**What I learned:** Promise.all runs all promises simultaneously and waits for all to complete. This is essential for the parallel fetching requirement.

### 2. OpenWeatherMap API Integration
**Prompt:** "OpenWeatherMap API documentation for current weather by city"
**What I learned:** Endpoint structure: `api.openweathermap.org/data/2.5/weather?q={city}&appid={key}`, response contains weather.main field with conditions like Rain, Snow, etc.

### 3. Error Handling in Promise.all
**Prompt:** "How to handle errors in Promise.all so one failing request doesn't stop others?"
**What I learned:** Wrap each individual promise in try-catch so errors are caught per request rather than failing the entire batch.

### 4. OpenAI Prompt Engineering
**Prompt:** "Write a prompt for OpenAI to generate a friendly one-sentence apology for delivery delay due to weather"
**What I learned:** Be specific about format (one sentence), include variables (customer name, city, weather), and request a warm tone.

### 5. Environment Variables Security
**Prompt:** "How to securely store API keys in Node.js"
**What I learned:** Use dotenv package, add .env to .gitignore, provide .env.example for reference.

## My Implementation Process

1. Started with reading orders.json using fs.promises
2. Created fetchWeather function with try-catch for error handling
3. Used Promise.all to fetch all cities in parallel
4. Added OpenAI integration with fallback template
5. Saved updated orders.json with only required fields
6. Added summary display and error logging