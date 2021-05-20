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
  const volume24h = await getVolume24h()
  const tvl = await getTotalValueLocked()

  await file.appendData(
    moment().format('YYYY-MM-DD HH:mm'),
    price || '-',
    percentSNXStaked * 100 || '-',
    volume24h || '-',
    tvl || '-',
    feesToDistribute || '-',
    rewardsToDistribute || '-',
    moment(startTime).format('YYYY-MM-DD HH:mm') || '-'
  )
}

async function getDataAndPost() {
  const file = new File()

  try {
    const snxExp = new SynthetixExplorer()
    const lastData = await file.readLastData()

    if (!lastData.length) {
      await insertNewData(file, snxExp)
      await postTwitter(lastData, await file.readLastData())
    } else if (moment().diff(moment(lastData[0]), 'minutes', true) > minutesIntervalBotPost - 1) {
      await insertNewData(file, snxExp)
      await postTwitter(lastData, await file.readLastData())
    }

    console.log(`Sleeping for ${minutesIntervalBotPost} min...`)
  } catch (error) {
    console.log(error)
  }
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runForever() {
  while (true) {
    await Promise.all([getDataAndPost(), timeout(minutesIntervalBotPost * 60 * 1000)])
  }
}

runForever()
