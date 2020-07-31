var SettingsEditor = function (defaultSettings, onSubmit) {
    onSubmit(defaultSettings);
    var textarea = <HTMLFormElement>document.getElementById('light-controls');
    textarea.value = JSON.stringify(defaultSettings, undefined, 4);
    document.getElementById('light-controls-submit').addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var value;
        try {
            value = JSON.parse(textarea.value);
            if (!value.mesh) {
                alert("Settings invalid: mesh properties required.")
            }
        } catch (e) {
            alert("Settings invalid: check syntax.")
        }
        if (value) {
            onSubmit(value);
        }

    });
};
export {SettingsEditor};