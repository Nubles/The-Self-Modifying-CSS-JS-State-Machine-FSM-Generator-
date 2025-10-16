document.addEventListener('DOMContentLoaded', () => {
    const fsmData = {
        states: [],
        transitions: []
    };

    const stateNameInput = document.getElementById('state-name');
    const addStateBtn = document.getElementById('add-state-btn');
    const statesList = document.getElementById('states-list');
    const fromStateSelect = document.getElementById('from-state');
    const toStateSelect = document.getElementById('to-state');

    const transitionLabelInput = document.getElementById('transition-label');
    const addTransitionBtn = document.getElementById('add-transition-btn');
    const transitionsList = document.getElementById('transitions-list');

    const generateBtn = document.getElementById('generate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const codeOutput = document.getElementById('code-output');
    const downloadBtn = document.getElementById('download-btn');
    const previewFrame = document.getElementById('preview-frame');

    addStateBtn.addEventListener('click', addState);
    addTransitionBtn.addEventListener('click', addTransition);
    resetBtn.addEventListener('click', resetEditor);
    generateBtn.addEventListener('click', generateFinalCode);
    downloadBtn.addEventListener('click', downloadFsmAsHtmlFile);

    function downloadFsmAsHtmlFile() {
        const code = codeOutput.value;
        if (!code) {
            alert('Please generate the code first.');
            return;
        }

        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fsm.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function addState() {
        const name = stateNameInput.value.trim();
        if (!name) {
            alert('Please enter a state name.');
            return;
        }
        if (fsmData.states.find(s => s.label === name)) {
            alert('State name must be unique.');
            return;
        }

        const stateId = `state-${fsmData.states.length}`;
        const newState = { id: stateId, label: name, content: `Content for ${name}`, isEditing: false };
        fsmData.states.push(newState);

        stateNameInput.value = '';
        render();
    }

    function addTransition() {
        const from = fromStateSelect.value;
        const to = toStateSelect.value;
        const label = transitionLabelInput.value.trim();

        if (!from || !to || !label) {
            alert('Please select states and provide a transition label.');
            return;
        }

        const newTransition = { from, to, label };
        fsmData.transitions.push(newTransition);

        transitionLabelInput.value = '';
        render();
    }

    function resetEditor() {
        fsmData.states = [];
        fsmData.transitions = [];
        render();
        codeOutput.value = '';
        previewFrame.srcdoc = '';
    }

    function render() {
        renderStates();
        renderTransitions();
        updateStateDropdowns();
    }

    function renderStates() {
        statesList.innerHTML = '';
        fsmData.states.forEach(state => {
            const stateDiv = document.createElement('div');
            stateDiv.className = 'state';

            if (state.isEditing) {
                // Create editing UI
                const editorWrapper = document.createElement('div');
                editorWrapper.className = 'state-editor';

                const labelInput = document.createElement('input');
                labelInput.type = 'text';
                labelInput.value = state.label;

                const contentTextarea = document.createElement('textarea');
                contentTextarea.value = state.content;

                const buttonWrapper = document.createElement('div');
                const saveBtn = document.createElement('button');
                saveBtn.textContent = 'Save';
                saveBtn.className = 'save-btn';
                saveBtn.onclick = () => updateState(state.id, labelInput.value, contentTextarea.value);

                const cancelBtn = document.createElement('button');
                cancelBtn.textContent = 'Cancel';
                cancelBtn.className = 'cancel-btn';
                cancelBtn.onclick = () => {
                    state.isEditing = false;
                    render();
                };

                editorWrapper.appendChild(document.createTextNode('Label:'));
                editorWrapper.appendChild(labelInput);
                editorWrapper.appendChild(document.createTextNode('Content:'));
                editorWrapper.appendChild(contentTextarea);
                buttonWrapper.appendChild(saveBtn);
                buttonWrapper.appendChild(cancelBtn);
                editorWrapper.appendChild(buttonWrapper);
                stateDiv.appendChild(editorWrapper);
            } else {
                // Create display UI
                const stateText = document.createElement('span');
                stateText.textContent = `${state.label} (ID: ${state.id})`;

                const buttonWrapper = document.createElement('div');
                const editBtn = document.createElement('button');
                editBtn.textContent = 'Edit';
                editBtn.className = 'edit-btn';
                editBtn.onclick = () => {
                    fsmData.states.forEach(s => s.isEditing = false); // Ensure only one is edited at a time
                    state.isEditing = true;
                    render();
                };

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = () => deleteState(state.id);

                buttonWrapper.appendChild(editBtn);
                buttonWrapper.appendChild(deleteBtn);
                stateDiv.appendChild(stateText);
                stateDiv.appendChild(buttonWrapper);
            }
            statesList.appendChild(stateDiv);
        });
    }

    function deleteState(stateId) {
        // Find the index of the state to delete
        const stateIndex = fsmData.states.findIndex(s => s.id === stateId);
        if (stateIndex === -1) return;

        // Remove the state
        fsmData.states.splice(stateIndex, 1);

        // Remove any transitions connected to this state
        fsmData.transitions = fsmData.transitions.filter(t => t.from !== stateId && t.to !== stateId);

        // Re-render the UI
        render();
    }

    function updateState(stateId, newLabel, newContent) {
        const state = fsmData.states.find(s => s.id === stateId);
        if (state) {
            state.label = newLabel.trim();
            state.content = newContent.trim();
            state.isEditing = false;
            render();
        }
    }

    function renderTransitions() {
        transitionsList.innerHTML = '';
        fsmData.transitions.forEach((t, index) => {
            const fromState = fsmData.states.find(s => s.id === t.from);
            const toState = fsmData.states.find(s => s.id === t.to);
            if (fromState && toState) {
                const transDiv = document.createElement('div');
                transDiv.className = 'transition';

                const transText = document.createElement('span');
                transText.textContent = `${fromState.label} -> "${t.label}" -> ${toState.label}`;

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = () => deleteTransition(index);

                transDiv.appendChild(transText);
                transDiv.appendChild(deleteBtn);
                transitionsList.appendChild(transDiv);
            }
        });
    }

    function deleteTransition(transitionIndex) {
        if (transitionIndex < 0 || transitionIndex >= fsmData.transitions.length) return;

        fsmData.transitions.splice(transitionIndex, 1);
        render();
    }

    function updateStateDropdowns() {
        fromStateSelect.innerHTML = '';
        toStateSelect.innerHTML = '';
        fsmData.states.forEach(state => {
            const option1 = document.createElement('option');
            option1.value = state.id;
            option1.textContent = state.label;
            fromStateSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = state.id;
            option2.textContent = state.label;
            toStateSelect.appendChild(option2);
        });
    }

    function generateFinalCode() {
        if (fsmData.states.length === 0) {
            alert("Please add at least one state before generating code.");
            return;
        }

        const generatedHtml = generateHtml();
        const generatedCss = generateCss();

        const finalCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Generated FSM</title>
    <style>
${generatedCss}
    </style>
</head>
<body>
    <div class="fsm-container">
${generatedHtml}
    </div>
</body>
</html>`;

        codeOutput.value = finalCode;
        previewFrame.srcdoc = finalCode;
    }

    function generateHtml() {
        let html = '';
        fsmData.states.forEach((state, index) => {
            const isFirstState = index === 0;
            const checkedAttr = isFirstState ? 'checked' : '';
            // Using radio buttons to ensure only one state is active at a time
            html += `        <input type="radio" name="fsm-state" id="${state.id}-radio" ${checkedAttr}>\n`;
        });

        fsmData.states.forEach(state => {
            html += `        <div class="state-content" id="${state.id}-content">\n`;
            html += `            <h2>${state.label}</h2>\n`;
            html += `            <p>${state.content}</p>\n`;

            const transitionsFromThisState = fsmData.transitions.filter(t => t.from === state.id);
            transitionsFromThisState.forEach(t => {
                html += `            <label class="transition-trigger" for="${t.to}-radio">${t.label}</label>\n`;
            });

            html += `        </div>\n`;
        });

        return html;
    }

    function generateCss() {
        let css = `
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .fsm-container { position: relative; }
        input[type="radio"] { display: none; }
        .state-content { display: none; border: 2px solid #333; padding: 20px; border-radius: 10px; min-width: 300px; min-height: 200px; }
        .transition-trigger { display: inline-block; padding: 10px 15px; background-color: #007bff; color: white; border-radius: 5px; cursor: pointer; margin-right: 10px; }
        .transition-trigger:hover { background-color: #0056b3; }
        `;

        fsmData.states.forEach(state => {
            css += `#${state.id}-radio:checked ~ #${state.id}-content { display: block; }\n`;
        });

        return css;
    }

    console.log('FSM Generator Initialized');
    render();
});