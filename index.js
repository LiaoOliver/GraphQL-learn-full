const { ApolloServer } = require('apollo-server-express');
const expressPlayground = require('graphql-playground-middleware-express').default;
const express = require('express');
const { readFileSync } = require('fs');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

// 載入 GraphQL Schema 定義檔(用 fs 模組載入)
const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8');
const resolvers = require('./resolvers');

const app = express();

async function start(){
    // 連線 mongo DB
    const client = await MongoClient.connect(process.env.mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
    const db = client.db();
    
    // 初始化 apollo server 分別載入 schema 與 resovers
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({ req }) => {
            // 取得 client 端傳回的 token
            const githubToken = req.headers.authorization
            // 在資料庫中搜尋相同 token 的資料
            const currentUser = await db.collection('users').findOne({ githubToken })
            // context 同時放置 db 與 currentUser 變數
            return { db, currentUser }
        }
    });

    // 呼叫 applyMiddleware function 將中介軟體安裝在同一路徑上
    server.applyMiddleware({app});
    
    app.get('/', (req, res) => {
        res.send("Welcome, to Photo share API");
    })
    
    app.get('/playground', expressPlayground({ endpoint:'/graphql' }));
    
    app.listen({ port: 4000 }, () => console.log(`GraphQL Service running on 4000`))
}

start();