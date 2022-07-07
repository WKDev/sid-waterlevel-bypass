import express, { Request, Response, NextFunction } from 'express';
import mqtt, { IClientOptions, IClientPublishOptions } from 'mqtt';
import 'dotenv/config'

const options : IClientOptions = {
  host: process.env.MQTT_HOST?.toString(),
  port: Number(process.env.MQTT_PORT),
  protocol: "tcp",
  username: process.env.MQTT_USER_ID,
  password: process.env.MQTT_PASSWORD,
};

const sendOptions : IClientPublishOptions = {
  retain:false,
  qos:0
}

const app = express();
const client = mqtt.connect(options)
const port = process.env.LOCAL_PORT

client.on("connect", () => {	
  console.log("MQTT connected : "+ client.connected);
})

client.on("error", (error) => { 
  console.log("Can't connect" + error);
})


function om2mPayload() : string{
  // Payload Message for oneM2M

  //dist_ topic : “/oneM2M/req/’Entity ID’/IN_CSE-BASE-1"
    //dist_ topic : “/oneM2M/req/C_AE-D-Water02-NAJ-001/IN_CSE-BASE-1"

  //tenantID : NAJ-001
  //DeviceID : Water02
  //TagID : WaterLevel

  let emul_msg : string =`
<m2m:rqp xmlns:m2m="http://www.onem2m.org/xml/protocols">
<op>1</op>
<to>/IN_CSE-BASE-1/cb-1/ae-Water02-NAJ-001/ts-Waterlevel</to>
<fr>C_AE-D-Water02-NAJ-001</fr>
<rqi>uniqueid</rqi>
<ty>30</ty>
<pc>
<m2m:tsi>
<lbl>tscin-label</lbl>
<dgt>20220706T161024</dgt>
<con></con>
</m2m:tsi>
</pc>
</m2m:rqp>
  `

  let msg:string = `<m2m:rqp xmlns:m2m="http://www.onem2m.org/xml/protocols">
<op>1</op>
<to>/IN_CSE-BASE-1/cb-1/ae-Water02-NAJ-001/ts-Waterlevel</to>
<fr>C_AE-D-Water02-NAJ-001</fr>
<rqi>uniqueid</rqi>
<ty>30</ty>
<pc>
<m2m:tsi>
<lbl>tscin-label</lbl>
<dgt>20220706T160900</dgt>
<con>20</con>
</m2m:tsi>
</pc>
</m2m:rqp> 
`
  return msg
}

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  console.log(req)
  console.log(req.query)
  console.log(req.query.height)
  console.log(req.query.d)

  res.sendStatus(200)
});


app.post('/om2msend', (req: Request, res: Response, next: NextFunction) => {
  console.log('trying to send data...')
  client.publish("/oneM2M/req/C_AE-D-Water02-NAJ-001/IN_CSE-BASE-1", om2mPayload(),sendOptions)

  res.sendStatus(200)
});

app.listen(port, () => {
    console.log(`
  ################################################
    Server listening on port: ${port}
  ################################################
`);
});