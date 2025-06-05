require("./system/global")
const func = require("./system/place")
const readline = require("readline")
const usePairingCode = true
const yargs = require("yargs")
const axios = require("axios")
const { Boom } = require('@hapi/boom');
const { load_Module } = require("./system/function.js")
global.status = 0
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
})
const question = (text) => {
return new Promise((resolve) => {
rl.question(text, resolve)
})}

const DataBase = require('./system/database.js');
const database = new DataBase();
(async () => {
const loadData = await database.read()
if (loadData && Object.keys(loadData).length === 0) {
global.db = {
users: {},
groups: {},
database: {},
settings : {}, 
...(loadData || {}),
}
await database.write(global.db)
} else {
global.db = loadData
}
setInterval(async () => {
if (global.db) await database.write(global.db)
}, 5000)
})()

async function startSesi() {
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
const { state, saveCreds } = await useMultiFileAuthState(`./session`)

const connectionOptions = {
version: (await (await fetch('https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/src/Defaults/baileys-version.json')).json()).version,
browser: ['Ubuntu', 'Safari', '18.1'],
getMessage: async (key) => {
if (store) {
const msg = await store.loadMessage(key.remoteJid, key.id, undefined)
return msg?.message || undefined
}
return {
conversation: 'hallo'
}}, 
printQRInTerminal: !usePairingCode,
logger: pino({ level: "silent" }),
auth: state
}

const Skyzopedia = await func.makeWASocket(connectionOptions)
if (usePairingCode && !Skyzopedia.authState.creds.registered) {
const phoneNumber = await question(chalk.blue.bold('Masukan Nomor WhatsApp :\n'));
const code = await Skyzopedia.requestPairingCode(phoneNumber.trim())
await console.log(`${chalk.blue.bold('Kode Pairing')} : ${chalk.white.bold(code)}`)
rl.close()
}

await store?.bind(Skyzopedia.ev)

Skyzopedia.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect } = update
if (connection === 'close') {
const reason = new Boom(lastDisconnect?.error)?.output.statusCode
console.log(lastDisconnect.error)
if (lastDisconnect.error == 'Error: Stream Errored (unknown)') {
process.exit()
} else if (reason === DisconnectReason.badSession) {
console.log(`Bad Session File, Please Delete Session and Scan Again`)
process.exit()
} else if (reason === DisconnectReason.connectionClosed) {
console.log('[SYSTEM]\nConnection closed, reconnecting...')
process.exit()
} else if (reason === DisconnectReason.connectionLost) {
console.log('[SYSTEM]\nConnection lost, trying to reconnect')
process.exit()
} else if (reason === DisconnectReason.connectionReplaced) {
console.log('Connection Replaced, Another New Session Opened, Please Close Current Session First')
Skyzopedia.logout()
} else if (reason === DisconnectReason.restartRequired) {
console.log('Restart Required...');
startSesi()
} else if (reason === DisconnectReason.loggedOut) {
console.log(`Device Logged Out, Please Scan Again And Run.`)
Skyzopedia.logout()
} else if (reason === DisconnectReason.timedOut) {
console.log('Connection TimedOut, Reconnecting...')
startSesi()
}
} else if (connection === "open") {
console.log(chalk.blue.bold('Succees Connected To Server'))
Skyzopedia.sendMessage(Skyzopedia.user.id.split(":")[0]+"@s.whatsapp.net", {text: "Tersambung ✅"})
}
})

Skyzopedia.ev.on('messages.upsert', async (chatUpdate) => {
try {
m = chatUpdate.messages[0]
if (!m.message) return
m.message = (Object.keys(m.message)[0] === 'ephemeralMessage') ? m.message.ephemeralMessage.message : m.message
if (m.key && m.key.remoteJid === 'status@broadcast') return 
if (!Skyzopedia.public && m.key.remoteJid !== global.owner+"@s.whatsapp.net" && !m.key.fromMe && chatUpdate.type === 'notify') return
m = await func.smsg(Skyzopedia, m, store)
if (m.isBaileys) return
if (status == 0) {
await load_Module(Skyzopedia)
global.status = 1 }
require("./message.js")(Skyzopedia, m, store)
} catch (err) {
console.log(err)
}
})

Skyzopedia.ev.on('contacts.update', (update) => {
for (let contact of update) {
let id = Skyzopedia.decodeJid(contact.id)
if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
}
})

Skyzopedia.ev.on('creds.update', saveCreds)
Skyzopedia.public = true

return Skyzopedia
}

startSesi()

process.on('uncaughtException', function (err) {
console.log('Caught exception: ', err)
})

let file = require.resolve(__filename) 
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.cyan("File Update => "), chalk.cyan.bgBlue.bold(`${__filename}`))
delete require.cache[file]
require(file)
})