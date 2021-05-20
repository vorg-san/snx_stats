const axios = require('axios')
const moment = require('moment')
const {defipulse_key} = require('./config')

async function getTotalValueLocked() {
  try {
    let res = await axios.get(
      'https://data-api.defipulse.com/api/v1/defipulse/api/GetHistory?project=synthetix&length=3&resolution=history&api-key=' +
			defipulse_key
    )
    let defi_snx = res.data.map((v) => ({
      time: new Date(v.timestamp * 1000),
      tvlUSD: v.tvlUSD,
    }))
		
		//this endpoint returns one element per day plus one for current hour, the daily one has hours = '00:00:00'
		let lastDay = defi_snx.filter(v => moment.utc(v.time).format("HH:mm:ss") === '00:00:00')

		if(lastDay.length)
    	return lastDay[0].tvlUSD
		else
			return 0
  } catch (e) {
    console.log(e.data, e.message)
  }
}

module.exports = {
	getTotalValueLocked : getTotalValueLocked
}