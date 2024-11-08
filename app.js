import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes.js';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize Helmet with recommended settings
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://trusted-scripts-source.com"],
      styleSrc: ["'self'", "https://trusted-styles-source.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://trusted-fonts-source.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);
app.use(helmet.hidePoweredBy());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.hsts({ maxAge: 63072000, includeSubDomains: true }));


app.use(cors({
  origin: 'http://localhost:3000'  
}));

app.use(bodyParser.json());
app.use('/', routes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

