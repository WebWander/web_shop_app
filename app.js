import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes.js';
import dotenv from 'dotenv';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(bodyParser.json());
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

