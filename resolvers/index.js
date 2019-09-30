const Query = require('./Query');
const Mutation = require('./Mutation');

const resolvers = {
    Query,
    Mutation,
    Photo:{
        id:parent => parent.id || parent._id,
        url: parent => `/img/photo/${parent._id}.jpg`,
        postedBy:(parent, args, { db }) => db.collection('user').findOne({ githubLogin: parent.userID })
    }
}

module.exports = resolvers;