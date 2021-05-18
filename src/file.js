const { open, access } = require('fs/promises')
const { constants } = require('fs')

const fileName = '_data.txt'
const columnsSeparator = '||'
const columnsStored = [
  'Time',
  'Price (USD)',
  'Total Supply (SNX)',
  'Percent SNX Locked',
  'Volume 24h (USD)',
  'Total Value Locked (USD)',
  'Fees',
]
const columns = {time: 0, price: 1, supply: 2, locked: 3, volume: 4, tvl: 5, fees: 6}

async function fileExists() {
  try {
    const a = await access(fileName, constants.F_OK)
    return true
  } catch (error) {
    return false
  }
}

async function createOrResetFile() {
  const file = await open(fileName, 'w')
  await file.write(columnsStored.join(columnsSeparator))
  await file.close()
}

async function readLastData() {
  if (await fileExists()) {
    const file = await open(fileName, 'r')
    const res = await file.readFile({ encoding: 'utf8' })
    await file.close()

    return res.substr(res.lastIndexOf('\n') + 1).split(columnsSeparator)
  } else {
    return ''
  }
}

async function appendData(data) {
  if (!(await fileExists())) {
    await createOrResetFile()
  }

  if (data.length !== columnsStored.length) {
    console.log('Wrong number of columns, file was not appended')
  } else {
    const file = await open(fileName, 'a')
    await file.write('\n' + data.join(columnsSeparator))
    await file.close()
  }
}

module.exports = {
	readLastData : readLastData,
	appendData : appendData,
	columns : columns
}