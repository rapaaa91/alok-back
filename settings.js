require("./system/module.js")

// >~~~~~~ Setting Bot & Owner  ~~~~~~~< //
global.owner = "628386890336"
global.namabot = "Pterodactyl Skyzopedia" 
global.namaowner = "Skyzopedia"
global.packname = "Skyzo"
global.author = "Skyzo"

// >~~~~~~~~ Setting Api Panel ~~~~~~~~< //
global.egg = "15" // Isi id egg
global.nestid = "5" // Isi id nest
global.loc = "1" // Isi id location
global.domain = "https://panelwebsite.biz.id"
global.apikey = "ptla_QF0YsxnvobZSV5jwxBwI2sQZrOpraaz8fTsgrcq" // Isi api ptla
global.capikey = "ptlc_g4yYJ5Jb8mc3JcLt9KiY4iP3F9WfVRxXDLGDRvE" // Isi api ptlc


// >~~~~~~~~ Setting Message ~~~~~~~~~< //
global.msg = {
wait: "Memproses . . .", 
owner: "Fitur ini khusus untuk owner!", 
group: "Fitur ini untuk dalam grup!", 
admin: "Fitur ini untuk admin grup!", 
botadmin: "Fitur ini hanya untuk bot menjadi admin"
}


let file = require.resolve(__filename) 
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.cyan("File Update => "), chalk.cyan.bgBlue.bold(`${__filename}`))
delete require.cache[file]
require(file)
})