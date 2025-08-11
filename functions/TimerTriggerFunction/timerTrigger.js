// functions/timerTrigger.js
const { getTodayQuote } = require('../Shared/quoteService');

module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    context.log('Timer trigger function ran!', timeStamp);
    context.log('Timer trigger function processed work item', myTimer);
    const response = await getTodayQuote(context, "TIMER");
    context.log(response);
};
