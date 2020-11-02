const popup = document.getElementById('alerts');
const content = popup.getElementsByClassName('content')[0];

const showAlert = (html: string) => {
    content.innerHTML += html;
    popup.style.display = 'block';
};

const showError = (html: string) => {
    showAlert(`<div class="error">${html}</div>`);
};

const hideAlert = () => {
    popup.style.display = 'none';
    content.innerHTML = '';
};

const onError = (msg: Event | String, url: String, lineNo: number, columnNo: number, error: Error) => {
    var substring = 'script error';
    if (msg.toString().indexOf(substring) > -1) {
        showError('Script Error: See Browser Console for Detail');
    } else {
        var message = [
            'Message: ' + msg,
            'URL: ' + url,
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error)
        ].join(' - ');
        showError(message);
    }
    return false;
};

/*intercept console errors
const consoleError = console.error.bind(console);
console.error = (...args) => {
    showError(args.toString());
    consoleError(...args);
};
*/

export default {
    showAlert,
    showError,
    onError,
    hideAlert
}