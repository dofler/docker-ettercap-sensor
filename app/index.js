const spawn = require('child_process').spawn
const request = require('request')
const chalk = require('chalk')

const parserName = 'Dsniff'

// The child process.  If dsniff terminates, we will attempt to restart it,
// and would prefer to keep the child itself out of the recursion.
var child

function run() {
  console.log(`${parserName}(${chalk.blue('startup')}) : Monitoring on ${process.env.MONITOR_INTERFACE}`)
  console.log(`${parserName}(${chalk.blue('startup')}) : Starting up child process`)
  child = spawn('dsniff' [
    '-i ', config.Monitoring.interface
  ])

  // If we have been requested to shut down, then we should do so gracefully
  process.on('SIGUSR2', function(){
    console.log(`${parserName}(${chalk.blue('shutdown')}) : Shutting down child process`)
    child.stdin.pause()
    child.kill()
    process.exit()
  })

  // Pass anything from standard error directly to the log.
  child.stderr.on('data', function(data) {
    console.log(`${parserName}(${chalk.yellow('stderr')}) : ${data.toString().replace(/(\r\n|\n|\r)/gm)}`)
  })

  // If dsniff exits for some reason, we should log the event to the console
  // and then initiate a new instance to work from.
  child.on('close', function(code) {
    console.log(`${parserName}(${chalk.yellow('close')}) : Child terminated with code ${code}`)
    run()
  })

  // If dsniff is failing to start, then we need to log that event
  child.on('error', function(error) {
    console.log(`${parserName}(${chalk.red('close')}) : Could not start the child process`)
  })

  // When dsniff outputs data to standard output, we want to capture that
  // data, interpret it, and hand it off to the database.
  child.stdout.on('data', function(data) {
    var entry = data.toString()
    // When we get new standard output, we want to check it against a couple of
    // regex patterns.
    var rdata = /USER: (.+?)  PASS: (.+?)  INFO: (.*)/gm
    var rproto = /^(.+?) :/gm
    var raw = rdata.exec(entry);
    var proto = rproto.exec(entry);
    
  })
}