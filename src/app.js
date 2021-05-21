const File = require('./file')
const SynthetixExplorer = require('./synthetix')
const {getVolume24h} = require('./coinmarketcap')
const {getTotalValueLocked} = require('./defipulse')
const {postTwitter} = require('./twitter')
const {minutesIntervalBotPost} = require('./config')
const moment = require('moment')

async function insertNewData(file, snxExp) {
  const price = await snxExp.getSNXPrice()
  const {percentSNXStaked, approxTotalSNXStaked} = await snxExp.getSNXStaked(price)
  const {startTime, feesToDistribute, rewardsToDistribute} = await snxExp.getTradingFees()
  const {volume24h, rank} = await getVolume24h()
  const tvl = await getTotalValueLocked()

  await file.appendData(
    moment().format('YYYY-MM-DD HH:mm'),
    price || '-',
    percentSNXStaked * 100 || '-',
    volume24h || '-',
    tvl || '-',
    feesToDistribute || '-',
    rewardsToDistribute || '-',
    moment(startTime).format('YYYY-MM-DD HH:mm') || '-',
    rank || '-'
  )
}

async function getDataAndPost() {
  try {
    const file = new File()
    const lastData = await file.readLastData()

    // will fetch data and post only if it is the first post or minutesIntervalBotPost minutes have gone by since the last post
    if (!lastData.length || moment().diff(moment(lastData[0]), 'minutes', true) > minutesIntervalBotPost - 1) {
      await insertNewData(file, new SynthetixExplorer())
      await postTwitter(lastData, await file.readLastData())
      console.log(`${minutesIntervalBotPost} minutes until next update`)
    }
  } catch (error) {
    console.log(error)
  }
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runForever() {
  while (true) {
    //sleeps 50 seconds between each try
    await Promise.all([getDataAndPost(), timeout(50 * 1000)])
  }
}

runForever()
