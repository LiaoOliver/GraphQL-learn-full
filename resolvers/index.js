const Query = require('./Query');
const Mutation = require('./Mutation');
const Subscription = require('./Subscription');

const resolvers = {
    Query,
    Mutation,
    Subscription:{
        newPhoto: {
            subscribe: (parent, args, { pubsub }) => {
                console.log(pubsub)
                return pubsub.asyncIterator('photo-added')
            }
        }
    },
    Photo:{
        id:parent => parent.id || parent._id,
        url: parent => `/img/photo/${parent._id}.jpg`,
        postedBy:(parent, args, { db }) => db.collection('user').findOne({ githubLogin: parent.userID })
    }
}

module.exports = resolvers;