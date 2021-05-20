const {open, access} = require('fs/promises')
const {constants} = require('fs')

class File {
  constructor() {
    this._fileName = 'data.txt'
    this._columnsSeparator = '||'
    this._columns = [
      'Time',
      'Price (USD)',
      'Percent SNX Staked',
      'Volume 24h (USD)',
      'Total Value Locked (USD)',
      'Fees',
      'Rewards',
      'Start Fee period',
			'Rank'
    ]
  }

  get columns() {
    return this._columns
  }

  async appendData(time, price, percentStaked, volume24h, tvl, fees, rewardsToDistribute, startTime, rank) {
    const data = [time, price, percentStaked, volume24h, tvl, fees, rewardsToDistribute, startTime, rank]

    if (!(await this.fileExists())) {
      await this.createOrResetFile()
    }

    if (data.length !== this._columns.length) {
      console.log('Wrong number of columns, file was not appended')
    } else {
      const file = await open(this._fileName, 'a')
      await file.write('\n' + data.join(this._columnsSeparator))
      await file.close()
    }
  }

  async fileExists() {
    try {
      const a = await access(this._fileName, constants.F_OK)
      return true
    } catch (error) {
      return false
    }
  }

  async createOrResetFile() {
    const file = await open(this._fileName, 'w')
    await file.write(this._columns.join(this._columnsSeparator))
    await file.close()
  }

  async readLastData() {
    if (await this.fileExists()) {
      const file = await open(this._fileName, 'r')
      const res = await file.readFile({encoding: 'utf8'})
      await file.close()

      return res.substr(res.lastIndexOf('\n') + 1).split(this._columnsSeparator)
    } else {
      return ''
    }
  }
}

module.exports = File
