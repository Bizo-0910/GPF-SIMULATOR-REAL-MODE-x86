document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos da UI
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    const csBaseInput = document.getElementById('cs_base_input');
    const dsBaseInput = document.getElementById('ds_base_input');
    const ssBaseInput = document.getElementById('ss_base_input');
    const esBaseInput = document.getElementById('es_base_input');
    const sourceSegmentSelect = document.getElementById('source_segment');
    const targetSegmentSelect = document.getElementById('target_segment');
    const accessOffsetInput = document.getElementById('access_offset');
    const simulateBtn = document.getElementById('simulate_btn');
    const resultsPanel = document.getElementById('results_panel');
    const segmentTableBody = document.getElementById('segment_table_body');
    const calculationContent = document.getElementById('calculation_content');
    const summaryTitle = document.getElementById('summary_title');
    const summaryContent = document.getElementById('summary_content');
    const errorMessage = document.getElementById('error_message');
    const memoryMapContainer = document.getElementById('memory_map_container');

    // Lógica do Tema
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('light');
        sunIcon.classList.toggle('hidden');
        moonIcon.classList.toggle('hidden');
    });

    function displaySegmentDetails(segments) {
        segmentTableBody.innerHTML = '';
        const displayOrder = ['CS', 'SS', 'DS', 'ES'];
        displayOrder.forEach(key => {
            const seg = segments[key];
            const row = `
                        <tr class="border-b border-color hover:bg-tertiary">
                            <td class="p-2 text-accent">${seg.name}</td>
                            <td class="p-2">${toHex(seg.base, 4)}h</td>
                            <td class="p-2">${toHex(seg.start, 5)}h</td>
                            <td class="p-2">${toHex(seg.end, 5)}h</td>
                        </tr>
                    `;
            segmentTableBody.innerHTML += row;
        });
    }

    function displayMemoryMap(segments) {
        memoryMapContainer.innerHTML = '';
        const displayOrder = ['ES', 'DS', 'SS', 'CS']; // Ordem para renderização de cima para baixo

        const minAddress = segments.CS.start;
        const maxAddress = segments.ES.end;
        const totalSpan = maxAddress - minAddress;
        if (totalSpan <= 0) return; // Evita divisão por zero

        const memoryBlocks = [];

        for (let i = 0; i < displayOrder.length; i++) {
            const key = displayOrder[i];
            const seg = segments[key];
            memoryBlocks.push({
                type: 'segment',
                key: key,
                start: seg.start,
                end: seg.end,
                color: seg.color
            });

            if (i < displayOrder.length - 1) {
                const nextKey = displayOrder[i + 1];
                const nextSeg = segments[nextKey];
                const gapStart = nextSeg.end + 1;
                const gapEnd = seg.start - 1;
                if (gapStart <= gapEnd) {
                    memoryBlocks.push({
                        type: 'gap',
                        start: gapStart,
                        end: gapEnd
                    });
                }
            }
        }

        memoryBlocks.forEach((block, index) => {
            const blockSize = block.end - block.start + 1;
            if (blockSize <= 0) return;

            const blockHeight = (blockSize / totalSpan) * 100;
            const blockDiv = document.createElement('div');

            let innerHTML = '';
            if (block.type === 'segment') {
                blockDiv.className = `memory-segment ${block.color} border-y border-gray-500 flex items-center justify-center text-white font-bold text-sm`;
                innerHTML = `<span>${block.key}</span>`;
            } else { // gap
                blockDiv.className = 'memory-gap border-dashed border-y border-gray-600';
            }
            blockDiv.style.height = `${blockHeight}%`;
            blockDiv.innerHTML = innerHTML;

            const topLabel = document.createElement('div');
            topLabel.className = 'address-label top';
            topLabel.textContent = `${toHex(block.end, 5)}h`;
            blockDiv.appendChild(topLabel);

            if (index === memoryBlocks.length - 1) {
                const bottomLabel = document.createElement('div');
                bottomLabel.className = 'address-label bottom';
                bottomLabel.textContent = `${toHex(block.start, 5)}h`;
                blockDiv.appendChild(bottomLabel);
            }

            memoryMapContainer.appendChild(blockDiv);
        });
    }
});