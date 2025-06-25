/**
* Examine a series of tweets and calculate sentiment analysis (either by ID or from tweets that have no existing sentiment analysis)
*
* @example Examine existing tweets showing output of each
* ./run-agent platforms.twitter.sentiment -o verbose -o force=true -o id=60dad0d884ec6b5708230bbb,60dacfa9511667558ad28525,60dacfa9511667558ad28524,60dacfa9511667558ad2851c
*
* @example Rebuild database deltas (i.e. skip already existing items)
* ./run-agent platforms.twitter.sentiment -o limit=0
*
* @example Rebuild entire database (with logging)
* ./run-agent platforms.twitter.sentiment -o verbose -o force=true -o limit=0
*/

const _ = require('lodash');
const axios = require('axios');

const sentimentAPI = axios.create({
    baseURL: 'http://localhost:8000/api/sentiment', // Ensure the sentiment service is running
    timeout: 10000,
});

const rapidAPI = axios.create({
    baseURL: 'https://twitter154.p.rapidapi.com',
    timeout: 10000,
    headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
    },
});

module.exports = {
    id: 'platforms.twitter.sentiment',
    timing: '*/15 * * * *', // every 15 minutes
    hasReturn: false,
    show: true,
    methods: ['pm2', 'inline'],
    expires: false,
    worker: function (done, settings) {
        const agent = this;

        const config = {
            limit: 500, // Max tweets per run
            verbose: true, // Log output
        };

        const query = {
            platform: 'twitter',
            sentiment: { $exists: false }, // Only process tweets without sentiment
        };

        return Promise.resolve()
            .then(() => app.db.platforms_data.find(query).limit(config.limit).sort('-date').cursor().eachAsync(async (doc) => {
                const text = doc.data?.text;
                if (!text || text.length < 3) return;

                try {
                    const response = await sentimentAPI.post('/analyze', {
                        text,
                        lang: 'en',
                    });

                    doc.sentiment = {
                        label: response.data.label,
                        score: response.data.score,
                        insight: response.data.insight,
                    };

                    if (config.verbose) {
                        agent.log(
                            `Processed Tweet [${doc._id}]:`,
                            doc.sentiment.label.toUpperCase(),
                            `(${(doc.sentiment.score * 100).toFixed(1)}%)`,
                            '-',
                            doc.sentiment.insight
                        );
                    }

                    await doc.save();
                } catch (err) {
                    agent.warn(`Error analyzing tweet ${doc._id}: ${err.message}`);
                }
            }))
            .catch((err) => agent.warn('Worker error:', err.toString()))
            .finally(() => done());
    },
};
