# snx_stats
A twitter bot that updates the feed with the statistics of the synthetix blockchain.

## Motivation and History

The creation of this bot is an answer for this defi hackathon challenge: https://gitcoin.co/issue/snxgrants/open-defi-hackathon/5/100025663 . 

The challenge refereces the https://stats.synthetix.io/ official page that contains quite a lot of numbers about the project. I could do a simple web scraper that reads the desired data from that web page, but that would create a dependency and a single point of failure on that stats website, if the website went offline or snx devs altered how they display the webpage then our bot wouldn't work anymore. 

Besides, where is the fun in that?! I wanna know where the data comes from, what other possible data could I access and how is the Synthetix ecossistem for developers! Let's go for the deeper dive.

I develop software for 12 years and I am in love (and invest in) the cryptocurrency space since 2017 and this the first time I try to merge these two passions. 

## Features

* Most of the stats directly from Synthetix API
* Volume and rank from CoinMarketCap API
* Total Value Locked from DeFi Pulse API
* data is stored in file 'data.txt' as the bot runs  (upgraded version would change this to a database)
* twitter post mentions % diffs from previous data with icons
* time interval between each twitter post can be set, see configuration below

## Install

Clone this repo to any folder and inside it run "npm install".

## Configuration 'src/config.js'

There are some secret keys to be set on the system for this bot to function properly:
* DeFi Pulse API key - create account and get one here https://data.defipulse.com/dashboard/egs
* Twitter API keys - create Standalone APP here https://developer.twitter.com/en/portal/projects-and-apps

Variable 'minutesIntervalBotPost' sets the minimum interval of minutes between cycles of data collection and subsequent twitter status update.

## Run

run with 'npm start'

## Thanks

Thanks to devs at #dev-portal discord (http://discord.gg/synthetix) for answering some questions and pointing me the way.