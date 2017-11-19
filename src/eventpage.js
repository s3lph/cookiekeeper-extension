
/**
 * Returns true if the object has no (key => value) properties
 * @param {object} obj
 * @returns {boolean}
 */
function isEmpty(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

/**
 * @param {chrome.cookies.Cookie} cookie
 * @returns {string}
 */
function buildCookieUrl(cookie) {
    let url = cookie.secure ? 'https://' : 'http://';
    // url += cookie.domain.charAt(0) === '.' ? cookie.domain.substring(1) : cookie.domain;
    url += cookie.domain + cookie.path;
    return url;
}

/**
 *
 * @param {{removed: boolean, cookie: chrome.cookies.Cookie, cause: string}} changeInfo
 */
function cookieListenerCallback(changeInfo) {

    chrome.storage.local.get("stored_cookies", res => {

        let storedCookies = res["stored_cookies"];
        if (storedCookies === undefined) {
            return;
        }

        let domainCookies = storedCookies[changeInfo.cookie.domain];
        if (domainCookies === undefined) {
            return;
        }
        let cookie = domainCookies[changeInfo.cookie.name];
        if (cookie === undefined) {
            return;
        }
        if (changeInfo.removed === true && (changeInfo.cause !== "overwrite" && changeInfo.cause !== "expired_overwrite")) {
            delete domainCookies[changeInfo.cookie.name];
            if (isEmpty(domainCookies)) {
                delete storedCookies[changeInfo.cookie.domain];
            }
        } else if (changeInfo.removed === false) {
            domainCookies[changeInfo.cookie.name] = changeInfo.cookie;
            storedCookies[changeInfo.cookie.domain] = domainCookies;
        } else {
            return;
        }

        chrome.storage.local.set({"stored_cookies": storedCookies}, ()=> {});

    });
}


function restoreCookiesCallback() {

    chrome.storage.local.get("stored_cookies", res => {

        let storedCookies = res["stored_cookies"];
        if (storedCookies === undefined) {
            return;
        }

        for (let domain in storedCookies) {
            if (storedCookies.hasOwnProperty(domain)) {
                let domainCookies = storedCookies[domain];
                for (let name in domainCookies) {
                    if (domainCookies.hasOwnProperty(name)) {
                        /**
                         * @type {chrome.cookies.Cookie}
                         */
                        let cookie = domainCookies[name];
                        chrome.cookies.set(
                            {
                                url: buildCookieUrl(cookie),
                                name: name,
                                value: cookie.value,
                                domain: domain,
                                path: cookie.path,
                                httpOnly: cookie.httpOnly,
                                sameSite: cookie.sameSite,
                                expirationDate: cookie.expirationDate,
                                storeId: cookie.storeId
                            },
                            createdCookie => {}
                        );
                    }
                }
            }
        }

    });

}


chrome.runtime.onStartup.addListener(restoreCookiesCallback);
chrome.cookies.onChanged.addListener(cookieListenerCallback);
