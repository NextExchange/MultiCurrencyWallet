import * as fs from 'fs'
import * as mnemonicUtils from 'common/utils/mnemonic'
import * as configStorage from './config/storage'
import { getNetworkType } from 'common/domain/network'
import { FG_COLORS as COLORS, BG_COLORS , colorString } from 'common/utils/colorString'

console.log(colorString(`Loading...`,COLORS.GREEN))

const rewriteEnvKeys = [
  `NETWORK`,
  `PORT`,
  `API_USER`,
  `API_PASS`,
  `SECRET_PHRASE`,
  `USE_JSON`,
  `SPREAD`
]
interface envKeys {
  NETWORK?: string,
  PORT?: string,
  API_USER?: string,
  API_PASS?: string,
  SECRET_PHRASE?: string,
  USE_JSON?: string,
  SPREAD?: string
}

const rewritedEnv: envKeys = {}
// Mnemonic
// Extract env from args
if (process.argv.length >= 3) {
  /* check - its may be run with seed */
  process.argv.forEach((param) => {
    const [ name, value ] = param.split('=')
    if (rewriteEnvKeys.indexOf(name) !== -1) {
      rewritedEnv[name] = value
    }
  })
}

rewriteEnvKeys.forEach((envKey) => {
  if (process.env[envKey] !== undefined) {
    rewritedEnv[envKey] = process.env[envKey]
  }
})

if (rewritedEnv.SECRET_PHRASE) {
  const mnemonic = rewritedEnv.SECRET_PHRASE
  if (mnemonicUtils.mnemonicIsValid(mnemonic)) {
    configStorage.setMnemonic(mnemonic)
    console.log(
      colorString('>>> Use Mnemonic:', COLORS.GREEN),
      colorString(mnemonic, COLORS.RED)
    )
  } else {
    console.log(colorString('>>> Your are pass not valid mnemonic', COLORS.RED))
    process.exit(0)
  }
}
// NETWORK
if (rewritedEnv.NETWORK !== undefined) {
  configStorage.setNetwork(getNetworkType(rewritedEnv.NETWORK))
}

// Use Json
if (process.env.USE_JSON_CONFIG === `true`) {
  configStorage.loadJson(configStorage.getNetwork())
  console.log(
    colorString('>>> Trade pairs: ', COLORS.GREEN),
    colorString(configStorage.getTradeTickers().toString(), COLORS.RED)
  )
}




const _loadDefaultEnv = () => {
  process.env.SERVER_ID='2234567890'
  process.env.ACCOUNT='2234567890'
  process.env.NETWORK = process.env.NETWORK || 'testnet'
  process.env.API_USER='user'
  process.env.API_PASS='password'
  process.env.PORT='3000'
  process.env.IP='0.0.0.0'
  process.env.WEB3_TESTNET_PROVIDER='https://rinkeby.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c'
  process.env.WEB3_MAINNET_PROVIDER='https://mainnet.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c'
}

_loadDefaultEnv()

if (process.env.TEST_STARTUP === `true`) {
  console.log(
    colorString('>>>> TEST STARTUP', COLORS.GREEN)
  )
  /* Test env */
  _loadDefaultEnv()
  process.env.SECRET_PHRASE='gospel total hundred major refuse when equal pilot goat soft recall abandon'

  setTimeout(() => {
    console.log('>>>> TEST READY - SHUTDOWN')
    process.exit(0)
  }, 30*1000)
} else {
  if (!fs.existsSync(__dirname + '/.env')) {
    if (!configStorage.hasTradeConfig()) {
      console.log('Please, create ./src/bot/.env file unsing "./src/bot/.env.sample"')
      process.exit(0)
    }
  } else {
    require('dotenv').config({
      path: __dirname + '/.env',
    })
  }
}

// Rewrite vars from .env with values from command line
Object.keys(rewritedEnv).forEach((envKey) => {
  process.env[envKey] = rewritedEnv[envKey]
})

import _debug from 'debug'

_debug('.:app')

console.log(
  colorString('>>> Marketmaker starts...', COLORS.GREEN)
)

exports = module.exports = require('./app')
/*
import * as app from './app'

console.log(app)

export default app
*/

