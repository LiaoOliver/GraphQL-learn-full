const { ObjectID } = require('mongodb');
const fetch = require('node-fetch');
const { authorizeWithGithub } = require('../lib');


const githubAuth = async (parent, { code }, { db }) => {
    // 執行取得 github token 與 使用者資訊的 function
    // 傳入 OAuth App 金鑰與 code (GITHUB 授權代碼) 
    let {
        message,
        access_token,
        avatar_url,
        login,
        name
    } = await authorizeWithGithub({
        client_id: '937457b9c2fd8a148aaa',
        client_secret: '63c2d281278018c1c4aae93375cc1554d1f5793e',
        code
    })

    // 錯誤訊息
    if(message){
        throw new Error(message)
    }

    // 整理資料 存入資料庫
    let latestUserInfo = {
        name,
        githubLogin: login,
        githubToken: access_token,
        avatar: avatar_url
    }

    const { ops: [user] } = 
        await db.collection('users')
        .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true })

    return { user, token: access_token }
};

const postPhoto = async (parent, args, { db, currentUser, pubsub }) =>{

    // 確定是否用戶已經登入 如果沒有登入 currentUser 為空
    if(!currentUser){
        throw new Error('only an auth user can post a photo')
    }

    // 整理資料 與照片一起儲存當前使用者的資料
    const newPhoto = {
        ...args.input,
        userID: currentUser.githubLogin,
        created: new Date()
    }
    
    // 在 DB 中 存入新資料
    const { insertedIds } = await db.collection('photos').insert(newPhoto);
    newPhoto.id = insertedIds[0];

    console.log('prev', pubsub)
    // 訂閱
    pubsub.publish('photo-added', { newPhoto })
    console.log('after', pubsub)

    return newPhoto
} 

const addFakeUsers = async (root, { count }, { db} ) => {
    // create fake user data
    var randomUserApi = `https://randomuser.me/api/?result=${count}`;
    // 取得 假資料
    var { results } = await fetch(randomUserApi)
        .then(res => res.json())
        .then(json => json)

    // 整理資料
    var users = results.map(r => ({
        githubLogin: r.login.username,
        name: `${r.name.first} ${r.name.last}`,
        avatar: r.picture.thumbnail,
        githubToken: r.login.sha1
    }))
    // 存入資料庫
    await db.collection('users').insertMany(users);

    // 輸出 USER 格式的資料
    return users
}

// 
const fakeUserAuth = async (parent, { githubLogin }, { db } ) => {
    var user = await db.collection('users').findOne({ githubLogin });
    
    if(!user){
        throw new Error(`Cannot find user auth ${githubLogin}`)
    }
    return {
        token: user.githubToken,
        user
    }
}


module.exports = {
    githubAuth,
    postPhoto,
    addFakeUsers,
    fakeUserAuth
}