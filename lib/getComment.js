function getComment (comment, defaultComment) {
  // set comment to default if none passed it
  const eventComment = comment || defaultComment

  // comment can be either a string or an array
  if (typeof eventComment === 'string' || eventComment instanceof String) {
    return eventComment
  } else {
    const pos = getRandomInt(0, comment.length)
    return eventComment[pos] || defaultComment
  }
}

function getRandomInt (min, max) {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  // The maximum is exclusive and the minimum is inclusive

  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

module.exports = getComment
