const expressPlayground = require('graphql-playground-middleware-express').default;
const { ApolloServer } = require('apollo-server-express');


const app = express();
const server = new ApolloServer({
    typeDefs,
    resolvers
})
server.applyMiddleware({app});

app.get('/', (req, res) => {
    res.send("Welcome, to Photo share API");
})

app.get('/playground', expressPlayground({ endpoint:'/graphql'}));

app.listen({ port: 4000 }, () => console.log(`GraphQL Service running on ${port}`))