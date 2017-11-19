
/**
 * @typedef {function} loadStoredCookiesCallback
 * @param {object} cookies
 */

/**
 * @typedef {function} setStoredCookieCallback
 */

/**
 * @param {string} unsafe
 * @returns {string}
 */
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}


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
 * @param {loadStoredCookiesCallback} callback
 */
function loadStoredCookies(callback) {
    chrome.storage.local.get("stored_cookies", res => {

        let storedCookies = res["stored_cookies"];
        if (storedCookies === undefined) {
            storedCookies = {};
        }

        if (typeof callback === 'function') {
            callback(storedCookies);
        }

    });
}

/**
 * @param {chrome.cookies.Cookie} cookie
 * @param {setStoredCookieCallback} callback
 */
function setStoredCookie(cookie, callback) {
    loadStoredCookies(storedCookies => {
        let domainCookies = storedCookies[cookie.domain];
        if (domainCookies === undefined) {
            domainCookies = {};
        }
        domainCookies[cookie.name] = cookie;
        storedCookies[cookie.domain] = domainCookies;
        chrome.storage.local.set({"stored_cookies": storedCookies}, ()=> {
           if (typeof callback === 'function') {
               callback();
           }
        });
    });
}