
/**
 * Event handler function called when Chrome reports a cookie change.
 * @param {object} changeInfo - Information about the cookie change.
 * @param {boolean} changeInfo.removed - Whether this is an information about a cookie removal.
 * @param {chrome.cookies.Cookie} changeInfo.cookie - The new cookie.
 * @param {string} changeInfo.cause - Why this change occured.
 * @see https://developer.chrome.com/extensions/cookies#event-onChanged
 */
function cookieListenerCallback(changeInfo) {
    //Load stored cookies from local storage.
    loadStoredCookies(storedCookies => {
        //Extract the cookies object for the cookie's domain.
        let domainCookies = storedCookies[changeInfo.cookie.domain];
        if (domainCookies === undefined) {
            //If there's nothing stored for the cookie's domain, there's nothing to do.
            return;
        }
        //Extract the cookie object for the cookie's name.
        let cookie = domainCookies[changeInfo.cookie.name];
        if (cookie === undefined) {
            //If there's no cookie stored for this name, there's nothing to do.
            return;
        }
        //If this is a removal event, only remove the cookie from storage, if it's not overwritten directly afterwards
        //in the next event (Chrome fires two events for a cookie change: the first removes the current cookie, the
        //second sets the new cookie).
        if (changeInfo.removed === true && (changeInfo.cause !== "overwrite" && changeInfo.cause !== "expired_overwrite")) {
            //Delete the stored cookie
            delete domainCookies[changeInfo.cookie.name];
            if (isEmpty(domainCookies)) {
                //If there are no cookies left for the domain, remove the domain object alltoghether.
                delete storedCookies[changeInfo.cookie.domain];
            }
        } else if (changeInfo.removed === false) {
            //If this is not a removal event, simply write the new cookie to the stored cookies object
            domainCookies[changeInfo.cookie.name] = changeInfo.cookie;
        } else {
            return;
        }
        //Write the stored cookies object to local storage
        chrome.storage.local.set({"stored_cookies": storedCookies}, ()=> {});
    });
}

/**
 * Event handler function called after Chrome started.
 */
function restoreCookiesCallback() {
    //Load stored cookies from local storage.
    loadStoredCookies(storedCookies => {
        //Iterate over the stored domains.
        for (let domain in storedCookies) {
            if (storedCookies.hasOwnProperty(domain)) {
                let domainCookies = storedCookies[domain];
                //Iterate over the stored cookie names in the domain.
                for (let name in domainCookies) {
                    if (domainCookies.hasOwnProperty(name)) {
                        /**
                         * @type {chrome.cookies.Cookie}
                         */
                        let cookie = domainCookies[name];
                        //Restore the cookie to Chrome.
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

//Add event handler function to chrome startup and cookie change events.
chrome.runtime.onStartup.addListener(restoreCookiesCallback);
chrome.cookies.onChanged.addListener(cookieListenerCallback);
