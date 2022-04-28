import dotenv from"dotenv";
import express from "express";
import cors from "cors";
import chalk from "chalk";
import Joi from "joi";
import { MongoClient } from "mongodb";

const app = express();
app.use(express.json());
app.use(cors());

let dados;

const mongoClient = new MongoClient("localhost:27017");

mongoClient.connect().then( () => {
    dados = mongoClient.db("projeto-12");
})

const porta = 5000;

const usuarios = [];

app.post("/participants", (req, res) => {
    console.log(chalk.yellow("Cadastrando usuário..."));
    const usuario = req.body;
    db.collection("usuarios").insertOne(usuario).then(() => {
        console.log(chalk.green(`Usuário ${usuario.name} cadastrado!`));
        res.status(201).send("Criado!");
    })
})

app.get("/participants", (req, res) => {
    console.log(chalk.yellow("Buscando usuários..."))

    res.send(usuarios);
})

app.listen(porta, () => {
    console.log(chalk.blue(`Servidor criado na porta ${porta}`))
})