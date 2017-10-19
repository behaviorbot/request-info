module.exports = getComment

function getComment (comment, defaultComment) {
  // comment can be either a string or an array

  if (!comment) {
    comment = defaultComment
  }

  if (typeof comment === 'string' || comment instanceof String) {
    return comment
  } else {
    const pos = getRandomInt(0, comment.length)
    return comment[pos] || defaultComment
  }
}

function getRandomInt (min, max) {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  // The maximum is exclusive and the minimum is inclusive

  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}
