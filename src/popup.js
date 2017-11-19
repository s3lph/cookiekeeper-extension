
function persist() {
    let url = decodeURIComponent(this.attributes.getNamedItem('data-cm-url').value);
    let name = decodeURIComponent(this.attributes.getNamedItem('data-cm-name').value);
    chrome.cookies.get({url: url, name: name}, cookie => {
        if (cookie === undefined) {
            return;
        }
        setStoredCookie(cookie, () => {
            update();
        });
    });
}


function unpersist() {
    let domain = decodeURIComponent(this.attributes.getNamedItem('data-cm-domain').value);
    let name = decodeURIComponent(this.attributes.getNamedItem('data-cm-name').value);
    loadStoredCookies(storedCookies => {
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
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (tabs === undefined || tabs.length < 1) {
            return;
        }
        loadStoredCookies(storedCookies => {
            chrome.cookies.getAll({url: tabs[0].url}, cookies => {
                let rows = '';
                for (let cookie of cookies) {
                    if (storedCookies[cookie.domain] === undefined ||
                        storedCookies[cookie.domain][cookie.name] === undefined) {
                        rows += '<tr><td>' + escapeHtml(cookie.domain) + '</td><td>' +
                            escapeHtml(cookie.name) + '</td><td>' + escapeHtml(cookie.value) +
                            '</td><td><button class="cm_persist" data-cm-url="' + encodeURIComponent(tabs[0].url) +
                            '" data-cm-name="' + encodeURIComponent(cookie.name) + '">+</button></td></tr>';
                    } else {
                        rows += '<tr><td>' + escapeHtml(cookie.domain) + '</td><td>' +
                            escapeHtml(cookie.name) + '</td><td>' + escapeHtml(cookie.value) +
                            '</td><td><button class="cm_unpersist" data-cm-domain="' + encodeURIComponent(cookie.domain) +
                            '" data-cm-name="' + encodeURIComponent(cookie.name) + '">-</button></td></tr>';
                    }
                }
                document.getElementById('cookietable').innerHTML = rows;
                let cm_persist = document.getElementsByClassName('cm_persist');
                for (let i = 0; i < cm_persist.length; ++i) {
                    cm_persist[i].onclick = persist;
                }
                let cm_unpersist = document.getElementsByClassName('cm_unpersist');
                for (let i = 0; i < cm_unpersist.length; ++i) {
                    cm_unpersist[i].onclick = unpersist;
                }
            });
        });
    });
}


document.onFocus = () => {
    update();
};

document.getElementById('options_link').onclick = () => {
    window.open(chrome.extension.getURL('/options.html'));
};
update();
