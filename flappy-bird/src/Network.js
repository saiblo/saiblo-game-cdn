const DEV = true;
const baseUrl = DEV ? 'https://api.dev.saiblo.net/carnival/flappy-bird/' : 'https://api.saiblo.net/carnival/flappy-bird/';

let auth;

async function uFetch(url, post) {
    const defaultInit = {
        headers: {
            'Content-Type': "application/json",
            authorization: auth,
        },
    };
    const init =
        post === undefined
            ? defaultInit
            : {
                ...defaultInit,
                method: "POST",
                body: JSON.stringify(post),
            };
    return await (await fetch(baseUrl + url, init)).json();
}
