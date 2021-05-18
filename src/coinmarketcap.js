const axios = require('axios')

async function getVolume24h() {
  try {
    let res = await axios.get('https://coinmarketcap-api.synthetix.io/public/prices?symbols=SNX')
    let cmc_snx = res.data.data

    return cmc_snx.SNX.quote.USD.volume_24h
  } catch (e) {
    console.log(e.data, e.message)
  }
}

module.exports = {
	getVolume24h : getVolume24h
}