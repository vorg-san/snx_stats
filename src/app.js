const File = require('./file')
const SynthetixExplorer = require('./synthetix')
const {getVolume24h} = require('./coinmarketcap')
const {getTotalValueLocked} = require('./defipulse')
const moment = require('moment')
const {minutesIntervalBotPost} = require('./env')

function toCurrency(num) {
	return num
  return num.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
}

async function insertNewData(file, snxExp) {
  // const price = await snxExp.getSNXPrice()
  // const {percentSNXStaked, approxTotalSNXStaked} = await snxExp.getSNXStaked(price)
  // const {startTime, feesToDistribute, rewardsToDistribute} = await snxExp.getTradingFees()
  // const volume24h = await getVolume24h()
  const tvl = await getTotalValueLocked()

  // await file.appendData(
  //   moment().format('YYYY-MM-DD HH:MM'),
  //   toCurrency(price || 0),
  //   parseInt(percentSNXStaked * 100) || 0,
  //   toCurrency(volume24h) || 0,
  //   toCurrency(tvl) || 0,
  //   toCurrency(feesToDistribute * price) || 0
  // )
}

async function run() {
  const file = new File()
  const snxExp = new SynthetixExplorer()

  try {
    const last = await file.readLastData()

    if (!last.length) {
      await insertNewData(file, snxExp)
    } else if (moment().diff(moment(last[0]), 'minutes') >= minutesIntervalBotPost) {
      await insertNewData(file, snxExp)
    }
  } catch (error) {
    console.log(error)
  }
}
run()
