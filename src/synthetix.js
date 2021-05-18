const { pageResults } = require('synthetix-data')
const { synthetix } = require('@synthetixio/contracts-interface')
const { ethers, BigNumber } = require('ethers')
const { formatEther, formatUnits } = require('ethers/lib/utils')

const etherscan_key = process.env.etherscan_key
const synthetixAPI = 'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix'

const snxjs = synthetix({ network: 'mainnet' })

async function getSNXPrice() {
	const snxPriceQuery = await snxjs.contracts['ExchangeRates']['rateForCurrency'](snxjs.toBytes32('SNX'))
  const snxPrice = Number(formatEther(snxPriceQuery))
  
	return snxPrice
}

async function getSNXStaked(snxPrice) {
  const totalIssuedSynthsQuery = await snxjs.contracts['Synthetix']['totalIssuedSynthsExcludeEtherCollateral'](
    snxjs.toBytes32('sUSD')
  )
  const lastDebtLedgerEntryQuery = await snxjs.contracts['SynthetixState']['lastDebtLedgerEntry']()
  const issuanceRatioQuery = await snxjs.contracts['SystemSettings']['issuanceRatio']()
  const totalSupplySNXQuery = await snxjs.contracts['Synthetix']['totalSupply']()

  const totalIssuedSynths = Number(formatEther(totalIssuedSynthsQuery))
  const lastDebtLedgerEntry = Number(formatUnits(lastDebtLedgerEntryQuery, 27))
  const issuanceRatio = Number(formatEther(issuanceRatioQuery))
  const totalSupplySNX = Number(formatEther(totalSupplySNXQuery))

  const holdersQuery = await pageResults({
    api: synthetixAPI,
    query: {
      entity: 'snxholders',
      selection: {
        orderBy: 'collateral',
        orderDirection: 'desc',
        where: {
          block_gt: 5873222,
        },
      },
      properties: ['collateral', 'debtEntryAtIndex', 'initialDebtOwnership'],
    },
    max: 1000,
  })

  let snxTotal = 0
  let snxLocked = 0

  for (const { collateral, debtEntryAtIndex, initialDebtOwnership } of holdersQuery) {
    if (!collateral || !debtEntryAtIndex || !initialDebtOwnership) continue

    const collateralFmt = Number(ethers.utils.formatEther(ethers.BigNumber.from(collateral)))
    const debtEntryAtIndexFmt = Number(ethers.utils.formatEther(ethers.BigNumber.from(debtEntryAtIndex)))
    const initialDebtOwnershipFmt = Number(ethers.utils.formatEther(ethers.BigNumber.from(initialDebtOwnership)))

    let debtBalance = ((totalIssuedSynths * lastDebtLedgerEntry) / debtEntryAtIndexFmt) * initialDebtOwnershipFmt
    let collateralRatio = debtBalance / collateralFmt / snxPrice

    if (isNaN(debtBalance)) {
      debtBalance = 0
      collateralRatio = 0
    }
    const lockedSnx = collateralFmt * Math.min(1, collateralRatio / issuanceRatio)

    snxTotal += Number(collateralFmt)
    snxLocked += Number(lockedSnx)
  }

  const percentSNXStaked = snxLocked / snxTotal
  const approxTotalSNXStaked = totalSupplySNX * percentSNXStaked * snxPrice

  return percentSNXStaked
}

async function getTradingFees(snxPrice) {
  const feePeriod = await snxjs.contracts.FeePool.recentFeePeriods(1)

  const feesAndRewards = {
    startTime: new Date(BigNumber.from(feePeriod.startTime).toNumber() * 1000) || 0,
    feesToDistribute: Number(formatEther(feePeriod.feesToDistribute)) * 1 || 0, //sUSD is approximately 1
    rewardsToDistribute: Number(formatEther(feePeriod.rewardsToDistribute)) * snxPrice || 0, 
  }
	
	return feesAndRewards
}

module.exports = {
	getSNXPrice : getSNXPrice,
	getSNXStaked : getSNXStaked,	
	getTradingFees : getTradingFees
}