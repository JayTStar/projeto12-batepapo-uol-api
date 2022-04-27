import 'dotenv/config';
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const porta = 5000;

app.listen(porta, () => {
    console.log(`Servidor subido na porta ${porta}`)
})