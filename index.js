const { ApolloServer } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');

const typeDefs = `
    scalar DateTime

    enum PhotoCategory{
        SELFIE
        PORTRAIT
        ACTION
        LANDSCAPE
        GRAPHIC
    }

    input PostPhotoInput{
        name: String!
        category: PhotoCategory=PORTRAIT
        description: String
    }

    type Query{
        totalPhotos:Int!
        allPhotos(after:DateTime):[Photo!]!
    }

    type Mutation{
        postPhoto(input:PostPhotoInput!): Photo!
    }

    type Photo{
        id: ID!
        url: String!
        name: String!
        description: String
        category: PhotoCategory!
        created: DateTime!
        postedBy: User
        taggedUsers: [User!]!
    }

    type User{
        githubLogin: ID!
        name: String
        avatar: String
        postedPhotos: [Photo!]!
        inPhotos:[Photo!]!
    }
`

var id = new Date();
var users = [
    { "githubLogin": "mHattrup", "name": "Mike Hattrup" },
    { "githubLogin": "gPlake", "name": "Glen Plake" },
    { "githubLogin": "sSchmidt", "name": "Scot Schmidt" }
]


var tags = [
    { photoID: 1, userID: "gPlake" },
    { photoID: 2, userID: "sSchmidt" },
    { photoID: 2, userID: "mHattrup" },
    { photoID: 2, userID: "gPlake" },
]

var photos = [
    {
        id:1,
        name: "Dropping",
        description: " the heart",
        category: "ACTION",
        githubUser: "gPlake",
        created:"3-28-1977"
    },
    {
        id: 2,
        name: "Enjoying",
        description: " the heart",
        category: "SELFIE",
        githubUser: "sSchmidt",
        created:"4-28-1977"
    },
    {
        id: 3,
        name: "Gunbarrel 25",
        description: " the heart",
        category: "LANDSCAPE",
        githubUser: "mHattrup",
        created:"2018-04-15T00:00:00.0Z"
    },
    {
        id: 4,
        name: "Gunbarrel 765",
        description: " the heart",
        category: "LANDSCAPE",
        githubUser: "mHattrup",
        created:"4/18/2018"
    }
]

const resolvers = {
    Query:{
        totalPhotos: () => photos.length,
        allPhotos: (parent, args) => {
            let result = [];

            photos.find(photo => {
                if (new Date(photo.created).getTime() === new Date(args.after).getTime()){
                    result.push(photo)
                }
            });
            
            return args.value === undefined ? photos : result;
        }
    },
    Mutation:{
        postPhoto(parent, args){
            let photo = {
                id:id,
                ...args.input,
                created: new Date()
            }
            photos.push(photo)
            return photo
        }
    },
    Photo:{
        url: parent => 'www.youtube.com',
        postedBy: parent =>{
            return users.find(u => u.githubLogin === parent.githubUser );
        },
        taggedUsers: parent => tags.filter(tag => tag.photoID === parent.id)
            .map(tag => { console.log(tag) ; return tag.userID} )
            .map(userID => users.find(u => u.githubLogin === userID ))
    },
    User:{
        postedPhotos: parent => {
            return photos.filter(p => p.githubUser === parent.githubLogin);
        },
        inPhotos: parent => tags.filter(tag => tag.userID === parent.id)
                            .map(tag => tag.photoID)
                            .map(photoID => photos.find(p => p.id === photoID))
    },
    // 自訂純量
    DateTime: new GraphQLScalarType({
        name:'DateTime',
        description: 'A valid date time value',
        // 
        parseValue: value => { console.log("parseValue",value) ; return new Date(value); },
        // 序列化
        serialize: value => { console.log("serialize",value) ; return new Date(value).toISOString(); },
        // 
        parseLiteral: ast => { console.log("parseLiteral", ast) ; return ast.value; },
    })
}

const server = new ApolloServer({
    typeDefs,
    resolvers
})

server.listen().then(({url})=>{
    console.log(`GraphQL Service running on ${url}`)
})