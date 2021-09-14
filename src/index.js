import express           from "express";
import routes            from "./routes.js";
import morgan            from "morgan";
import { fileURLToPath } from 'url';
import path              from "path";
import cors              from "cors";
import dotenv            from "dotenv";

import "./database/index.js";


const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;

dotenv.config({ path: path.resolve(__dirname, '.env') });

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    app.use(cors());
    next();
})

app.use(express.static(path.resolve(__dirname, 'public'))); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());
app.use(routes);

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});

