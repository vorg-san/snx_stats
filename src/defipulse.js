const axios = require('axios')
const moment = require('moment')
const {defipulse_key} = require('./env')

async function getTotalValueLocked() {
  try {
    let res = await axios.get(
      'https://data-api.defipulse.com/api/v1/defipulse/api/GetHistory?project=synthetix&length=2&resolution=history&api-key=' +
			defipulse_key
    )
    let defi_snx = res.data.map((v) => ({
      time: new Date(v.timestamp * 1000),
      tvlUSD: v.tvlUSD,
    }))
		//this endpoint returns one element per day plus one for current hour, the daily one has hours = '00:00:00'
		console.log(moment.utc(defi_snx[1].time).format("hh:mm:ss"), moment.utc(defi_snx[0].time).format("hh:mm:ss a") === '00:00:00', moment.utc(defi_snx[1].time).format("hh:mm:ss") === '00:00:00')

    return defi_snx
  } catch (e) {
    console.log(e.data, e.message)
  }
}

module.exports = {
	getTotalValueLocked : getTotalValueLocked
}