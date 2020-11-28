import {ModelInformation, ModelUrl} from '../model';

export class ModelSelector {
    constructor(
        private el: HTMLElement,
        models: ModelInformation[],
        clickHandler: (url: ModelInformation) => void) {

        function createButton(model: ModelInformation) {
            const button = document.createElement('button');
            button.textContent = model.description;
            button.onclick = () => {
                clickHandler(model)
            };
            return button;
        }

        for (const model of models) {
            el.appendChild(createButton(model));
        }
    }

    hide() {
        this.el.style.display = 'none';
    }

    show() {
        this.el.style.display = 'block';
    }
}
