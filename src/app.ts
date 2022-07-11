import express, { Request, Response, NextFunction } from 'express';
import mqtt, { IClientOptions, IClientPublishOptions } from 'mqtt';
import 'dotenv/config'
import { PrismaClient } from '@prisma/client';
import internal from 'stream';

const prisma = new PrismaClient();
const water02_correction_factor : number = 158;

const options: IClientOptions = {
  host: process.env.MQTT_HOST?.toString(),
  port: Number(process.env.MQTT_PORT),
  protocol: "tcp",
  username: process.env.MQTT_USER_ID,
  password: process.env.MQTT_PASSWORD,
};

const sendOptions: IClientPublishOptions = {
  retain: false,
  qos: 0
}



const app = express();
const client = mqtt.connect(options)
const port = process.env.LOCAL_PORT

async function createData(id:any, level:any){

  // model SensorLog {
  //   id          Int       @id @default(autoincrement())
  //   sensorType String?   @db.VarChar(255)
  //   name        String?   @db.VarChar(255)
  //   createdAt   DateTime  @db.Timestamptz(6) @default(now())
  //   data        Json?   @db.Json
  //   deviceId   Int?
  //   Device     Device?  @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  // }

  const kr_time_transform = new Date().getTime() + (new Date().getTimezoneOffset() * 60 * 1000) + 9 * 60 * 60 * 1000;
  const date_correction = new YMDate(kr_time_transform)

  const level_correction : Number = Math.round(Number(level) / 10);


  const jsontype  = {level: String(level_correction)}
  
  const create = await prisma.sensorLog.create({
    data:{
      name: "C_AE-D-Water02-NAJ-001",
      sensorType:"Waterlevel",
      data: jsontype,
      deviceId:1,
      createdAt: date_correction
    }
  })
}

client.on("connect", () => {
  console.log("MQTT connected : " + client.connected);
})

client.on("error", (error) => {
  console.log("Can't connect" + error);
})

class YMDate extends Date {
  constructor(raw_date:any) {
    super(raw_date);

  }

  YYYYMMDDHHMMSS() {
    var yyyy = this.getFullYear().toString();
    var MM = this.pad(this.getMonth() + 1, 2);
    var dd = this.pad(this.getDate(), 2);
    var hh = this.pad(this.getHours(), 2);
    var mm = this.pad(this.getMinutes(), 2)
    var ss = this.pad(this.getSeconds(), 2)

    return yyyy + MM + dd + "T"+ hh + mm + ss;
  }
  pad(number: number, length: number) {
    var str = '' + number;
    while (str.length < length) {
      str = '0' + str;
    }
    return str;
  }
}


function om2mPayload(level: string): string {
  // Payload Message for oneM2M

  //dist_ topic : “/oneM2M/req/’Entity ID’/IN_CSE-BASE-1"
  //dist_ topic : “/oneM2M/req/C_AE-D-Water02-NAJ-001/IN_CSE-BASE-1"

  //tenantID : NAJ-001
  //DeviceID : Water02
  //TagID : WaterLevel
  
  const kr_time_transform = new Date().getTime() + (new Date().getTimezoneOffset() * 60 * 1000) + 9 * 60 * 60 * 1000;
  const date_correction = new YMDate(kr_time_transform)

  const level_correction : Number = water02_correction_factor - Math.round(Number(level) / 10);

  let msg: string = `<m2m:rqp xmlns:m2m="http://www.onem2m.org/xml/protocols">
<op>1</op>
<to>/IN_CSE-BASE-1/cb-1/ae-Water02-NAJ-001/ts-Waterlevel</to>
<fr>C_AE-D-Water02-NAJ-001</fr>
<rqi>uniqueid</rqi>
<ty>30</ty>
<pc>
<m2m:tsi>
<lbl>tscin-label</lbl>
<dgt>${String(date_correction.YYYYMMDDHHMMSS())}</dgt>
<con>${String(level_correction)}</con>
</m2m:tsi>
</pc>
</m2m:rqp> 
`
  return msg
}

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  // const date = new YMDate()
  const kr_time_transform = new Date().getTime() + (new Date().getTimezoneOffset() * 60 * 1000) + 9 * 60 * 60 * 1000;
  const date = new YMDate(kr_time_transform)

  res.send(String(date.YYYYMMDDHHMMSS()))
});


app.get('/om2msend', (req: Request, res: Response, next: NextFunction) => {
  console.log('trying to send data...')
  const {id, level} = req.query
  createData(id, level)

  // client.publish("/oneM2M/req/C_AE-D-Water02-NAJ-001/IN_CSE-BASE-1", om2mPayload(String(req.query.level)), sendOptions)

  res.sendStatus(200)
});

app.listen(port, () => {
  console.log(`
  ################################################
    Server listening on port: ${port}
  ################################################
`);
});