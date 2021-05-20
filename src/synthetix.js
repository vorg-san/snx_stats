const {pageResults} = require('synthetix-data')
const {synthetix} = require('@synthetixio/contracts-interface')
const {ethers, BigNumber} = require('ethers')
const {formatEther, formatUnits} = require('ethers/lib/utils')
const {synthetixAPI} = require('./config')

class SynthetixExplorer {
  constructor() {
    this._snxjs = synthetix({network: 'mainnet'})
  }

  async getSNXPrice() {
    const snxPriceQuery = await this._snxjs.contracts['ExchangeRates']['rateForCurrency'](this._snxjs.toBytes32('SNX'))
    const snxPrice = Number(formatEther(snxPriceQuery))
    return snxPrice
  }

  async getSNXStaked(snxPrice) {
    const totalIssuedSynthsQuery = await this._snxjs.contracts['Synthetix']['totalIssuedSynthsExcludeEtherCollateral'](
      this._snxjs.toBytes32('sUSD')
    )
    const lastDebtLedgerEntryQuery = await this._snxjs.contracts['SynthetixState']['lastDebtLedgerEntry']()
    const issuanceRatioQuery = await this._snxjs.contracts['SystemSettings']['issuanceRatio']()
    const totalSupplySNXQuery = await this._snxjs.contracts['Synthetix']['totalSupply']()

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

    for (const {collateral, debtEntryAtIndex, initialDebtOwnership} of holdersQuery) {
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

    return {
      percentSNXStaked: percentSNXStaked,
      approxTotalSNXStaked: totalSupplySNX * percentSNXStaked * snxPrice,
    }
  }

  async getTradingFees() {
    const feePeriod = await this._snxjs.contracts.FeePool.recentFeePeriods(0)

		const feesAndRewards = {
      startTime: new Date(BigNumber.from(feePeriod.startTime).toNumber() * 1000) || 0,
      feesToDistribute: Number(formatEther(feePeriod.feesToDistribute)) || 0, //sUSD
      rewardsToDistribute: Number(formatEther(feePeriod.rewardsToDistribute)) || 0, //SNX
    }

    return feesAndRewards
  }
}

module.exports = SynthetixExplorer
