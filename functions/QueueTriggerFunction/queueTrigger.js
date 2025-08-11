// functions/queueTrigger.js
const { getTodayQuote } = require('../Shared/quoteService');

module.exports = async function (context, myQueueItem) {
    context.log('Queue trigger function processed work item', myQueueItem);
    const response = await getTodayQuote(context, "QUEUE", myQueueItem);
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: response
    };
};
