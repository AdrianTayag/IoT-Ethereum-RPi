const Gpio = require('onoff').Gpio
const island = new Gpio(23, 'in', 'rising', {debounceTimeout: 10})
const SD = new Gpio(10, 'out')
var trig

const Mam = require('../lib/mam.client.js')
const { asciiToTrytes, trytesToAscii } = require('@iota/converter')
const mode = 'public'
const provider = 'https://nodes.devnet.iota.org'
const mamExplorerLink = `https://mam-explorer.firebaseapp.com/?provider=${encodeURIComponent(provider)}&mode=${mode}&root=`

// Initialise MAM State
let mamState = Mam.init(provider, 'ZGUZDLLCSKMHHFTYLATBVSADVPKEGJOUOOJXAMGEOGKKNWWEBKPEOJKGYPFLHMWLFXKRQRYLL9QQRPGKR')
// Publish to tangle
const publish = async packet => {
    const trytes = asciiToTrytes(JSON.stringify(packet))
    const message = Mam.create(mamState, trytes)
    mamState = message.state
    await Mam.attach(message.payload, message.address, 3, 9)
    var d3 = new Date()
    console.log('Published at ', d3, packet, '\n')
    console.log('Root: ', message.root, '\n')
    return message.root
}

const publishAll = async () => {
  console.log('Publishing to IOTA...')
  const root = await publish({
    message: 'Microsource toggled / Islanding toggled',
    timestamp: ((new Date()).toLocaleString()),
    'remark': trig  //insert variable depending on commands
  })
  return root
}

//callback
const logData = data => {
  if (trig == 4){
    SD.writeSync(1)
    //Protecc.Island()
    var d2 = new Date()
    console.log(d2)
  }
}

island.watch((err, value) => {
  if (err) {
    throw err
  }
  console.log('Island pressed at')
  var d = new Date()
  console.log(d)
  trig = 4
  publishAll()
    .then(async root => {
      console.log('fetching...')
      const result = await Mam.fetch(root, mode, null, logData)
      var command
      result.messages.forEach(message => command =  JSON.parse(trytesToAscii(message)))
      console.log(`Verify with MAM Explorer:\n${mamExplorerLink}${root}\n`)
    })
  })
