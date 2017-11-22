
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
    //Load stored cookies from local storage.
    loadStoredCookies(storedCookies => {
        let rows = '';
        //Iterate all stored domains
        for (let domain in storedCookies) {
            if (storedCookies.hasOwnProperty(domain)) {
                //Generate title row with only the domain name
                let domainCookies = storedCookies[domain];
                rows += '<tr class="domain"><td><h3>' + escapeHtml(domain) + '</h3></td></tr>';
                //Iterate all cookies of this domain
                for (let name in domainCookies) {
                    if (domainCookies.hasOwnProperty(name)) {
                        let cookie = domainCookies[name];
                        //Add a table entry with a button to make the cookie non-persistent.
                        rows += `
            <tr class="cookie">
                <td>${escapeHtml(cookie.name)}</td>
                <td>${escapeHtml(cookie.value)}</td>
                <td>
                    <button class="cm_unpersist"
                            data-cm-domain="${encodeURIComponent(cookie.domain)}"
                            data-cm-name="${encodeURIComponent(cookie.name)}">Remove</button>
                </td>
            </tr>`;
                    }
                }
            }
        }
        //Add all table rows to the UI, replacing previous rows.
        document.getElementById('cookie_table').innerHTML = rows;
        //Add onclick event handler to all buttons that cause a cookie to become non-persistant.
        let cm_unpersist = document.getElementsByClassName('cm_unpersist');
        for (let i = 0; i < cm_unpersist.length; ++i) {
            cm_unpersist[i].onclick = unpersist;
        }
    });
}


//Add onclick event handler to the 'Remove all' button.
document.getElementById('reset_button').onclick = () => {
    chrome.storage.local.clear(update);
};

//Initialize the UI.
update();
