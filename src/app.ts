import express, { Request, Response, NextFunction } from 'express';

const app = express();
const port = process.env.PORT

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