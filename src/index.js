import dotenv from"dotenv";
import express from "express";
import cors from "cors";
import chalk from "chalk";
import joi from "joi";
import { MongoClient } from "mongodb";
import dayjs from "dayjs"

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const date = new Date

const hora = dayjs(date).format('HH:mm:ss');

console.log(`Hoje é dia: ${date}`);
console.log(`Hora: ${hora}`);

const participantSchema = joi.object({
    name: joi.string().required(),
    lastStatus: joi.number().required()
});

const messageSchema = joi.object({
    from: joi.string().required(),
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().required(),
    time: joi.string().required()
})

const mongoClient = new MongoClient("mongodb://localhost:27017");

const porta = 5000;

app.post("/participants", async (req, res) => {
    const usuario = {
        name: req.body.name,
        lastStatus: Date.now()
    }
    const mensagemEntrada = {
        from: req.body.name,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: hora
    }

    const validacao = participantSchema.validate(usuario, { abortEarly: false });

    if (validacao.error) {
        console.log(validacao.error.details);

        res.status(422).send("Erro nos dados enviados");

        return;
    }

    try{
        console.log(chalk.yellow("Acessando banco de dados..."));
        await mongoClient.connect();
        const dados = mongoClient.db("projeto-12");
        console.log(chalk.yellow("Cadastrando usuário..."));
        await dados.collection("usuarios").insertOne(usuario);
        console.log(chalk.green(`Usuário ${usuario.name} cadastrado!`));
        
        await dados.collection("messages").insertOne(mensagemEntrada);

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

app.post("/messages", async (req, res) => {
    const mensagem = {
        from: req.headers.user,
        to: req.body.to,
        text: req.body.text,
        type: req.body.type,
        time: hora
    }

    const validacao = messageSchema.validate(mensagem);

    if (validacao.error) {
        console.log(validacao.error.details);

        res.status(422).send("Erro nos dados enviados");

        return;
    }

    try{
        console.log(chalk.yellow("Acessando banco de dados..."));
        await mongoClient.connect();
        const dados = mongoClient.db("projeto-12");
        console.log(chalk.yellow("Enviando mensagem"));
        await dados.collection("messages").insertOne(mensagem);

        res.status(201).send("deu certo");

        console.log(chalk.yellow("Fechando conexão"));
        mongoClient.close();
    }
    catch(e){
        console.log(`Deu probleminha, n°: ${e}`);
    }

})

app.get("/messages",async (req, res) => {
    try{
        console.log(chalk.yellow("Acessando banco de dados..."));
        await mongoClient.connect();
        const dados = mongoClient.db("projeto-12");
        console.log(chalk.yellow("Pegando mensagens..."));
        const collectionMensagens = dados.collection("messages");
        const mensagens = await collectionMensagens.find({}).toArray();

        res.status(200).send(mensagens)
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