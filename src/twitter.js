const Twit = require('twit')
const moment = require('moment')
const {twitter} = require('./config')
const {toCurrency, percentDiff, oneDecimal} = require('./util')

function postTwit(twit, texto) {
  return new Promise(resolve => {
    twit.post('statuses/update', {status: texto}, function (err, data, response) {
			if (err) {
				console.log('Twitter status update error: ' + err)
			} else {
				console.log('Twitter status updated at ' + moment().format('YYYY-MM-DD HH:mm'))
			}
			resolve()
		})
  });
}

async function postTwitter(oldData, newData) {
	let text = ''
	let daysSinceFeePeriodStarted = oneDecimal(moment().diff(moment(newData[7]), 'days', true))

  if (!oldData.length) {
    text = `SNX: $${toCurrency(newData[1])}
						SNX staked: ${oneDecimal(newData[2])}%
						Volume last 24h: $${toCurrency(newData[3])}
						Total Value Locked: $${toCurrency(newData[4])}
						Fees (started ${daysSinceFeePeriodStarted} day${daysSinceFeePeriodStarted > 1 ? 's' : ''} ago): ${toCurrency(newData[5])} sUSD
						Rewards (started ${daysSinceFeePeriodStarted} day${daysSinceFeePeriodStarted > 1 ? 's' : ''} ago): ${toCurrency(newData[6])} SNX`
  } else {
		let hoursSinceLastTweet = oneDecimal(moment(newData[0]).diff(moment(oldData[0]), 'hours', true))

    text = `SNX: $${toCurrency(newData[1])} ${percentDiff(oldData[1], newData[1])}
						SNX staked: ${oneDecimal(newData[2])}% ${percentDiff(oldData[2], newData[2])}
						Volume last 24h: $${toCurrency(newData[3])} ${percentDiff(oldData[3], newData[3])}
						Total Value Locked: $${toCurrency(newData[4])} ${percentDiff(oldData[4], newData[4])}
						Fees (started ${daysSinceFeePeriodStarted} day${daysSinceFeePeriodStarted > 1 ? 's' : ''} ago): ${toCurrency(newData[5])} sUSD ${percentDiff(oldData[5], newData[5])}
						Rewards (started ${daysSinceFeePeriodStarted} day${daysSinceFeePeriodStarted > 1 ? 's' : ''} ago): ${toCurrency(newData[6])} SNX ${percentDiff(oldData[6], newData[6])}
						
						compared to ${hoursSinceLastTweet} hour${hoursSinceLastTweet > 1 ? 's' : ''} ago`
	}

	const twit = new Twit({
    ...twitter,
    timeout_ms: 60 * 1000,
    strictSSL: true,
  })

	await postTwit(twit, text)
}

module.exports = {
	postTwitter : postTwitter
}