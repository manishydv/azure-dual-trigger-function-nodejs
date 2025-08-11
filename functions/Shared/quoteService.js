// lib/quoteService.js
const fetch = require('node-fetch');

async function getTodayQuote(context, eventType, queueMessage) {
    context.log(`Fetching quote for event type: ${eventType}`);

    let month;
    if (eventType === "QUEUE" && queueMessage && queueMessage.month) {
        context.log('Using month from queue message:', queueMessage.month);
        month = queueMessage.month;
    } else {
        month = new Date().getMonth().toString(); // Get current month as a string
        context.log('Using current month:', month);
    }

    const API_URL = process.env.QUOTE_API_URL || 'https://zenquotes.io/api/today';
    
    try {
        const response = await fetch(`${API_URL}?month=${month}`);
        if (!response.ok) {
            throw new Error(`API call failed with status ${response.status}`);
        }
        const data = await response.json();
        context.log('Successfully fetched quote.');
        return data;
    } catch (error) {
        context.log.error('Error fetching quote:', error.message);
        return { error: "Failed to fetch quote." };
    }
}

module.exports = {
    getTodayQuote
};
