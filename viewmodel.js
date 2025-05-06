import { MongoDB } from './mongo.js'
import { BlockchainViem } from './blockchainviem.js'
var maticPrice = 0

export class ViewModel {
    constructor() {
        this.mongo = new MongoDB()
        this.blockchain = new BlockchainViem()
        //await web3.eth.getGasPrice()
        //await web3.eth.getAccounts() 
        this.blockchain.getBalance()
    }

    async getRaceById(race_id) {
        var [race_db, race_blockchain] = await Promise.all([
            this.mongo.raceFromDB(race_id),
            this.blockchain.getRace(race_id)
        ])
        race_blockchain.id          = race_id
        race_blockchain.distance    = race_db.distance
        race_blockchain.title       = race_db.title
        race_blockchain.description = race_db.description
        race_blockchain.image_race  = race_db.image_race
        race_blockchain.image_race  = race_db.image_race
        race_blockchain.type        = race_db.type
        race_blockchain.trophy      = race_db.trophy
        race_blockchain.color       = race_db.color
        race_blockchain.dark_color  = race_db.dark_color
        race_blockchain.banner      = race_db.banner 
        race_blockchain.price       = this.blockchain.formatEther(race_blockchain.price)
        race_blockchain.meters      = Number(race_blockchain.meters)
        race_blockchain.orgId       = Number(race_blockchain.orgId)
        race_blockchain.start       = Number(race_blockchain.start)
        race_blockchain.end         = Number(race_blockchain.end)
        race_blockchain.amount      = Number(race_blockchain.amount)
        race_blockchain.reserved    = Number(race_blockchain.reserved) 
        const nowSeconds = new Date().getTime() / 1000
        var active = true
        var tm = ''
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const start = Number(race_blockchain.start)
        if(start != 0) {
            var d = new Date(start * 1000).toLocaleDateString('en-En', options)
            tm = `from ${d} `
            if(nowSeconds < start) { active = false }
        }
        const end = Number(race_blockchain.end)
        if(end != 0) {
            var d = new Date(end * 1000).toLocaleDateString('en-En', options)
            tm = tm + `to ${d}`
            if(nowSeconds > end) { active = false }
        }
        if(tm.length == 0) {
            tm = 'no date limit'
        }
        race_blockchain.active      = active
        race_blockchain.timeout 	= tm 

        return race_blockchain
    }

    async getRace(raceId, athleteAddress) {
        var reg_date
        var profile
        var race_register
        let track_files = new Array()
        try {
            let race = await this.getRaceById(raceId)
            if(!this.blockchain.isAddress(athleteAddress)) {
                console.log("getRace::athleteAddress", athleteAddress, "is not address")
                let result      = new Object()
                result.status   = 10
                result.race     = race
                return result
            }
            const athlete = await this.blockchain.getAthleteFromRace(athleteAddress, raceId)
            console.log("getRace::profile", athlete)
            race_register = athlete[0].result
            if(race_register.runner_number > 0 ) {
                let rows = await this.mongo.getRawRegister(raceId, Number(race_register.runner_number))
                console.log("rows:", rows)
                if(rows !== null) {
                    for(let i = 0; i< rows.length; i++) {
                        if(rows[i].action == 'REG') {
                            if(rows[i].date > 0) {
                                reg_date = this.dateFormat(rows[i].date.toString().substring(0,10).replaceAll('-', ''))
                            } else {
                                reg_date = null
                            }
                        } else if(rows[i].action == 'TR') {
                            track_files.push({date: this.dateFormat(rows[i].date.toString().substring(0,10).replaceAll('-', '')), original_file: rows[i].original_file})
                        }
                    }
                }
            }
            profile = athlete[1].result
            console.log("getRace::profile", profile)
            if(profile == undefined || profile.name.length == 0) {
                //Владелец этого адреса еще не зарегистрированный атлет
                // console.log("Владелец этого адреса еще не зарегистрированный атлет")
                let result      = new Object()
                result.status   = 1
                result.athlete  = new Object()
                result.athlete.name = "unregistered person"
                result.race     = race
                return result
            } else {
                //["Runner 1","1","31",[["1","101","20220811","40","31"],["2","1","20220811","167","31"]]]
                /* name: 'Runner 1',
                sex: '1',
                age: '31',
                history: [
                  [
                    race: '1',
                    runner_number: '101',
                    dates: '20220811',
                    times: '40',
                    ages: '31'
                  ], */
                
                if(Number(race_register.runner_number) == 0) {
                    //Это зарегистрированный атлет, но не внесший депозит за этот забег
                    // logger.log("Это зарегистрированный атлет, но не внесший депозит за этот забег")
                    let result      = new Object()
                    result.status   = 2
                    result.athlete  = new Object()
                    result.race     = race
                    result.athlete.name = profile.name
                    result.athlete.sex  = profile.sex === 1 ? "M" : "F"
                    result.athlete.age  = Number(profile.age)
                    result.athlete.bib  = Number(race_register.runner_number)
        
                    return result
                    // race: '3',
                    // runner_number: '0',
                    // dates: '0',
                    // times: '0',
                    // ages: '0'
                  
                } else if(Number(race_register.dates) == 0) {
                    if(race.active == false) {
                        let result      = new Object()
                        result.status   = 5
                        result.athlete  = new Object()
                        result.race     = race
                        result.athlete.name = profile.name
                        result.athlete.sex  = profile.sex === 1 ? "M" : "F"
                        result.athlete.age  = Number(profile.age)
                        return result
                    } else {
    
                        if(track_files.length > 0) {
                            // Зарегистрированный атлет, участвующий в забеге, отправивший трек на подтверждение
                            let result      = new Object()
                            result.status   = 4
                            result.athlete  = new Object()
                            result.race     = race
                            result.athlete.name = profile.name
                            result.athlete.sex  = profile.sex === 1 ? "M" : "F"
                            result.athlete.age  = Number(profile.age)
                            result.athlete.bib  = Number(race_register.runner_number)
                            result.athlete.register = reg_date
                            result.athlete.end  = race.end
                            result.tracks = track_files
                            return result
                        } else {
                            //Зарегистрированный атлет, участвующий в забеге
                            let result      = new Object()
                            result.status   = 3
                            result.athlete  = new Object()
                            result.race     = race
                            result.athlete.name = profile.name
                            result.athlete.sex  = profile.sex === 1 ? "M" : "F"
                            result.athlete.age  = Number(profile.age)
                            result.athlete.bib  = Number(race_register.runner_number)
                            result.athlete.register = reg_date
                            result.athlete.end  = race.end
            
                            return result
                        }            
                    }
                    // ? Проверить файлы относящиеся к забегу 30000000301
                    // а если еще и дата забега истекла, то тогда - 
                    // Участник, который не пробежал свой забег.
                    // race: '3',
                    // runner_number: '301',
                    // dates: '0',
                    // times: '0',
                    // ages: '0'
                } else {
                    //Зарегистрированный атлет, участвующий в забеге, получивший медаль финишера (NFT)
                    let date = new Date(this.dateFormat(race_register.dates.toString()))
                    let date_string = `${date.toLocaleDateString("en-US", { month: 'long' })} ${date.toLocaleDateString("en-US", { day: 'numeric' })}, ${date.toLocaleDateString("en-US", { year: 'numeric' })}`
                    let tokenId = (raceId * 10000000000) + Number(race_register.runner_number)
                    let uri = await this.blockchain.getToken(tokenId)
        
                    let result      = new Object()
                    result.status   = 6
                    result.race     = race
                    result.athlete  = new Object()
                    result.athlete.name = profile.name
                    result.athlete.sex  = profile.sex === 1 ? "M" : "F"
                    result.athlete.age  = Number(race_register.ages)
                    result.athlete.bib  = Number(race_register.runner_number)
                    result.athlete.date = this.dateFormat(race_register.dates.toString())
                    result.athlete.track_time = this.timeFormat(race_register.times)
                    result.athlete.contract = this.blockchain.getContractAddress()
                    result.athlete.tokenId = tokenId
                    result.athlete.nftImage = uri.image
                    result.athlete.nftAnimation = uri.animation_url
                    result.athlete.description = `${profile.name} ${date_string} finished the ${race.distance} race with start number ${race_register.runner_number} in ${this.timeFormat(race_register.times)}`
                    return result
                }
            }
            // logger.log("name:", profile.name.length)
            // logger.log("res:", profile)
            return profile    
        } catch(e) {
            // logger.error('error', e)
            return {status: 0, message: e.message}
        }
    }

    async getAllMeters() {
        return await this.mongo.getAllMeters()
    }
    async getActiveRaces(org) { 
        return await this.mongo.getAllRaces(org)
        /*
        let races = new Array()
        try {
            let ids = await this.blockchain.getRacesByOrg(orgId)
            races = await this.mongo.getRacesByIds(ids) 
            const rid = Array()
            for(var i = 0; i < races.length; i++) {
                rid.push(races[i].raceId)
            }
            let results = await this.blockchain.getRaces(rid)
            for(var i = 0; i < results.length; i++) {
                // // const race = await this.blockchain.getRace(races[i].raceId)
                delete races[i]._id
                // // delete element.orgId
                races[i].start      = this.timestampFormat(Number(results[i].result.start))
                races[i].end        = this.timestampFormat(Number(results[i].result.end))
                races[i].active     = Boolean(results[i].result.active)
                var price           = results[i].result.price //new web3.utils.BN(race.price)
                races[i].price      = Number(price).toString()
                races[i].multitrack = Boolean(results[i].result.multitrack)          
            }
            // console.log("results:", races)
        } catch(e) {
            console.error("getActiveRacesByWallet:", e)
        }
        races.sort(function(a, b) {
            return b.raceId - a.raceId 
        })
        return races
        */
    }

    /**
     * Список активных забегов организатора org (для участника с wallet)
     */
    async getActiveRacesByWallet(orgId, athleteAddress) { 
        // let athleteAddress = req.query.wallet
        const validAddress = this.blockchain.isAddress(athleteAddress)
        let races = new Array()
        try {
            const data = await this.blockchain.getAthleteTimesAndActiveRacesByOrg(orgId, athleteAddress)
            let times = data[1].result !== undefined ? data[1].result : []
            var araces = new Array()
            data[0].result[0].forEach((element, index) => {
                araces.push({id:Number(element), f: data[0].result[1][index]})
            })
            // console.log("getActiveRacesByWallet:araces", araces)
            
            let ids = new Array()
            let idz = new Array()
            let idr = new Array()

            if(araces !== undefined) {      
                for(var index = 0; index < araces.length; index++) {
                    if(araces[index].f || times.find(time => time.race == araces[index].id)) { // 
                        ids.push(Number(araces[index].id))
                    } else if(araces[index].f === false && validAddress) {
                        //когда есть адрес и неактивные забеги.
                        //наверняка медленная часть функции
                        //нужно вынести в бд это просроченные забеги - TimeOut
                        idz.push(araces[index].id)
                        // let rc = await contract.methods.getAthleteTime(athleteAddress, araces[index].id).call()
                        // if(rc.runner_number > 0) {
                        //     ids.push(Number(araces[index].id))
                        // }
                    }
                }
                //getAthleteTime(athleteAddress, idz)
            }
            // здксь можно регулировать какие из щабегов показывать
            // console.log("getActiveRacesByWallet:ids", ids)
            // console.log("getActiveRacesByWallet:idz", idz)
            // var traces = await this.mongo.getRacesByIds(idz) 
            races = await this.mongo.getAllRaces() //db.collection("races").find({}).toArray() 
            const nowSeconds = new Date().getTime() / 1000
            for(var i = 0; i < races.length; i++) {
                delete races[i]._id
                delete races[i].orgId
                // delete races[i].start
                // delete races[i].end
                // delete races[i].active
                delete races[i].price
                delete races[i].multitrack 
                
                const found = times.find(time => time.race == races[i].raceId);
                if(found != undefined) {
                    races[i].finish = new Object()
                    races[i].finish.runner_number = found.runner_number
                    races[i].finish.date = this.dateFormat(found.dates.toString())
                    races[i].finish.track_time = this.timeFormat(found.times) 
                    races[i].finish.image_trophy = ""
                    races[i].finish.color = "#0386FF"
                    races[i].finish.dark_color = "#004C93"
                } else if(validAddress) {
                    // batchcount++
                    //когда times не найден, то есть атлет возможно оплатил и получил номер, 
                    //но еще не получил медаль
                    //очень медленная часть. Надо бы придумать как ее замениь на бд
                    //в результате дает баннер Registred
                    // logger.log('info', `getActiveRaces ${athleteAddress} - found`) 
                    idr.push(races[i].raceId)
                    /*
                    batch.add(contract.methods.getAthleteTime(athleteAddress, races[i].raceId).call
                        .request({from: accounts[0]}, 'latest',
                        (err, register) => {
                            if(err) {
                                batchcount--
                                return console.error(err)
                            }
                            if(register.runner_number == '0') { //!=
                                console.log(register) 
                                // races[register.race].finish = new Object()
                                // races[register.race].finish.runner_number = register.race //runner_number
                                // races[register.race].finish.date = 0
                                // races[register.race].finish.track_time = 0
                                // races[register.race].finish.color = "#0386FF"
                                // races[register.race].finish.dark_color = "#004C93"
                            }
                        batchcount--
                        }
                    ));
                    */
                }
                //banner
                // delete races[i].active

                var active = races[i].active == 1
                const start = Number(races[i].start)
                if(start > 0 && nowSeconds < start) { active = false }
                const end = Number(races[i].end)
                if(end > 0 && nowSeconds > end) { active = false }
                // console.log(`races[${i}] - ${races[i].title}`)
                // for test: show any card active
                // if(i % 3 == 0) {
                //     races[i].active = 1
                // } else 
                if(!active) {
                    delete races[i].banner
                    races[i].banner = {
                        title: "THE RACE",
                        desc: "IS OVER",
                        color: "#555555",
                        dark_color: "#444444"
                    }
                    races[i].active = 0
                }

                delete races[i].start
                delete races[i].end
                
            }
            const registred = await this.blockchain.getAthleteRegistredTime(athleteAddress, idr)
            // console.log("getActiveRacesByWallet:", registred)
            // console.log("getActiveRacesByWallet::races", races)
            registred.forEach((element, index) => {
                if(element.result.runner_number == '0') { 
                    // console.log(`unregister[${index}]:`, element.result)
                } else {
                    races[element.result.race].finish = new Object()
                    races[element.result.race].finish.runner_number = element.result.race //runner_number
                    races[element.result.race].finish.date = 0
                    races[element.result.race].finish.track_time = 0
                    races[element.result.race].finish.color = "#0386FF"
                    races[element.result.race].finish.dark_color = "#004C93"
                }
            })
            // console.log("getActiveRacesByWallet::races", races)
        } catch(e) {
            console.error('error', e)
        }

        races.sort(function(a, b){
            if(b.active != a.active) {
                return b.active - a.active
            } 
            if(a.finish == undefined && b.finish != undefined) {
                // return 1
                if(a.active == 1) {
                    return -1
                } else { return 1}
            }
            if(a.finish != undefined && b.finish == undefined) {
                // return -1
                if(a.active == 1) {
                    return 1
                } else { return -1}
            }
            return b.raceId - a.raceId 
        })
        return races
    }

    async getToken(id) {
        return await this.blockchain.getToken(id)
    }


    async registerRacer(athleteAddress, raceId, bib, name, sex, birstday, promocode) {
        return await this.blockchain.registerRacer(athleteAddress, raceId, bib, name, sex, birstday, promocode)
    }

    // async registerAthlete(athleteAddress, raceId, runner_number) {
    //     return 0
    // }


    /**
     * h:mm:ss.sss 5010999 => 50:10.999
     * @param {String} str 
     * @returns String
     */
    timeFormat(str) {
        var time = '';
        let tm = str
        let sss = tm % 1000
        let ss = ((tm / 1000) % 100) >> 0
        let mm = ((tm / 100000) % 100) >> 0
        let h = (tm / 10000000) >> 0
        if(h > 0) { time = `${h}:` }
        if(mm > 9) { time += `${mm}:` } else { time += `0${mm}:` }
        if(ss > 9) { time += `${ss}` } else { time += `0${ss}` }
        //if(sss > 99) { time += `${sss}` } else if(sss > 9) { time += `0${sss}` } else { time += `00${sss}` }
        return time
    }

    /**
     * 
     * @param {String} 20220811 -> YYYYMMDD 
     * @returns месяц/день/год
     * дд/ММ/гггг	30/05/2006	Великобритания, Вьетнам, Израиль, Индонезия, Испания, Италия, Франция
     * М/д/гггг	5/30/2006	США
     * Для отображения на сайте использовать следующий формат даты: MDY (mmmm-dd-yyyy) (example: April 9, 2019) 
     * В блокчейне дата записывается в виде YYYYMMDD
     * Во взаимодействии API и фронденда (в json) использовать Международный формат дат YYYY/MM/DD, 2020/12/31
     */
    dateFormat(str) { 
        return str.slice(0, 4) + '/' + str.slice(4, 6) + '/' + str.slice(6, 8)
    }

    nowDate() {
        var dd = new Date()
        return dd.toISOString() //.substring(0,10).replaceAll('-', '')
    }    

    /**
     * 
     * @param {*} str 
     * @returns месяц-день-год
     */
    timestampFormat(str) {
        console.log("timestampFormat", str)
        if(str > 0) {
            var date_start  = new Date(str * 1000)
            return date_start.toLocaleDateString('eu-ES') + " " + date_start.toLocaleTimeString('en-ES')
        } 
        return null
    }  
    
    async getMaticPrice(now) {
        if(now == true || maticPrice === 0) {
            maticPrice = await this.blockchain.getMaticPrice()
        }
        return maticPrice
    } 
}

// module.exports.ViewModel = ViewModel