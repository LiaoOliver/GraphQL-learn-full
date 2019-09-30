const fetch = require('node-fetch');

// 請求存取權杖 token
const requestGithubToken = credentials => fetch(
    // 用 fetch 請求 github API
    'https://github.com/login/oauth/access_token',
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        // 帶入 github 要求的 payload
        body: JSON.stringify(credentials)
    }
)
// 取得回應 (token)
.then(res => res.json())
.then(json => json )
.catch(error => {
    throw new Error(JSON.stringify(error))
})

// 取得 token 後向 github 取得 user 資料
const requestGithubUserAccount = token => fetch(`
    https://api.github.com/user?access_token=${token}`)
    .then(res => res.json())
    .catch(error => error)

// 處理取得 token 以及 user 資料的 function
const authorizeWithGithub = async credentials => {
    console.log('credentials', credentials)
    // 取得 token
    const { access_token } = await requestGithubToken(credentials);
    console.log('access_token', access_token)
    // 取得 使用者
    const githubUser = await requestGithubUserAccount(access_token);
    // 回傳出 github user 以及 token
    return { ...githubUser, access_token }
}

// 輸出
module.exports = { authorizeWithGithub }