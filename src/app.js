const {getSNXPrice, getSNXStaked, getTradingFees} = require('./synthetix')
const {getVolume24h} = require('./coinmarketcap')
const {getTotalValueLocked} = require('./defipulse')
const {readLastData, appendData, columns} = require('./file')
const moment = require('moment')

const minMinutesInterval = 1

async function insertNewData() {
	
}

async function run() {
	try {
		const last = await readLastData()

		if(!last.length)
			await insertNewData()
		else
			if(moment().diff(moment(last[columns.time]), 'minutes') >= minMinutesInterval)
				await insertNewData()
	} catch (error) {
		console.log(error)
	}	
}


// 'Time',
//   'Price (USD)',
//   'Total Supply (SNX)',
//   'Percent SNX Locked',
//   'Volume 24h (USD)',
//   'Total Value Locked (USD)',
//   'Fees',