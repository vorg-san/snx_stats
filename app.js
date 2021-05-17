const fetch = require("node-fetch");
const snxData = require("synthetix-data");
const axios = require("axios");

cmc_key = process.env.cmc_key;
defipulse_key = process.env.defipulse_key;

async function cmc() {
  try {
    let res = await axios.get(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=SNX&convert=USD",
      {
        headers: { "X-CMC_PRO_API_KEY": cmc_key },
      }
    );
    let cmc_snx = res.data.data;

    let basic = {
      eth_address: cmc_snx.SNX.platform.token_address,
      max_supply: cmc_snx.SNX.max_supply,
      circulating_supply: cmc_snx.SNX.circulating_supply,
      total_supply: cmc_snx.SNX.total_supply,
      rank: cmc_snx.SNX.cmc_rank,
      price: cmc_snx.SNX.quote.USD.price,
      volume_24h: cmc_snx.SNX.quote.USD.volume_24h,
      percent_change_1h: cmc_snx.SNX.quote.USD.percent_change_1h,
      percent_change_24h: cmc_snx.SNX.quote.USD.percent_change_24h,
      percent_change_7d: cmc_snx.SNX.quote.USD.percent_change_7d,
      market_cap: cmc_snx.SNX.quote.USD.market_cap,
    };

    console.log(basic);
  } catch (e) {
    console.log(e.data, e.message);
  }
}
// cmc();

async function defipulse() {
	
	try {
    let res = await axios.get(
      'https://data-api.defipulse.com/api/v1/defipulse/api/GetHistory?project=synthetix&length=5&resolution=history&api-key=' + defipulse_key
    );
    let defi_snx = res.data.map(v => ({time: new Date(v.timestamp * 1000), tvlUSD: v.tvlUSD}))

    console.log(defi_snx);
  } catch (e) {
    console.log(e.data, e.message);
  }
}
defipulse()

async function getVolume() {}
async function getTradingFees() {}
async function getTotalValueLocked() {}

async function getPercentSNXStaked() {
  let totalDailyActiveStakers = await snxData.snx.aggregateActiveStakers({
    max: 2,
  });
  console.log(totalDailyActiveStakers);
}
// getPercentSNXStaked()

async function getTotal() {
  let totalExchange = await snxData.exchanges.total();
  console.log(totalExchange.totalFeesGeneratedInUSD);

  let holders = await snxData.snx.holders({ max: 2 });

  console.log(holders, holders.length);
}
// getTotal()


// let holders = await snxData.snx.total();
// console.log(holders);

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
