
/**
 * Callback function invoked after loading stored cookie values from local storage. The cookies are passed in the form
 * <pre><code>
 * {
 *   "domain1" : {
 *     "name1" : chrome.cookies.Cookie,
 *     "name2" : chrome.cookies.Cookie,
 *     ...
 *   },
 *   "domain2" : {
 *     "name1" : chrome.cookies.Cookie,
 *     ...
 *   },
 *   ...
 * }
 * </code></pre>
 * @typedef {function} loadStoredCookiesCallback
 * @param {object} cookies - Stored cookies structured by domain and cookie name.
 * @returns {undefined}
 */

/**
 * Callback function invoked after storing a cookie to local storage.
 * @typedef {function} setStoredCookieCallback
 * @returns {undefined}
 */

/**
 * Callback function invoked after removing a cookie from local storage.
 * @typedef {function} removeStoredCookieCallback
 * @returns {undefined}
 */

/**
 * Escapes some characters that are unsafe to directly embed in HTML.
 * @param {string} unsafe - String containing unsafe characters.
 * @returns {string} Escaped string, should be safe for embedding in HTML.
 */
function escapeHtml(unsafe) {
    //Replace all occurences of &, <, >, " and '.
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}


/**
 * Returns true if the object has no non-inherited properties.
 * @param {object} obj - The object to check.
 * @returns {boolean} Whether the object has no non-inherited properies.
 */
function isEmpty(obj) {
    //Iterate all keys in the object.
    for (let key in obj) {
        if (obj.hasOwnProperty(key))
            //The property 'key' is non-inherited, return false.
            return false;
    }
    //Nothing found, return true.
    return true;
}

/**
 * Given a chrome.cookies.Cookie object, build the URL needed for adding the cookie to the Chrome session.
 * @param {chrome.cookies.Cookie} cookie - The cookie object to build the URL for.
 * @returns {string} The URL needed to add the cookie to the Chrome session.
 */
function buildCookieUrl(cookie) {
    //If the secure flag is set, use https: scheme, else use http: .
    let url = cookie.secure ? 'https://' : 'http://';
    //Simply append the domain and path and return the resulting string.
    url += cookie.domain + cookie.path;
    return url;
}

/**
 * Load all stored cookies from storage, and call the provided callback function on success, passing the cookies on
 * success. The cookies are passed in the form
 * <pre><code>
 * {
 *   "domain1" : {
 *     "name1" : chrome.cookies.Cookie,
 *     "name2" : chrome.cookies.Cookie,
 *     ...
 *   },
 *   "domain2" : {
 *     "name1" : chrome.cookies.Cookie,
 *     ...
 *   },
 *   ...
 * }
 * </code></pre>
 * @param {loadStoredCookiesCallback} [callback] The callback to pass the cookies too.
 */
function loadStoredCookies(callback) {
    //Load the stored_cookies object from local storage.
    chrome.storage.local.get("stored_cookies", res => {
        //Extract the stored_cookies object from the result, as it is wrapped in another object.
        let storedCookies = res["stored_cookies"];
        //Fall back to an empty object, if nothing was stored.
        if (storedCookies === undefined) {
            storedCookies = {};
        }
        //Pass the cookies object to the callback, if defined.
        if (typeof callback === 'function') {
            callback(storedCookies);
        }
    });
}

/**
 * Writes a cookie to local storage and call the callback function on completion
 * @param {chrome.cookies.Cookie} cookie - The cookie to write to local storage.
 * @param {setStoredCookieCallback} [callback] The callback function to call on completion.
 */
function setStoredCookie(cookie, callback) {
    //Load stored cookies from local storage.
    loadStoredCookies(storedCookies => {
        //Extract the cookies object for the cookie's domain.
        let domainCookies = storedCookies[cookie.domain];
        //If there is nothing stored for that domain, create an empty object.
        if (domainCookies === undefined) {
            domainCookies = {};
            storedCookies[cookie.domain] = domainCookies;
        }
        //Write the cookie to the stored cookies object.
        domainCookies[cookie.name] = cookie;
        //Write the stored cookies object to local storage.
        chrome.storage.local.set({"stored_cookies": storedCookies}, ()=> {
            //Call the callback function, if defined.
            if (typeof callback === 'function') {
               callback();
            }
        });
    });
}

/**
 * Remove a cookie from local storage, untracking it.
 * @param {string} domain - The cookie's domain.
 * @param {string} name - The cookie's name.
 * @param {removeStoredCookieCallback} [callback]
 */
function removeStoredCookie(domain, name, callback) {
    //Load stored cookies from local storage.
    loadStoredCookies(storedCookies => {
        //Extract the cookies object for the given domain.
        let domainCookies = storedCookies[domain];
        //If there's nothing stored for this domain, there's nothing to do.
        if (domainCookies === undefined) {
            return;
        }
        //Delete the cookie from the stored cookies object.
        delete domainCookies[name];
        //If there are no cookies left for this domain, remove the domain object entirely.
        if (isEmpty(domainCookies)) {
            delete storedCookies[domain];
        }
        //Write the stored cookies object back to local storage.
        chrome.storage.local.set({"stored_cookies": storedCookies}, ()=> {
            //Call the callback function, if defined.
            if (typeof callback === 'function') {
                callback();
            }
        });
    });
}