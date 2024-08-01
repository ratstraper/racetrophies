import express from "express"
import axios from 'axios'
import bodyParser from "body-parser"
// const { Blockchain, Block } = require("./blockchain");
import { ViewModel } from "./viewmodel.js"
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const port = 3000
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let model = new ViewModel();

app.get("/", (req, res) => {
  res.render("index", { title: "Race Trophies !" })
  // sendMessage(`GET /`)
 });

 app.get("/w7", (req, res) => {
  res.render("wallet4")
 });

app.get("/races", (req, res) => {
  res.render("races");
  // sendMessage(`GET /races`)
});

app.get("/race/:id", (req, res) => {
  res.render("race", {race_id: req.params.id});
  // sendMessage(`GET /race ${req.params.id}`)
});

app.get("/token/:id", (req, res) => {
  res.render("token", {token_id: req.params.id});
  // sendMessage(`GET /token ${req.params.id}`)
});

app.get("/rules", (req, res) => {
  res.render("rules");
  // sendMessage(`GET /rules`)
});

app.get("/faq", (req, res) => {
  const data = fs.readFileSync(__dirname + "/public/assets/faq.json")
  res.render("faq", {data : JSON.parse(data)});
  // sendMessage(`GET /faq`)
});
/**
 * API
 */
// Создайте API маршрут для получения данных
app.get('/api/getAllMeters', async (req, res) => {
  try {
    const data = await model.getAllMeters()
    res.json(data);
  } catch (error) {
    console.error(error);
    const data = {}
    res.json(data)
    sendMessage(`GET /api/getAllMeters ${error}`)
  }  
});

app.get('/api/getToken', async (req, res) => {
  // console.log(req);
  try {
    const response = await axios.get(`https://racetrophies.online:3001/api/getToken?token=${req.query.id}`);
    const data = response.data;
    res.json(data);
  } catch (error) {
    console.error(error);
    const data = {}
    res.json(data) //.status(500).send('Произошла ошибка при получении данных');
  }  
  // sendMessage(`GET /getToken ${req.query.id}`)
});

app.get('/api/getActiveRaces', async (req, res) => {
  try {
    // const response = await axios.get(`https://racetrophies.online:3001/api/getActiveRaces?org=${req.query.org}&wallet=${req.query.wallet}`);
    // const data = response.data;
    console.log('GET /api/getActiveRaces', req.query)
    const data = await model.getActiveRacesByWallet(req.query.org, req.query.wallet)
    res.json(data);
  } catch (error) {
    console.error(error);
    const data = {}
    res.json(data) //.status(500).send('Произошла ошибка при получении данных');
    sendMessage(`GET /api/getRace ${error}`)
  }  
  // sendMessage(`GET /getActiveRaces ${req.query.org}, ${req.query.wallet}`)
});

app.get('/api/getRace', async (req, res) => {
  try {
    console.log('GET /api/getRace', req.query)
    const data = await model.getRace(parseInt(req.query.race), req.query.wallet)
    // const response = await axios.get(`https://racetrophies.online:3001/api/getRace?race=${req.query.race}&wallet=${req.query.wallet}`);
    // const data = response.data;
    // console.log("/api/getRace responce:", data)
    res.json(data);
  } catch (error) {
    console.error(error);
    const data = {}
    res.json(data) //.status(500).send('Произошла ошибка при получении данных')
    sendMessage(`GET /api/getRace ${error}`)
  }  
  // sendMessage(`GET /api/getRace ${req.query.race}, ${req.query.wallet}`)
});

app.get('/api/getDemoData', async (req, res) => {

});

// app.get('/api/mongo/getRace', async (req, res) => {
//   try {
//     const race = await model.getRace(req.query.race)
//     res.status(200);
//     res.json(race);
//   } catch (error) {
//     console.error(error);
//     res.status(500);
//     res.json({ error: error.message });
//   }
// })

// Может быть можно заменить вызов /api/getActiveRaces на этот когда будет реализована синхронизация миежду 
// блокчейном и DB. 
// Синхронизацию можнно сделать по событию записи в блокчейн + проверочная (медленная. скорее всего) запускаемая вручную
// app.get('/api/mongo/getActiveRaces', async (req, res) => {
//   try {
//     const response = await model.getActiveRaces(req.query.org)
//     // const data = response.data;
//     res.status(200);
//     res.json(response);
//   } catch (error) {
//     console.error(error);
//     const data = {}
//     res.json(data) //.status(500).send('Произошла ошибка при получении данных');
//   }  
// });
/**
 * Server listen
 */
// const options = {
//   key: fs.readFileSync("localhost.key"),
//   cert: fs.readFileSync("localhost.crt"),
// };
if(process.env.SERVER === 'PROD') {
  var privateKey, certificate, chainCA
  if(process.env.SSL === 'SERVER') {
    privateKey = fs.readFileSync( '/etc/letsencrypt/live/racetrophies.online/privkey.pem' );
    certificate = fs.readFileSync( '/etc/letsencrypt/live/racetrophies.online/cert.pem' );
    chainCA = fs.readFileSync('/etc/letsencrypt/live/racetrophies.online/chain.pem');
  } else if(process.env.SSL === 'LOCAL') {
    privateKey = fs.readFileSync( './privkey.pem' );
    certificate = fs.readFileSync( './cert.pem' );
  }
  https.createServer({
    key: privateKey,
    cert: certificate,
    ca: chainCA
  }, app).listen(port, () => {
    // logger.log('info', `Find the server at: https://localhost:${app.get("port")}/`); // eslint-disable-line no-con>
    console.log(`Find the server at: https://localhost:${port}/`); 
  });
} else {
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}

const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
const memoryData = process.memoryUsage();
const memoryUsage = {
  rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
  heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
  heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
  external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
};
console.log(memoryUsage);

function sendMessage(msg) {
  const telegram_message = `${new Date().toISOString()}: ${msg}`
  fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        chat_id: process.env.USER_TELEGRAM_ID,
        text: telegram_message
    })
  })
  .catch(error => {
      console.error('Error sending message:', error);
  });
}