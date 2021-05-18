const axios = require('axios')

defipulse_key = process.env.defipulse_key

async function getTotalValueLocked() {
  try {
    let res = await axios.get(
      'https://data-api.defipulse.com/api/v1/defipulse/api/GetHistory?project=synthetix&length=5&resolution=history&api-key=' +
        defipulse_key
    )
    let defi_snx = res.data.map((v) => ({
      time: new Date(v.timestamp * 1000),
      tvlUSD: v.tvlUSD,
    }))

    return defi_snx
  } catch (e) {
    console.log(e.data, e.message)
  }
}

module.exports = {
	getTotalValueLocked : getTotalValueLocked
}