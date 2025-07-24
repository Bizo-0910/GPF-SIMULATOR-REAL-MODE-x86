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

    function displayCalculation(source, offset, finalAddress, isValid) {
        const addressColor = isValid ? 'text-success' : 'text-error';
        calculationContent.innerHTML = `
                    <p>Cálculo do Endereço Físico a partir do <strong class="text-accent">${source.name}</strong>:</p>
                    <div class="bg-primary p-4 rounded-lg my-2 font-mono text-center text-xl">
                        <span>${toHex(source.base, 4)}h</span>
                        <span class="text-secondary mx-2">(Base Origem)</span>
                        <span class="text-yellow-400 mx-1">* 10h</span>
                        <span class="text-secondary mx-1">+</span>
                        <span>${toHex(offset, 4)}h</span>
                        <span class="text-secondary mx-2">(Offset)</span>
                        <span class="text-secondary mx-1">=</span>
                        <strong class="${addressColor}">${toHex(finalAddress, 5)}h</strong>
                    </div>
                    <p>Verificando se o endereço está nos limites do <strong class="text-accent">${source.name}</strong> (Origem):</p>
                     <div class="bg-primary p-4 rounded-lg my-2 font-mono text-center text-lg">
                        <span class="text-secondary">Intervalo Válido: </span>
                        <span class="text-blue-400">${toHex(source.start, 5)}h</span>
                        <span class="text-secondary"> até </span>
                        <span class="text-blue-400">${toHex(source.end, 5)}h</span>
                    </div>
                `;
    }

    function displaySummary(source, target, finalAddress, isValid) {
        if (isValid) {
            summaryTitle.textContent = "3. Conclusão: ACESSO BEM-SUCEDIDO";
            summaryTitle.className = "text-xl font-bold mb-4 text-success";
            summaryContent.innerHTML = `
                        <p>
                            O endereço físico <strong class="font-mono text-success">${toHex(finalAddress, 5)}h</strong> está <strong class="text-success">DENTRO</strong> dos limites permitidos para o segmento de origem, o <strong class="text-accent">${source.name}</strong>.
                        </p>
                        <p class="mt-4 font-bold">
                            Nenhuma falha de proteção é gerada. A operação de memória seria concluída com sucesso.
                        </p>
                    `;
        } else {
            summaryTitle.textContent = "3. Conclusão: FALHA DE PROTEÇÃO GERAL (GPF)";
            summaryTitle.className = "text-xl font-bold mb-4 text-error";

            let actualSegmentKey = null;
            const displayOrder = ['CS', 'SS', 'DS', 'ES'];
            for (const key of displayOrder) {
                if (finalAddress >= segments[key].start && finalAddress <= segments[key].end) {
                    actualSegmentKey = key;
                    break;
                }
            }

            let locationExplanation = '';
            if (actualSegmentKey) {
                const actualSegment = segments[actualSegmentKey];
                if (actualSegment.name === target.name) {
                    locationExplanation = `
                                <div class="mt-3 p-3 bg-green-900/50 border border-green-700 rounded-lg flex items-center">
                                    <svg class="w-6 h-6 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <div>
                                        Apesar da falha, o endereço caiu no segmento que você previu: <strong class="text-accent">${actualSegment.name}</strong>. A operação ainda é ilegal porque o acesso se originou fora dos limites do <strong class="text-accent">${source.name}</strong>.
                                    </div>
                                </div>
                             `;
                } else {
                    locationExplanation = `
                                <div class="mt-3 p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg flex items-center">
                                    <svg class="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    <div>
                                        O endereço aponta para a área de memória do <strong class="text-accent">${actualSegment.name}</strong>, mas o alvo que você escolheu era o <strong class="text-accent">${target.name}</strong>.
                                    </div>
                                </div>
                             `;
                }
            } else {
                locationExplanation = `
                            <div class="mt-3 p-3 bg-tertiary/50 border border-color rounded-lg flex items-center">
                                 <svg class="w-6 h-6 text-secondary mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                                <div>
                                    O endereço aponta para uma <strong class="text-secondary">área de memória não alocada</strong> entre os segmentos.
                                </div>
                            </div>
                        `;
            }

            summaryContent.innerHTML = `
                        <p>
                            A falha ocorreu porque o acesso, partindo do <strong class="text-accent">${source.name}</strong>, ultrapassou os limites do próprio segmento.
                            O endereço físico resultante é <strong class="font-mono text-error">${toHex(finalAddress, 5)}h</strong>.
                        </p>
                        ${locationExplanation}
                        <p class="mt-4 font-bold">
                            A Unidade de Gerenciamento de Memória (MMU) deteta a violação e dispara uma exceção de hardware.
                        </p>
                    `;
        }
    }

    function toHex(num, padding = 4) {
        return num.toString(16).toUpperCase().padStart(padding, '0');
    }
});