import dotenv from"dotenv";
import express from "express";
import cors from "cors";
import chalk from "chalk";
import Joi from "joi";
import { MongoClient } from "mongodb";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const mongoClient = new MongoClient("mongodb://localhost:27017");

const porta = 5000;

app.post("/participants", async (req, res) => {
    const usuario = {
        name: req.body.name,
        lastStatus: Date.now()
    }
    try{
        console.log(chalk.yellow("Acessando banco de dados..."));
        await mongoClient.connect();
        const dados = mongoClient.db("projeto-12");
        console.log(chalk.yellow("Cadastrando usuário..."));
        await dados.collection("usuarios").insertOne(usuario);
        console.log(chalk.green(`Usuário ${usuario.name} cadastrado!`));

        res.status(201).send("Criado!");

        console.log(chalk.yellow("Fechando conexão"));
        mongoClient.close();
    }
    catch(e){
        console.log(`Deu ruim, erro: ${e}`);
        mongoClient.close();
    }
})

app.get("/participants", async (req, res) => {
    try{
        console.log(chalk.yellow("Acessando banco de dados..."));
        await mongoClient.connect();
        const dados = mongoClient.db("projeto-12");
        console.log(chalk.yellow("Pegando usuarios..."));
        const collectionUsuarios = dados.collection("usuarios");
        const usuarios = await collectionUsuarios.find({}).toArray();

        res.status(200).send(usuarios)
        mongoClient.close();
    }
    catch(e){
        console.log(`Deu ruim, erro: ${e}`);
        mongoClient.close();
    }
})

app.listen(porta, () => {
    console.log(chalk.blue(`Servidor criado na porta ${porta}`))
})