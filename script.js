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
});