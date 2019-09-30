const { ObjectID } = require('mongodb');

module.exports = {
    me: (parent, args, context) => {
        console.log(context)
        return context.currentUser},
    totalPhotos: (parent, args, { db }) => db.collection('photos').estimateDocumentCount(),
    allPhotos: (parent, args, { db }) => db.collection('photos').find().toArray(),
    totalUsers: (parent, args, { db }) => db.collection('users').estimatedDocumentCount(),
    allUsers: (parent, args, { db }) => db.collection('users').find().toArray(),
    // User: (parent, args, { db }) =>db.collection('users').findOne({ githubLogin: args.login })
}