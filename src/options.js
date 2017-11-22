
function unpersist() {
    let domain = decodeURIComponent(this.attributes.getNamedItem('data-cm-domain').value);
    let name = decodeURIComponent(this.attributes.getNamedItem('data-cm-name').value);
    if (typeof domain === 'string' && typeof name === 'string') {
        removeStoredCookie(domain, name);
    }
}

function update() {
    loadStoredCookies(storedCookies => {
        let rows = '';
        for (let domain in storedCookies) {
            if (storedCookies.hasOwnProperty(domain)) {
                let domainCookies = storedCookies[domain];
                rows += '<tr class="domain"><td><h3>' + escapeHtml(domain) + '</h3></td></tr>';
                for (let name in domainCookies) {
                    if (domainCookies.hasOwnProperty(name)) {
                        let cookie = domainCookies[name];
                        rows += '<tr class="cookie"><td>' + escapeHtml(cookie.name) + '</td><td>' +
                            escapeHtml(cookie.value) +
                            '</td><td><button class="cm_unpersist" data-cm-domain="' + encodeURIComponent(cookie.domain) +
                            '" data-cm-name="' + encodeURIComponent(cookie.name) + '">Remove</button></td></tr>';
                    }
                }
            }
        }
        document.getElementById('cookie_table').innerHTML = rows;
        let cm_unpersist = document.getElementsByClassName('cm_unpersist');
        for (let i = 0; i < cm_unpersist.length; ++i) {
            cm_unpersist[i].onclick = unpersist;
        }
    });
}


document.getElementById('reset_button').onclick = () => {
    chrome.storage.local.clear(() => {
        update();
    });
};
update();
