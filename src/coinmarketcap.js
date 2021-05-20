const axios = require('axios')

async function getVolume24h() {
  try {
    let res = await axios.get('https://coinmarketcap-api.synthetix.io/public/prices?symbols=SNX')
    let cmc_snx = res.data.data

    return {volume24h: cmc_snx.SNX.quote.USD.volume_24h, rank: cmc_snx.SNX.cmc_rank}
  } catch (e) {
    console.log(e.data, e.message)
  }
}

module.exports = {
  getVolume24h: getVolume24h,
}
