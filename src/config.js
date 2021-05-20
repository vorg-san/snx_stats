module.exports = {
  minutesIntervalBotPost: 3 , //* 60
  synthetixAPI: 'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix',
  defipulse_key: process.env.defipulse_key,
  twitter: {
    consumer_key: process.env.twitter_consumer_key,
    consumer_secret: process.env.twitter_consumer_secret,
    access_token: process.env.twitter_access_token,
    access_token_secret: process.env.twitter_access_token_secret,
  },
}
