
function formatDollar(strNum) {
	var p = strNum.split(".");
  var chars = p[0].split('').reverse()
  var newstr = ''
  var count = 0
  for (x in chars) {
    count++
    if (count % 3 == 1 && count != 1) {
      newstr = chars[x] + ',' + newstr
    } else {
      newstr = chars[x] + newstr
    }
  }
  return newstr + (strNum.indexOf('.') !== -1 ? '.' + p[1] : '')
}

function toCurrency(num) {
  if (!num) {
    return 0
  }
  let s = num.toString()
  if (s.indexOf('.') !== -1) {
    s = s.match(/^-?\d+(?:\.\d{0,2})?/)[0]
	}
  return formatDollar(s)
}

function percentDiff(oldValue, newValue) {
	const o = parseFloat(oldValue)
	const n = parseFloat(newValue)
	const change = parseInt(1000 * (n - o) / o) / 10

	if(change === 0) {
		return ''
	} else {
		if(change > 0) {
			return '🔥+' + change + '%'	
		} else {
			return '🔻' + change + '%'	
		}
	}
}

function numericDiff(oldValue, newValue) {
	const o = parseFloat(oldValue)
	const n = parseFloat(newValue)
	const change = n - o

	if(change === 0) {
		return ''
	} else {
		if(change > 0) {
			return '🔥+' + change
		} else {
			return '🔻' + change
		}
	}
}

function oneDecimal(num) {
	return Math.round(num * 10) / 10
}

module.exports = {
	toCurrency: toCurrency,
	percentDiff: percentDiff,
	oneDecimal: oneDecimal
}