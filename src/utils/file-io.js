export function saveProjectToFile(data, filename = 'project.json') {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function loadProjectFromFile(file) {
    return new Promise((resolve, reject) => {
        if (!file || file.type !== 'application/json') {
            reject(new Error('Invalid file type'));
            return;
        }
        if (file.size > 1024 * 1024) {
            reject(new Error('File too large'));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                resolve(data);
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}
