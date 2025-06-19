import TrackerGrid from '../../src/ui/grid.js';
console.log('[TEST] ui.test.js loaded.');
export function testUIComponents() {
    if (typeof document === 'undefined') { console.log('UI tests skipped'); return; }
    const div = document.createElement('div');
    const grid = new TrackerGrid(div);
    grid.init();
    if (!div.querySelector('table')) throw new Error('Grid render failed');
    console.log('Grid rows:', grid.numRows);
}
testUIComponents();
