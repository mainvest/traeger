const transform = require('lodash/transform');
const isObject = require('lodash/isObject');

function getBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
  })
}

function deepMap(obj, iterator, context) {
  return transform(obj, function(result, val, key) {
    result[key] =
      isObject(val) && !(val instanceof File)
        ? deepMap(val, iterator, context)
        : iterator.call(context, val, key, obj)
  })
}

function promiseRecursive(obj) {
  const getPromises = (obj) =>
    Object.keys(obj).reduce(
      (acc, key) =>
        Object(obj[key]) !== obj[key]
          ? acc
          : acc.concat(
              typeof obj[key].then === 'function'
                ? [[obj, key]]
                : getPromises(obj[key])
            ),
      []
    )
  const all = getPromises(obj)
  return Promise.all(all.map(([obj, key]) => obj[key])).then((responses) => {
    all.forEach(([obj, key], i) => (obj[key] = responses[i]))
    return obj
  })
}

function convertFilesToBase64(dataWithFiles) {
  return new Promise((resolve) => {
    const convertedData = deepMap(dataWithFiles, (value, k) => {
      if (value instanceof File) {
        const base64 = getBase64(value)
        return base64
      } else {
        return value
      }
    })
    return resolve(promiseRecursive(convertedData))
  })
}

module.exports = function interceptor(config) {
  return convertFilesToBase64(config.data).then((converted) => {
    config.data = converted
    return config
  })
}
