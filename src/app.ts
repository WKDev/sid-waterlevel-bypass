import express, { Request, Response, NextFunction } from 'express';
import mqtt, { IClientOptions } from 'mqtt';
import 'dotenv/config'

const options : IClientOptions = {
  host: process.env.MQTT_HOST?.toString(),
  port: Number(process.env.MQTT_PORT),
  protocol: "mqtts",
  username: String(process.env.MQTT_USER_ID),
  password: String(process.env.MQTT_PASSWORD),
};

const app = express();
const client = mqtt.connect(options)
const port = process.env.LOCAL_PORT

client.on("connect", () => {	
  console.log("connected"+ client.connected);
})

client.on("error", (error) => { 
  console.log("Can't connect" + error);
})

app.get('/welcome', (req: Request, res: Response, next: NextFunction) => {
    console.log(req)
    res.send('welcome!');
});

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  console.log(req)
  res.send('welcome!');
});

app.listen(port, () => {
    console.log(`
  ################################################
  🛡️  Server listening on port: ${port}
  ################################################
`);
});