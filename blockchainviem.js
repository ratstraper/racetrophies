import { createPublicClient, http, getContract, isAddress, formatEther } from 'viem'
import { mainnet, polygon, polygonAmoy } from 'viem/chains'
import { mnemonicToAccount } from 'viem/accounts'
import axios from 'axios'

const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous": false,"inputs":[{"indexed": true,"internalType":"address","name":"owner","type":"address"},{"indexed": true,"internalType":"address","name":"approved","type":"address"},{"indexed": true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous": false,"inputs":[{"indexed": true,"internalType":"address","name":"owner","type":"address"},{"indexed": true,"internalType":"address","name":"operator","type":"address"},{"indexed": false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous": false,"inputs":[{"indexed": false,"internalType":"string","name":"name","type":"string"},{"indexed": false,"internalType":"uint32","name":"sex","type":"uint32"},{"indexed": false,"internalType":"uint32","name":"birthday","type":"uint32"},{"indexed": false,"internalType":"uint256","name":"age","type":"uint256"}],"name":"LogAthleteRegistered","type":"event"},{"anonymous": false,"inputs":[{"indexed": false,"internalType":"address","name":"athlete","type":"address"},{"indexed": false,"internalType":"uint256","name":"id","type":"uint256"}],"name":"LogBurn","type":"event"},{"anonymous": false,"inputs":[{"indexed": false,"internalType":"address","name":"athlete","type":"address"},{"indexed": false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed": false,"internalType":"uint32","name":"time","type":"uint32"}],"name":"LogMint","type":"event"},{"anonymous": false,"inputs":[{"indexed": false,"internalType":"uint256","name":"race","type":"uint256"},{"indexed": false,"internalType":"uint256","name":"number","type":"uint256"}],"name":"LogParticipantAdded","type":"event"},{"anonymous": false,"inputs":[{"indexed": false,"internalType":"uint256","name":"index","type":"uint256"},{"indexed": false,"internalType":"uint64","name":"meters","type":"uint64"},{"indexed": false,"internalType":"string","name":"name","type":"string"}],"name":"LogRaceAdded","type":"event"},{"anonymous": false,"inputs":[{"indexed": true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed": true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous": false,"inputs":[{"indexed": true,"internalType":"address","name":"from","type":"address"},{"indexed": true,"internalType":"address","name":"to","type":"address"},{"indexed": true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint64","name":"_orgId","type":"uint64"},{"internalType":"uint64","name":"_meters","type":"uint64"},{"internalType":"uint64","name":"_start","type":"uint64"},{"internalType":"uint64","name":"_end","type":"uint64"},{"internalType":"uint256","name":"_price","type":"uint256"},{"internalType":"uint32","name":"_multitrack","type":"uint32"},{"internalType":"uint32","name":"_consecutive","type":"uint32"},{"internalType":"string","name":"_distance","type":"string"},{"internalType":"string","name":"_name","type":"string"}],"name":"createRace","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_raceId","type":"uint256"},{"internalType":"uint32","name":"_bib","type":"uint32"},{"internalType":"string","name":"_word","type":"string"}],"name":"depositRacer","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_orgId","type":"uint256"}],"name":"getActiveRacesByOrg","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"bool[]","name":"","type":"bool[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_raceId","type":"uint256"}],"name":"getAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_raceId","type":"uint256"}],"name":"getAthleteAddress","outputs":[{"components":[{    "internalType":"uint256",    "name":"bib",    "type":"uint256"},{    "internalType":"address",    "name":"athlete",    "type":"address"}],"internalType":"struct Athlete.BIBAddress[]","name":"bibs","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_athlete","type":"address"}],"name":"getAthleteProfile","outputs":[{"components":[{    "internalType":"string",    "name":"name",    "type":"string"},{    "internalType":"uint32",    "name":"sex",    "type":"uint32"},{    "internalType":"uint256",    "name":"age",    "type":"uint256"},{    "components":[    {        "internalType":"uint128",        "name":"race",        "type":"uint128"    },    {        "internalType":"uint32",        "name":"runner_number",        "type":"uint32"    },    {        "internalType":"uint32",        "name":"dates",        "type":"uint32"    },    {        "internalType":"uint32",        "name":"times",        "type":"uint32"    },    {        "internalType":"uint32",        "name":"ages",        "type":"uint32"    }    ],    "internalType":"struct Athlete.RaceResult[]",    "name":"history",    "type":"tuple[]"}],"internalType":"struct Athlete.AthleteProfile","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_athlete","type":"address"},{"internalType":"uint256","name":"_raceId","type":"uint256"}],"name":"getAthleteTime","outputs":[{"components":[{    "internalType":"uint128",    "name":"race",    "type":"uint128"},{    "internalType":"uint32",    "name":"runner_number",    "type":"uint32"},{    "internalType":"uint32",    "name":"dates",    "type":"uint32"},{    "internalType":"uint32",    "name":"times",    "type":"uint32"},{    "internalType":"uint32",    "name":"ages",    "type":"uint32"}],"internalType":"struct Athlete.RaceResult","name":"res","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_athlete","type":"address"}],"name":"getAthleteTimes","outputs":[{"components":[{    "internalType":"uint128",    "name":"race",    "type":"uint128"},{    "internalType":"uint32",    "name":"runner_number",    "type":"uint32"},{    "internalType":"uint32",    "name":"dates",    "type":"uint32"},{    "internalType":"uint32",    "name":"times",    "type":"uint32"},{    "internalType":"uint32",    "name":"ages",    "type":"uint32"}],"internalType":"struct Athlete.RaceResult[]","name":"res","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_raceId","type":"uint256"}],"name":"getCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_raceId","type":"uint256"}],"name":"getFinishers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"getNameOrganizire","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_raceId","type":"uint256"}],"name":"getOrgByRace","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_raceId","type":"uint256"}],"name":"getRace","outputs":[{"components":[{    "internalType":"string",    "name":"distance",    "type":"string"},{    "internalType":"string",    "name":"name",    "type":"string"},{    "internalType":"uint64",    "name":"meters",    "type":"uint64"},{    "internalType":"uint64",    "name":"orgId",    "type":"uint64"},{    "internalType":"uint64",    "name":"start",    "type":"uint64"},{    "internalType":"uint64",    "name":"end",    "type":"uint64"},{    "internalType":"uint256",    "name":"price",    "type":"uint256"},{    "internalType":"uint256",    "name":"amount",    "type":"uint256"},{    "internalType":"uint32",    "name":"counter",    "type":"uint32"},{    "internalType":"uint32",    "name":"finishers",    "type":"uint32"},{    "internalType":"uint32",    "name":"active",    "type":"uint32"},{    "internalType":"uint32",    "name":"multitrack",    "type":"uint32"},{    "internalType":"uint32",    "name":"consecutive",    "type":"uint32"},{    "internalType":"uint96",    "name":"reserved",    "type":"uint96"}],"internalType":"struct Race.Races","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_raceId","type":"uint256"}],"name":"getRaceTimes","outputs":[{"components":[{    "internalType":"uint128",    "name":"race",    "type":"uint128"},{    "internalType":"uint32",    "name":"runner_number",    "type":"uint32"},{    "internalType":"uint32",    "name":"dates",    "type":"uint32"},{    "internalType":"uint32",    "name":"times",    "type":"uint32"},{    "internalType":"uint32",    "name":"ages",    "type":"uint32"}],"internalType":"struct Athlete.RaceResult[]","name":"res","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_orgId","type":"uint256"}],"name":"getRacesByOrg","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"uint32","name":"_sex","type":"uint32"},{"internalType":"uint32","name":"_birthday","type":"uint32"}],"name":"registerAthlete","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_raceId","type":"uint256"},{"internalType":"uint32","name":"_bib","type":"uint32"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"uint32","name":"_sex","type":"uint32"},{"internalType":"uint32","name":"_birstday","type":"uint32"},{"internalType":"string","name":"_promocode","type":"string"}],"name":"registerRacer","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_raceId","type":"uint256"},{"internalType":"uint256","name":"_active","type":"uint256"}],"name":"setActive","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_raceId","type":"uint256"},{"internalType":"uint64","name":"_start","type":"uint64"},{"internalType":"uint64","name":"_end","type":"uint64"}],"name":"setDate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_raceId","type":"uint256"},{"internalType":"uint256","name":"_price","type":"uint256"}],"name":"setPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_raceId","type":"uint256"},{"internalType":"bytes32[]","name":"_codes","type":"bytes32[]"},{"internalType":"uint256","name":"_count","type":"uint256"},{"internalType":"uint256","name":"_discount","type":"uint256"}],"name":"setPromocode","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_athlete","type":"address"},{"internalType":"uint256","name":"_raceId","type":"uint256"},{"internalType":"uint32","name":"_time","type":"uint32"},{"internalType":"string","name":"_baseUrl","type":"string"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_address","type":"address"}],"name":"setOrganizersAddr","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"_to","type":"address"},{"internalType":"uint256","name":"_tokenamount","type":"uint256"}],"name":"withdrawTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenContract","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdrawToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"url","type":"string"}],"name":"setContractURL","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_ids","type":"uint256[]"},{"internalType":"string[]","name":"_baseUrl","type":"string[]"}],"name":"setURI","outputs":[{"internalType":"bool[]","name":"","type":"bool[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"contractURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}]
const address = "0xa77bbde7ec67fb57a900db6c35adc474f0126e54"
// const abi = parseAbi([
//    'function getAthleteTime(address, uint256) view returns (uint256)',
// {"inputs":[{"internalType":"address","name":"_athlete","type":"address"},
//   {"internalType":"uint256","name":"_raceId","type":"uint256"}],
//   "name":"getAthleteTime",
//   "outputs":[{"components":[
//     {    "internalType":"uint128",    "name":"race",    "type":"uint128"},
//     {    "internalType":"uint32",    "name":"runner_number",    "type":"uint32"},
//     {    "internalType":"uint32",    "name":"dates",    "type":"uint32"},
//     {    "internalType":"uint32",    "name":"times",    "type":"uint32"},
//     {    "internalType":"uint32",    "name":"ages",    "type":"uint32"}],
//     "internalType":"struct Athlete.RaceResult","name":"res","type":"tuple"}],
//     "stateMutability":"view","type":"function"},

//    'function totalSupply() view returns (uint256)',
// ])
const wagmiContaract = {
  address: address,
  abi: CONTRACT_ABI
};
/**
 * https://viem.sh/docs/
 * 
 */

export class BlockchainViem {

  constructor() {
    this.client = createPublicClient({ 
      batch: {
        multicall: true, 
      },
      chain: polygon,   //https://viem.sh/docs/clients/transports/http#usage
      transport: http(), 
    }) 
    this.contract = getContract({ abi: CONTRACT_ABI, address: address, client: this.client })
  }

  isAddress(address) { return isAddress(address) }
  formatEther(wei) { return formatEther(wei) }

  getContractAddress() { return address }

  async getBalance() { 
    const balance = await this.client.getBalance({address: address}) 
    // console.log(`Balance of contract: \x1b[30m${formatEther(balance)}\x1b[0m MATIC`) //grey
    // console.log(`Balance of contract: \x1b[31m${formatEther(balance)}\x1b[0m MATIC`) //red
    console.log(`Balance of contract: \x1b[32m${formatEther(balance)}\x1b[0m MATIC`) //green
    // console.log(`Balance of contract: \x1b[33m${formatEther(balance)}\x1b[0m MATIC`) //yellow
    // console.log(`Balance of contract: \x1b[34m${formatEther(balance)}\x1b[0m MATIC`) //blue
    // console.log(`Balance of contract: \x1b[35m${formatEther(balance)}\x1b[0m MATIC`) //
    // console.log(`Balance of contract: \x1b[36m${formatEther(balance)}\x1b[0m MATIC`) //cyan
    // console.log(`Balance of contract: \x1b[37m${formatEther(balance)}\x1b[0m MATIC`) //white
  }

  async getRacesByOrg(id)  {
    return await this.client.readContract({
      ...wagmiContaract,
      functionName: 'getRacesByOrg',
      args: [id]
    })
  }

  async getRace(id) {
    return await this.client.readContract({
      ...wagmiContaract,
      functionName: 'getRace',
      args: [id]
    })
  }

  async getRaces(ids) {
    var races = Array()
    for(var i = 0; i < ids.length; i++) {
      races.push({
        address: address,
        abi: [{"inputs":[{"internalType":"uint256","name":"_raceId","type":"uint256"}],"name":"getRace","outputs":[{"components":[{    "internalType":"string",    "name":"distance",    "type":"string"},{    "internalType":"string",    "name":"name",    "type":"string"},{    "internalType":"uint64",    "name":"meters",    "type":"uint64"},{    "internalType":"uint64",    "name":"orgId",    "type":"uint64"},{    "internalType":"uint64",    "name":"start",    "type":"uint64"},{    "internalType":"uint64",    "name":"end",    "type":"uint64"},{    "internalType":"uint256",    "name":"price",    "type":"uint256"},{    "internalType":"uint256",    "name":"amount",    "type":"uint256"},{    "internalType":"uint32",    "name":"counter",    "type":"uint32"},{    "internalType":"uint32",    "name":"finishers",    "type":"uint32"},{    "internalType":"uint32",    "name":"active",    "type":"uint32"},{    "internalType":"uint32",    "name":"multitrack",    "type":"uint32"},{    "internalType":"uint32",    "name":"consecutive",    "type":"uint32"},{    "internalType":"uint96",    "name":"reserved",    "type":"uint96"}],"internalType":"struct Race.Races","name":"","type":"tuple"}],"stateMutability":"view","type":"function"}],
        functionName: 'getRace',
        args: [ids[i]]
      })
    }
    return await this.client.multicall({
      contracts: races
    })
  }

  async getAthleteTimesAndActiveRacesByOrg(orgId, athleteAddress) {
    return await this.client.multicall({
      contracts: [ 
        {
          ...wagmiContaract,
          functionName: 'getActiveRacesByOrg',
          args: [orgId]
        },
        {
          ...wagmiContaract,
          functionName: 'getAthleteTimes',
          args: [athleteAddress]
        } 
      ]
    })
  }

  async getActiveRacesByOrg(id) {
    const races = await this.client.readContract({
      ...wagmiContaract,
      functionName: 'getActiveRacesByOrg',
      args: [id]
    })
    var obj = new Array()
    races[0].forEach((element, index) => {
      obj.push({id:Number(element), f: races[1][index]})
    })
    return obj
  }

  async getAthleteTime(athleteAddress, raceId) {
    return await this.client.readContract({
      ...wagmiContaract,
      functionName: 'getAthleteTime',
      args: [athleteAddress, raceId]
    })
    // const athleteTime = await this.contract.read.getAthleteTime(athleteAddress, raceId)
    // console.log("getAthleteTime", athleteTime)
  }

  async getAthleteRegistredTime(athleteAddress, ids) {
    var races = Array()
    for(var i = 0; i < ids.length; i++) {
      races.push({
        address: address,
        abi: [{"inputs":[{"internalType":"address","name":"_athlete","type":"address"},{"internalType":"uint256","name":"_raceId","type":"uint256"}],"name":"getAthleteTime","outputs":[{"components":[{    "internalType":"uint128",    "name":"race",    "type":"uint128"},{    "internalType":"uint32",    "name":"runner_number",    "type":"uint32"},{    "internalType":"uint32",    "name":"dates",    "type":"uint32"},{    "internalType":"uint32",    "name":"times",    "type":"uint32"},{    "internalType":"uint32",    "name":"ages",    "type":"uint32"}],"internalType":"struct Athlete.RaceResult","name":"res","type":"tuple"}],"stateMutability":"view","type":"function"}],
        functionName: 'getAthleteTime',
        args: [athleteAddress, ids[i]]
      })
    }
    return await this.client.multicall({
      contracts: races
    })
  }

  async getAthleteTimes(athleteAddress) {
    console.log("getAthleteTimes", athleteAddress)
    return await this.client.readContract({
      ...wagmiContaract,
      functionName: 'getAthleteTimes',
      args: [athleteAddress]
    })
  }

  /**
   * Get a result Athlete from the race
   * @param {*} athleteAddress 
   * @param {*} raceId 
   */
  async getAthleteFromRace(athleteAddress, raceId) {
    return await this.client.multicall({
      contracts: [ 
        {
          ...wagmiContaract,
          functionName: 'getAthleteTime',
          args: [athleteAddress, raceId]
        }, 
        {
          ...wagmiContaract,
          functionName: 'getAthleteProfile',
          args: [athleteAddress]
        }, 
      ]
    })
  }

  async getToken(tokenId) {
    let result
    try {
      const token = await this.client.multicall({
        contracts: [ 
          {
            ...wagmiContaract,
            functionName: 'ownerOf',
            args: [tokenId]
          }, 
          {
            ...wagmiContaract,
            functionName: 'tokenURI',
            args: [tokenId]
          }, 
        ]
      })
      let owner = token[0].result //await contract.methods.ownerOf(tokenId).call()
      let uri = token[1].result //await contract.methods.tokenURI(tokenId).call()
      let url = this.ipfs_url_from_hash(uri.slice(7));
      let res = await axios.get(url)
        .then(data => {
          // logger.log(data)            
          return data
        });
      // let desc = await res.data.properties.image.description;
      // let ret = (await "https://ipfs.io/ipfs/") + desc;
      res.data.owner = owner
      // res.json(res.data)
      result = res.data
    } catch (err) {
      // logger.error('error', err)
      console.error(err)
        delete err.stack
        delete err.xsrfCookieName
        delete err.xsrfHeaderName
        delete err.headers
        delete err.config
        result = err
    }
    return result
  }

  ipfs_url_from_hash(h) {
    return "https://ipfs.io/ipfs/" + h;
  }
}
// const [name, totalSupply, symbol, balance] = await Promise.all([
//   contract
// .read.name(),
//   contract.read.totalSupply(),
//   contract.read.symbol(),
//   contract.read.balanceOf([address]),
// ])

// module.exports. Blockchain = BlockchainViem;
// export default BlockchainViem