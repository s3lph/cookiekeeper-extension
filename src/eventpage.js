
/**
 *
 * @param {{removed: boolean, cookie: chrome.cookies.Cookie, cause: string}} changeInfo
 */
function cookieListenerCallback(changeInfo) {

    loadStoredCookies(storedCookies => {

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
        } else {
            return;
        }

        chrome.storage.local.set({"stored_cookies": storedCookies}, ()=> {});

    });
}


function restoreCookiesCallback() {

    loadStoredCookies(storedCookies => {

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
