const { ApolloServer } = require('apollo-server-express');
const expressPlayground = require('graphql-playground-middleware-express').default;
const express = require('express');
const { readFileSync } = require('fs');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8');
const resolvers = require('./resolver');


const app = express();

async function start(){
    const client = await MongoClient.connect(process.env.mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
    const db = client.db();
    const context = { db };
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context
    })
    server.applyMiddleware({app});
    
    app.get('/', (req, res) => {
        res.send("Welcome, to Photo share API");
    })
    
    app.get('/playground', expressPlayground({ endpoint:'/graphql' }));
    
    app.listen({ port: 4000 }, () => console.log(`GraphQL Service running on 4000`))
}
start();