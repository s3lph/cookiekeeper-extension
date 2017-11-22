/**
 * onclick event handler function for the buttons that cause a cookie to become persistent across Chrome sessions.
 */
function persist() {
    //Read the cookie URL and name from the HTMLButtonElement and unescape them.
    let url = decodeURIComponent(this.attributes.getNamedItem('data-cm-url').value);
    let name = decodeURIComponent(this.attributes.getNamedItem('data-cm-name').value);
    //Validate types
    if (typeof domain === 'string' && typeof name === 'string') {
        //Get the cookie matching the URL and name from Chrome's API
        chrome.cookies.get({url: url, name: name}, cookie => {
            //If there is no such cookie, we're done
            if (cookie === undefined) {
                return;
            }
            //Write the cookie to local storage, call the UI update function on completion.
            setStoredCookie(cookie, update);
        });
    }
}

/**
 * onclick event handler function for the buttons that cause a cookie to become non-persistent across Chrome sessions.
 */
function unpersist() {
    //Read the cookie domain and name from the HTMLButtonElement and unescape them.
    let domain = decodeURIComponent(this.attributes.getNamedItem('data-cm-domain').value);
    let name = decodeURIComponent(this.attributes.getNamedItem('data-cm-name').value);
    //Validate types
    if (typeof domain === 'string' && typeof name === 'string') {
        //Remove the cookie from local storage, call the UI update function on completion.
        removeStoredCookie(domain, name, update);
    }
}

/**
 * UI update function.
 * Actually completely re-generates the dynamic UI part to match the cookies set for the current tab.
 */
function update() {
    //Get the active tab of the currently active window; this should be the tab the user intends to open the popup for.
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        //No active tab, don't do anything (shouldn't happen, but better be sure...)
        if (tabs === undefined || tabs.length < 1) {
            return;
        }
        //Load stored cookies from local storage.
        loadStoredCookies(storedCookies => {
            //Get all cookies for the URL of the current tab.
            chrome.cookies.getAll({url: tabs[0].url}, cookies => {
                let rows = '';
                //Iterate the tab's cookies.
                for (let cookie of cookies) {
                    //Check whether the cookie is in the stored cookies object.
                    if (storedCookies[cookie.domain] === undefined ||
                        storedCookies[cookie.domain][cookie.name] === undefined) {
                        //If it's not there, add a table entry with a button to make the cookie persistent.
                        rows += `
            <tr>
                <td>${escapeHtml(cookie.domain)}</td>
                <td>${escapeHtml(cookie.name)}</td>
                <td>${escapeHtml(cookie.value)}</td>
                <td>
                    <button class="cm_persist"
                            data-cm-url="${encodeURIComponent(tabs[0].url)}"
                            data-cm-name="${encodeURIComponent(cookie.name)}">&plus;</button>
                </td>
            </tr>`;
                    } else {
                        //If the cookie is stored, add a table entry with a button to make the cookie non-persistent.
                        rows += `
            <tr>
                <td>${escapeHtml(cookie.domain)}</td>
                <td>${escapeHtml(cookie.name)}</td>
                <td>${escapeHtml(cookie.value)}</td>
                <td>
                    <button class="cm_unpersist"
                            data-cm-domain="${encodeURIComponent(cookie.domain)}"
                            data-cm-name="${encodeURIComponent(cookie.name)}">&minus;</button>
                </td>
            </tr>`;
                    }
                }
                //Add all table rows to the UI, replacing previous rows.
                document.getElementById('cookietable').innerHTML = rows;
                //Add onclick event handler to all buttons that cause a cookie to become persistant.
                let cm_persist = document.getElementsByClassName('cm_persist');
                for (let i = 0; i < cm_persist.length; ++i) {
                    cm_persist[i].onclick = persist;
                }
                //Add onclick event handler to all buttons that cause a cookie to become non-persistant.
                let cm_unpersist = document.getElementsByClassName('cm_unpersist');
                for (let i = 0; i < cm_unpersist.length; ++i) {
                    cm_unpersist[i].onclick = unpersist;
                }
            });
        });
    });
}

//Add onclick event handler to the link to the options page.
document.getElementById('options_link').onclick = () => {
    window.open(chrome.extension.getURL('/options.html'));
};

//Initialize the UI.
update();