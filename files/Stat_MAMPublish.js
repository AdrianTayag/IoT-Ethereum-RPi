//WIP:
let Protecc = require ("./Protecc.js")
let SC = require ("./SourceController.js")

const Mam = require('../lib/mam.client.js')
const { asciiToTrytes, trytesToAscii } = require('@iota/converter')
const mode = 'public'
const provider = 'https://nodes.devnet.iota.org'
const mamExplorerLink = `https://mam-explorer.firebaseapp.com/?provider=${encodeURIComponent(provider)}&mode=${mode}&root=`
let mamState = Mam.init(provider)

// Publish to tangle
const publish = async packet => {
    const trytes = asciiToTrytes(JSON.stringify(packet))
    const message = Mam.create(mamState, trytes)
    mamState = message.state
    // Attach the payload
    await Mam.attach(message.payload, message.address, 3, 9)
    console.log('Published at ', Date().toLocaleString(), packet, '\n');
    console.log('Root: ', message.root, '\n');
    return message.root
}

const publishAll = async () => {
  var stat1 , stat2
  stat1 = Protecc.PCstatus()
  stat2 = SC.status()
  const root = await publish({stat1}) //Protection Coordinator Stats
  await publish({stat2}) //Source Controller Stats
  return root
}

// Callback used to pass data out of the fetch
const logData = data => console.log('Fetched and parsed at ', Date().toLocaleString(), '\n', JSON.parse(trytesToAscii(data)), '\n')

publishAll()
  .then(async root => {
    const result = await Mam.fetch(root, mode)
    var status
    result.messages.forEach(message => status =  JSON.parse(trytesToAscii(message)))
    console.log(status)
    console.log(`Verify with MAM Explorer:\n${mamExplorerLink}${root}\n`);
  })