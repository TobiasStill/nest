const popup = document.getElementById('alerts');
const content = popup.getElementsByClassName('content')[0];
export const showAlert = (text: string) => {
    content.innerHTML = text;
    popup.style.display = "block";
};

export const hideAlert = () => {
    popup.style.display = "none";
};