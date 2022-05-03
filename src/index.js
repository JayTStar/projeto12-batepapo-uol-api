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

const mongoClient = new MongoClient("mongodb://localhost:27017");

const porta = 5000;

const date = new Date
const hora = dayjs(date).format('HH:mm:ss');

const participantSchema = joi.object({
    name: joi.string().required(),
    lastStatus: joi.number().required()
});

const messageSchema = joi.object({
    from: joi.string().required(),
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().valid("message", "private_message").required(),
    time: joi.string().required()
})

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

        const procura = await dados.collection("usuarios").findOne({name: usuario.name});
    
        if(procura !== null){
            console.log(chalk.red("Nome já cadastrado"));

            res.status(409).send("Nome de usuário já existe")
            return;
        }

        await dados.collection("usuarios").insertOne(usuario);
        console.log(chalk.green(`Usuário ${usuario.name} cadastrado!`));
        
        await dados.collection("messages").insertOne(mensagemEntrada);

        res.status(201).send("Criado!");

        console.log(chalk.yellow("Fechando conexão..."));
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

        const procura = await dados.collection("usuarios").findOne({name: mensagem.from});
    
        if(procura === null){
            console.log(chalk.red("Usuário não encontrado"));

            res.status(409).send("Nome de usuário não cadastrado");
            return;
        }

        console.log(chalk.yellow("Enviando mensagem"));
        await dados.collection("messages").insertOne(mensagem);

        res.status(201).send("deu certo");

        console.log(chalk.yellow("Fechando conexão"));
        mongoClient.close();
    }
    catch(e){
        console.log(`Deu probleminha, n°: ${e}`);
        res.status(422).send("Algo de errado não está certo");
    }

})

app.get("/messages",async (req, res) => {
    const usuario = req.headers.user;

    const numMensagens =parseInt(req.query.limit);

    console.log(numMensagens);

    try{
        console.log(chalk.yellow("Acessando banco de dados..."));
        await mongoClient.connect();
        const dados = mongoClient.db("projeto-12");
        console.log(chalk.yellow("Pegando mensagens..."));
        const collectionMensagens = dados.collection("messages");
        const mensagens = await collectionMensagens.find({$or: [{to: "Todos"}, {to: usuario}]}).toArray();

        res.status(200).send((numMensagens === undefined)? mensagens : mensagens.slice((mensagens.length - numMensagens), mensagens.length));
        mongoClient.close();
    }
    catch(e){
        console.log(`Deu ruim, erro: ${e}`);
        mongoClient.close();
    }
})

app.post("/status", async (req, res) => {

    try{
        const usuario = req.headers.user;
        await mongoClient.connect();
        const dados = mongoClient.db("projeto-12");
        const procura = await dados.collection("usuarios").findOne({name: usuario});

        if(procura === null){
            console.log(chalk.red("Usuário não encontrado"));

            res.status(404).send("Nome de usuário não cadastrado");
            return;
        }

        await dados.collection("usuarios").updateOne({name: usuario}, {$set: {lastStatus: Date.now()}})
    }
    catch(e){
        console.log(`Deu probleminha, n°: ${e}`);
        res.status(422).send("Algo de errado não está certo");
    }
    

    res.status(200).send("Deu certo");
})

setInterval(async () => {
    const timeStamp = new Date - 10000;

    const mensagemRemocao = {
        from: "",
        to: "Todos",
        text: "Sai da sala...",
        type: "Status",
        time: hora
    }

    try{
        await mongoClient.connect();
        const dados = mongoClient.db("projeto-12");
        const collectionUsuarios = dados.collection("usuarios");
        await collectionUsuarios.deleteMany({lastStatus: {$lt: timeStamp}}).toArray();
    }
    catch(e){

    }
}, 15000);

app.listen(porta, () => {
    console.log(chalk.blue(`Servidor criado na porta ${porta}`))
})