import dotenv from"dotenv";
import express from "express";
import cors from "cors";
import chalk from "chalk";
import Joi from "joi";
import { MongoClient } from "mongodb";

const app = express();
app.use(express.json());
app.use(cors());

const porta = 5000;

const usuarios = [];

app.post("/participants", (req, res) => {
    console.log(chalk.yellow("Cadastrando usuário..."));
    const usuario = req.body;
    console.log(chalk.green(`Usuário ${usuario.name} cadastrado!`));
    res.status(201).send("Criado!");
})

app.get("/participants", (req, res) => {
    console.log(chalk.yellow("Buscando usuários..."))

    res.send(usuarios);
})

app.listen(porta, () => {
    console.log(chalk.blue(`Servidor criado na porta ${porta}`))
})