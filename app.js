import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes.js';
import dotenv from 'dotenv';
import cors from 'cors';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:3000'  
}));

app.use(bodyParser.json());
app.use('/', routes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

