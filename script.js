const fs = require('fs').promises;
const axios = require('axios');
const OpenAI = require('openai');
require('dotenv').config();

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

const DELAY_WEATHER = ['Rain', 'Snow', 'Thunderstorm', 'Drizzle', 'Extreme'];

async function fetchWeather(order) {
    const city = order.city;
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;
    
    console.log(`  🌐 Fetching: ${city}...`);
    
    try {
        const response = await axios.get(url);
        const weatherMain = response.data.weather[0].main;
        
        console.log(`  ✅ ${city}: ${weatherMain}`);
        
        const isDelayed = DELAY_WEATHER.includes(weatherMain);
        
        const updatedOrder = {
            order_id: order.order_id,
            customer: order.customer,
            city: order.city,
            status: isDelayed ? 'Delayed' : 'Pending'
        };
        
        if (isDelayed) {
            updatedOrder.weather = weatherMain;
        }
        
        return updatedOrder;
        
    } catch (error) {
        let errorMessage = 'City not found';
        
        if (error.response?.status === 401) {
            errorMessage = 'Invalid API key';
        } else if (error.response?.status === 404) {
            errorMessage = 'City not found';
        }
        
        console.log(`  ❌ ${city}: ERROR - ${errorMessage}`);
        
        return {
            order_id: order.order_id,
            customer: order.customer,
            city: order.city,
            status: 'Pending',
            error: errorMessage
        };
    }
}

async function generateApology(order) {
    if (order.status !== 'Delayed') {
        return null;
    }
    
    console.log(`  🤖 Generating apology for ${order.customer}...`);
    
    try {
        const prompt = `Write a friendly, professional one-sentence apology message for a customer whose order is delayed due to bad weather.

Customer: ${order.customer}
City: ${order.city}
Weather: ${order.weather || 'bad'}

The message should:
- Start with "Hi [customer name],"
- Mention the city and weather
- End with appreciation for patience
- Be one sentence only

Example: "Hi Alice, your order to New York is delayed due to heavy rain. We appreciate your patience!"`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 100,
            temperature: 0.7
        });
        
        const apology = response.choices[0].message.content.trim();
        console.log(`  💬 Apology: "${apology}"`);
        
        return apology;
        
    } catch (error) {
        console.log(`  ⚠️ AI failed, using template apology`);
        const fallbackApology = `Hi ${order.customer}, your order to ${order.city} is delayed due to ${order.weather || 'bad weather'}. We appreciate your patience!`;
        console.log(`  💬 Template: "${fallbackApology}"`);
        
        return fallbackApology;
    }
}

function displaySummary(orders) {
    const total = orders.length;
    const delayed = orders.filter(o => o.status === 'Delayed').length;
    const pending = orders.filter(o => o.status === 'Pending' && !o.error).length;
    const errors = orders.filter(o => o.error).length;
    const apologies = orders.filter(o => o.apology).length;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`  Total orders processed:  ${total}`);
    console.log(`  Delayed orders:          ${delayed} (${apologies} apologies generated)`);
    console.log(`  Pending orders:          ${pending}`);
    console.log(`  Cities with errors:      ${errors}`);
    console.log('='.repeat(50));
}

async function main() {
    const startTime = Date.now();
    
    console.log('\n' + '='.repeat(50));
    console.log('🌤️  WEATHER ORDER TRACKER - STARTING');
    console.log('='.repeat(50));
    console.log(`⏰ Started at: ${new Date().toLocaleTimeString()}\n`);
    
    try {
        console.log('📁 STEP 1: Reading orders.json...');
        const fileContent = await fs.readFile('orders.json', 'utf8');
        const orders = JSON.parse(fileContent);
        console.log(`  ✅ Loaded ${orders.length} orders\n`);
        
        console.log('🌐 STEP 2: Fetching weather data (PARALLEL)...');
        console.log('  Note: All cities are being fetched simultaneously!\n');
        
        const weatherPromises = orders.map(order => fetchWeather(order));
        const ordersWithWeather = await Promise.all(weatherPromises);
        
        console.log('\n✅ Weather data fetched for all cities!\n');
        
        console.log('🤖 STEP 3: Generating AI apologies (PARALLEL)...');
        console.log('  Note: Only generating for delayed orders.\n');
        
        const apologyPromises = ordersWithWeather.map(order => generateApology(order));
        const apologies = await Promise.all(apologyPromises);
        
        const finalOrders = ordersWithWeather.map((order, index) => {
            if (apologies[index]) {
                return { ...order, apology: apologies[index] };
            }
            return order;
        });
        
        console.log('\n✅ Apologies generated!\n');
        
        console.log('💾 STEP 4: Saving updated orders...');
        await fs.writeFile('orders.json', JSON.stringify(finalOrders, null, 2));
        console.log('  ✅ File saved successfully!\n');
        
        displaySummary(finalOrders);
        
        const duration = (Date.now() - startTime) / 1000;
        console.log(`\n⏱️  Total execution time: ${duration} seconds`);
        
        console.log('\n' + '='.repeat(50));
        console.log('🎉 SCRIPT COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(50) + '\n');
        
    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error.message);
        console.error('Script terminated unexpectedly.\n');
        process.exit(1);
    }
}

main();