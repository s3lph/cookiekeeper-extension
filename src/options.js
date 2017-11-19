
function unpersist() {
    let domain = decodeURIComponent(this.attributes.getNamedItem('data-cm-domain').value);
    let name = decodeURIComponent(this.attributes.getNamedItem('data-cm-name').value);
    chrome.storage.local.get("stored_cookies", res => {

        let storedCookies = res["stored_cookies"];
        if (storedCookies === undefined) {
            storedCookies = {};
        }
        let domainCookies = storedCookies[domain];
        if (domainCookies === undefined) {
            domainCookies = {};
        }
        delete domainCookies[name];
        storedCookies[domain] = domainCookies;

        chrome.storage.local.set({"stored_cookies": storedCookies}, ()=> {
            update();
        });

    });
}

function update() {
    chrome.storage.local.get("stored_cookies", res => {

        let storedCookies = res["stored_cookies"];
        if (storedCookies === undefined) {
            storedCookies = {};
        }
        let rows = '';
        for (let domain in storedCookies) {
            if (storedCookies.hasOwnProperty(domain)) {
                let domainCookies = storedCookies[domain];
                rows += '<tr class="domain"><td><h3>' + domain + '</h3></td></tr>';
                for (let name in domainCookies) {
                    if (domainCookies.hasOwnProperty(name)) {
                        let cookie = domainCookies[name];
                        rows += '<tr class="cookie"><td>' + cookie.name + '</td><td>' + cookie.value +
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
