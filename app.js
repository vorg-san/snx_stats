const { pageResults } = require('synthetix-data')
const axios = require('axios')
const { synthetix } = require('@synthetixio/contracts-interface')
const { ethers, BigNumber } = require('ethers')
const { formatEther, formatUnits } = require('ethers/lib/utils')

const snxjs = synthetix({ network: 'mainnet' })

async function getSNXStakedFromSynthetix() {
  const totalIssuedSynthsQuery = await snxjs.contracts['Synthetix']['totalIssuedSynthsExcludeEtherCollateral'](
    snxjs.toBytes32('sUSD')
  )
  const lastDebtLedgerEntryQuery = await snxjs.contracts['SynthetixState']['lastDebtLedgerEntry']()
  const snxPriceQuery = await snxjs.contracts['ExchangeRates']['rateForCurrency'](snxjs.toBytes32('SNX'))
  const issuanceRatioQuery = await snxjs.contracts['SystemSettings']['issuanceRatio']()
  const totalSupplySNXQuery = await snxjs.contracts['Synthetix']['totalSupply']()

  const totalIssuedSynths = Number(formatEther(totalIssuedSynthsQuery))
  const lastDebtLedgerEntry = Number(formatUnits(lastDebtLedgerEntryQuery, 27))
  const snxPrice = Number(formatEther(snxPriceQuery))
  const issuanceRatio = Number(formatEther(issuanceRatioQuery))
  const totalSupplySNX = Number(formatEther(totalSupplySNXQuery))

  // const totalIssuedSynths = 682052707.0355389
  // const lastDebtLedgerEntry = 0.001163188390578034
  // const snxPrice = 20.4624111
  // const issuanceRatio = 0.2
  // const totalSupplySNX = 225834728.82053062

  // const snxTotal = 285393605.84977466
  // const snxLocked = 141572937.96446523
  // const stakersTotalDebt = 687980203.4561584
  // const stakersTotalCollateral = 3172599532.4666157

  const synthetixAPI = 'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix'

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

  return [percentSNXStaked, approxTotalSNXStaked]
}
// console.log(getSNXStakedFromSynthetix())

async function getVolumeFromCMC() {
  try {
    let res = await axios.get('https://coinmarketcap-api.synthetix.io/public/prices?symbols=SNX')
    let cmc_snx = res.data.data

    console.log('cmc vol:' + cmc_snx.SNX.quote.USD.volume_24h)
    return cmc_snx.SNX.quote.USD.volume_24h
  } catch (e) {
    console.log(e.data, e.message)
  }
}
// getVolumeFromCMC()

async function getTotalValueLockedFromDefipulse() {
  defipulse_key = process.env.defipulse_key

  try {
    let res = await axios.get(
      'https://data-api.defipulse.com/api/v1/defipulse/api/GetHistory?project=synthetix&length=5&resolution=history&api-key=' +
        defipulse_key
    )
    let defi_snx = res.data.map((v) => ({
      time: new Date(v.timestamp * 1000),
      tvlUSD: v.tvlUSD,
    }))

    console.log(defi_snx)
  } catch (e) {
    console.log(e.data, e.message)
  }
}
// console.log(getTotalValueLockedFromDefipulse())

const etherscan_key = process.env.etherscan_key

async function getTradingFees() {
  const feePeriod = await snxjs.contracts.FeePool.recentFeePeriods(1)
  const feesAndRewards = {
    startTime: new Date(BigNumber.from(feePeriod.startTime).toNumber() * 1000) || 0,
    feesToDistribute: Number(formatEther(feePeriod.feesToDistribute)) || 0,
    feesClaimed: Number(formatEther(feePeriod.feesClaimed)) || 0,
    rewardsToDistribute: Number(formatEther(feePeriod.rewardsToDistribute)) || 0,
    rewardsClaimed: Number(formatEther(feePeriod.rewardsClaimed)) || 0,
  }
	console.log(feesAndRewards)
	return feesAndRewards
}
getTradingFees()

// async function snx_data() {
//   let holders = await snxData.snx.holders({ max: 10 })
//   holders = holders.map((h) => ({ address: h.address, balance: h.balanceOf }))
//   console.log(holders)

//   // 0xf9ddbda72b91090ba107a75b52370b9a136307d2 provavelmente tem stake
//   let debt = await snxData.snx.debtSnapshot({
//     account: holders[9].address,
//     max: 1,
//   })
//   console.log(debt)
//   debt = debt.map((d) => ({
//     time: new Date(d.timestamp),
//     debtBalanceOf: d.debtBalanceOf,
//   }))
//   console.log(debt, holders[9].address)
// }
// // snx_data()

// async function getTotal() {
//   let totalExchange = await snxData.exchanges.total()
//   console.log(totalExchange.totalFeesGeneratedInUSD)

//   let holders = await snxData.snx.holders({ max: 2 })

//   console.log(holders, holders.length)
// }
// getTotal()

// let holders = await snxData.snx.total();
// console.log(holders);

// let totalDailyActiveStakers = await snxData.snx.aggregateActiveStakers({
// 	max: 2,
// });
// console.log(totalDailyActiveStakers);

// console.log(
// 	await snxData.exchanges.since({
// 		minTimestamp: Math.floor(Date.now() / 1e3) - 3600 * 24, //24 hours ago
// 	})
// );

// async () => {
//   const ts = Math.floor(Date.now() / 1e3);
//   const oneDayAgo = ts - 3600 * 24;
//   const body = JSON.stringify({
//     // query: `{
//     //   synthExchanges(
//     //     orderBy:timestamp,
//     //     orderDirection:desc,
//     //     where:{timestamp_gt: ${oneDayAgo}}
//     //   )
//     //   {
//     //     fromAmount
//     //     fromAmountInUSD
//     //     fromCurrencyKey
//     //     toCurrencyKey
//     //     block
//     //     timestamp
//     //     toAddress
//     //     toAmount
//     //     toAmountInUSD
//     //     feesInUSD
//     //   }
//     // }`,
// 		query: `{
// 			snxholders(orderBy: block, orderDirection: desc) {
// 				id
// 				balanceOf
// 				collateral
// 				transferable
// 				initialDebtOwnership
// 				debtEntryAtIndex
// 				block
// 			}
// 		}`,
//     variables: null,
//   });

//   const response = await fetch('https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix-exchanges', {
//     method: 'POST',
//     body,
//   });

//   const json = await response.json();
//   // const { synthExchanges } = json.data;

//   const res = json.data
//   console.log(res);
// }

// const synthetix = require('synthetix');
// const ethers = require('ethers');

// const network = 'kovan';

// const key = process.env.etherscan_key

// const provider = ethers.getDefaultProvider(network);

// const { abi } = synthetix.getSource({
//   network,
//   contract: 'Synthetix',
// });

// const { address } = synthetix.getTarget({
//   network,
//   // Note: for contracts with proxies, events are always emitted on the Proxy,
//   // so we need to use this address here
//   contract: 'ProxyERC20',
// });

// const { inputs, signature } = abi.find(
//   ({ type, name }) => type === 'event' && name === 'SynthExchange'
// );

// (async () => {
//   const exchanges = await provider.getLogs({
//     topics: [signature],
//     address,
//     fromBlock: 0,
//     toBlock: 1e10, // note the upper bound here may need to be changed in the future
//   });

//   const iface = new ethers.utils.Interface(abi);

//   for (const exchange of exchanges) {
//     console.log('Found SynthExchange event:');

//     const { values } = iface.parseLog(exchange);

//     console.log(
//       '\t',
//       values.account,
//       ethers.utils.parseBytes32String(values.fromCurrencyKey),
//       ethers.utils.formatEther(values.fromAmount),
//       ethers.utils.parseBytes32String(values.toCurrencyKey),
//       ethers.utils.formatEther(values.toAmount)
//     );
//   }
// })()
