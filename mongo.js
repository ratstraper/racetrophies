import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config()
const url = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_SERVER}/?authMechanism=DEFAULT&authSource=runtothemoondb`
// const client = new MongoClient(url);
const dbName = 'runtothemoondb';

// MongoDB
export class MongoDB {
  constructor() {
    this.client = new MongoClient(url, {
      // compressors: "zlib",
      // zlibCompressionLevel: 5,
      // srvMaxHosts: 0,
      // maxPoolSize: 10
    })
    this.client.connect();
    console.log('\x1b[34mMongo connection established\x1b[0m')
  }


  async getRace(id) {
    try {
      const db = this.client.db(dbName)
      const collection = db.collection('races')
      const results = await collection.find({ raceId: Number(id) }).limit(100).toArray() // Ограничьте количество возвращаемых результатов
      console.log('Found documents =>', results)
      return results
    } catch (err) {
      console.error('Error fetching race:', err)
      throw err
    }
  }

  async getAllRaces() {
    const db = this.client.db(dbName)
    let races = await db.collection("races").find({}).toArray() 
    // races.sort(function(a, b){
        // return b.raceId - a.raceId 
    // })
    return races
  }

  async getRawRegister(race_id, bib) {
    const db = this.client.db(dbName)
    let reg = await db.collection("registration").find({$and: [{ raceId: { $eq: race_id } }, { bib: { $eq: bib } }]}).toArray()
    if(reg.length > 0) {
      return reg
    }
    return null
  }

  async raceFromDB(id) {
      const db = this.client.db(dbName)
      let row = await db.collection("races").find({raceId: { $eq: id } }).toArray()
      let result = new Object()
      if(row.length > 0) {
        result.distance   = row[0].distance
        result.title      = row[0].title
        result.description  = row[0].description
        result.timeout    = "2 недели со дня регистрации"    //2 недели со дня регистрации
        result.image_race = row[0].image_race
        result.type       = row[0].type
        result.trophy     = row[0].trophy
        result.color      = row[0].color
        result.dark_color = row[0].dark_color
        result.banner     = row[0].banner       
      }
      return result
  }

  // async getActiveRaces(orgId) {
  //     let races = new Array()
  //     try {
  //         let times = new Array()
  //         let ids = new Array()
  //         const db = this.client.db(dbName)
  //         races = await db.collection("races").find({}).toArray() 
  //     } catch(e) {
  //         console.error('error', e)
  //     }

  //     races.sort(function(a, b){
  //         return b.raceId - a.raceId 
  //     })
  //     // console.log(races)
  //     return races
  // }

  async getRacesByIds(ids) {
    try {
      const db = this.client.db(dbName)
      const results = await db.collection("races").find({raceId: { $in: ids }}).toArray() 
      return results
    } catch (err) {
      console.error('Error fetching races by ids:', err);
      throw err;
    }
  }

  async getMaxRaceId() {
    try {
      const db = this.client.db(dbName)
      const collection = db.collection("races");
      const results = await collection.find().sort({ raceId: -1 }).limit(1).toArray();
      return results[0];
    } catch (err) {
      console.error('Error fetching max raceId:', err);
      throw err;
    }
  }

  async insertRaceMongoDB (race) {
    try {
      const obj = JSON.parse(race);
      // var n128 = mongodb.Decimal128.fromString(obj.price)
      // obj.price = n128
      obj.price = mongodb.Decimal128.fromString(obj.price);
      const db = this.client.db(dbName)
      const insert_res = await db.collection('races').insertOne(obj);
      return insert_res;
    } catch (err) {
      console.error('Error inserting race:', err);
      throw err;
    }
  }

  /**
   * Получить рассотяние которое уже пробежали
   */
  async getAllMeters() {
    try {
      const db = this.client.db(dbName)
      const collection = db.collection("moonway");
      const results = await collection.aggregate([{$group: {_id:null, sum: {$sum:"$meters"}}}]).toArray();
      var distance = 0;
      if(results[0] != undefined) {
        distance = this.addCommas((results[0].sum/1000).toFixed(2));
      }
      return {
        run_meters: distance,
        total_meters: "384,400.00"
      }
    } catch (err) {
      console.error('Error fetching moonway aggregate:', err);
      throw err;
    }
  }


  addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  }
  // async closeMongoConnection() {
  //     if (this.mongoClient) {
  //         await this.mongoClient.close();
  //         console.log('Mongo connection closed');
  //     }
  // }

  // Call this function before exiting the application
  async exitHandler() {
    await closeMongoConnection();
    process.exit();
  }
  
//   process.on('SIGINT', exitHandler);
//   process.on('SIGTERM', exitHandler);
//   process.on('exit', exitHandler);
}

// module.exports.MongoDB = MongoDB;