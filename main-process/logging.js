const fs = require('fs')
const path = require('path')

const logDir = path.resolve(__dirname,"../logs")

try {
    fs.mkdirSync(logDir)
} catch (err) {
    if (err.code !== 'EEXIST') throw err
}
const logFile = path.join(logDir,`${Date.now()}.log`)
const logStream = fs.createWriteStream(logFile, {flags: 'a'})


module.exports = {
    write: function(caller, args, level) {
        const process = `[${path.basename(caller)}]`
        var logLevel
        const utc = new Date().toJSON().slice(0, 23).replace(/T/, ' ')
        if (level === undefined) logLevel = '[INFO]'
        else if (level === 1) logLevel = '[WARN]'
        else if (level === 2) logLevel = '[ERROR]'
        else logLevel = '[DEBUG]'
        logStream.write(`${utc} ${process} ${logLevel} ${args}\n`)
    }

};