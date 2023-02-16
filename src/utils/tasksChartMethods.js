import GSTC from "gantt-schedule-timeline-calendar";

/**
 * Config de chart.CalendarLevels (hours, minutes) - Zoom configs
 * */
const top = [
    {
        zoomTo: 100, // this format will be displayed for all zoom levels until 100
        period: 'hour',
        periodIncrement: 24,
        classNames: ["gstc-date-medium gstc-date-left"],
        format({timeStart}) {
            return timeStart.locale('pt').format('DD MMMM YYYY'); // full list of formats: https://day.js.org/docs/en/display/format
        },
    },
];

const bottom = [
    {
        zoomTo: 10, // when config.chart.time.zoom is less than or equal to 10 then this format will be used as second level
        period: 'minute',
        periodIncrement: 1,
        main: true, // we want grid to be divided by this period = minute
        format({timeStart, vido}) {
            return vido.html`<div style="text-align:center;">${timeStart.format('HH:mm')}</div>`; // full list of formats: https://day.js.org/docs/en/display/format
        },
    },
    {
        zoomTo: 11,
        period: 'minute',
        periodIncrement: 2,
        main: true,
        format({timeStart, vido}) {
            return vido.html`<div style="text-align:center;">${timeStart.format('HH:mm')}</div>`;
        },
    },
    {
        zoomTo: 12,
        period: 'minute',
        periodIncrement: 5,
        main: true,
        format({timeStart, vido}) {
            return vido.html`<div style="text-align:center;">${timeStart.format('HH:mm')}</div>`;
        },
    },
    {
        zoomTo: 13,
        period: 'minute',
        periodIncrement: 15,
        main: true,
        format({timeStart, vido}) {
            return vido.html`<div style="text-align:center;">${timeStart.format('HH:mm')}</div>`;
        },
    },
    {
        zoomTo: 15,
        period: 'minute',
        periodIncrement: 30,
        main: true,
        format({timeStart, vido}) {
            return vido.html`<div style="text-align:center;">${timeStart.format('HH:mm')}</div>`;
        },
    },
    {
        zoomTo: 100,
        period: 'hour',
        periodIncrement: 1,
        main: true,
        format({timeStart, vido}) {
            return vido.html`<div style="text-align:center;">${timeStart.format('HH:mm')}</div>`;
        },
    },
];

const colors = ['#E74C3C', '#DA3C78', '#7E349D', '#0077C0', '#07ABA0', '#0EAC51', '#F1892D'];
function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

/** Cores das bordas das tasks */
function getBorderColor(state, endTime){
    if (state === 500) {
        return "#08c93c";
    } else if (state === 500 && new Date(endTime) <= new Date()) {
        return "#f50000";
    } else {
        return "transparent";
    }
}

/**
 * Config de itemSlot (card) com icones e conteúdos do card da task
 * (Icones, Letra inical, Nome)
 * */
function itemSlot(vido, props) {
    const {html, onChange, cache} = vido;
    let position;

    function updatePosition() {
        if (props && props.itemData) {
            position = props.itemData.position;
        }
    }

    updatePosition();

    onChange((changedProps) => {
        // if current element is reused to display other item data just update your data so when you click you will display right alert
        props = changedProps;
        updatePosition();
    });

    function onClick(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        alert(props.item.label + ' - Some item action');
    }

    return (content) =>
        html`
            <div
                class="item-img"
                @click="${onClick}"
                style="
                    width:24px; height:24px;
                    border-radius:100%; text-align:center; line-height:24px;
                    font-weight:bold; margin-right:4px; position: sticky; cursor: pointer;
                "
            >
                <img src="/icons/check-icon.png" alt="" style="max-height: 20px; max-width: 20px; margin-top: 1px"/>
            </div>
            ${content}`
}

/**
 * Config de rowSlot (linha/coluna do operador)
 * */
function rowSlot(vido, props) {
    const {html, onChange, update, api} = vido;

    onChange((newProps) => {
        props = newProps;
        if (!props || !props.row) return;
        update();
    });

    return (content) => {
        if (!props || !props.column) return content;
        return api.sourceID(props.column.id) === 'label'
            ? html`
                <div class="row-content-wrapper" style="display:flex">
                    <div class="row-content" style="flex-grow:1;">${content}</div>
                </div>`
            : content;
    };
}

/**
 * Configuração de células de Intervalo do operador
 * Seta as celulas da condição para amarelo
 * chamado na config de montagem do grafico: chart.grid.cell.onCreate
 * */
function onCellCreateInterval({time, row, vido, content}) {
    if (!row.intervalList) return content;
    let isInterval = false;
    // Itera lista de intervalos do operador
    /* Faz a divisao da hora de início e fim do intervalo
    * Após verifica se a celula ta dentro desse intervalo (time.leftGlobal, time.rightGlobal)
    * */
    for (const interval of row.intervalList) {
        let staInt = interval.startTime.split(':');
        let endInt = interval.endTime.split(':');
        let from = new Date().setHours(staInt[0], staInt[1]);
        let to = new Date().setHours(endInt[0], endInt[1]);

        if (time.leftGlobal >= from && time.rightGlobal <= to) {
            isInterval = true;
            break;
        }
    }
    if (isInterval) {
        return vido.html`
                            <div style="height:100%;width:100%;font-size:10px;
                                        background:rgba(253,211,41,0.15);">
                            </div>${content}
                        `;
    }
    return content;
}

/*
* Cria uma label nas celulas de intervalo
* mas fica meio bugado
* (setar background-color no style da div abaixo, para ver como fica)
* */
function intervalOpRowSlot(vido, props) {
    const { onChange, html, update, api, state } = vido;

    let intervalContent = [];
    onChange((changedProps) => {
        props = changedProps;
        if (!props || !props.row || !props.row.intervalList) {
            intervalContent = [];
            return update();
        }
        const configTime = state.get('config.chart.time');
        intervalContent = [];
        for (const interval of props.row.intervalList) {
            let staInt = interval.startTime.split(':');
            let endInt = interval.endTime.split(':');
            let from = new Date().setHours(staInt[0], staInt[1]);
            let to = new Date().setHours(endInt[0], endInt[1]);

            if (to < configTime.leftGlobal || from > configTime.rightGlobal) continue;
            const leftPx = api.time.getViewOffsetPxFromDates(api.time.date(from));
            const rightPx = api.time.getViewOffsetPxFromDates(api.time.date(to));
            const widthPx = rightPx - leftPx - 40;
            if (widthPx < 0) continue;
            let textAlign = 'left';
            if (widthPx <= 100) textAlign = 'center';
            intervalContent.push(
                html`
                    <div style="position:fixed;left:${leftPx}px;width:${widthPx}px;
                                height:43px;white-space: nowrap;text-overflow:ellipsis;overflow:hidden;font-size:11px;
                                color:white;text-align:${textAlign};"
                    ></div>
                `
            );
        }
        update();
    });

    return (content) => html`${intervalContent}${content}`;
}

/**
 * Função de clique na task
 * */
function onItemClick(ev) {
    const itemElement = ev.target.closest('.gstc__chart-timeline-items-row-item');
    const itemId = itemElement.dataset.gstcid;
    const item = gstc.api.getItem(itemId);
    // console.log(gstc.state.get('$data.chart.time'));
    console.log('Item clicado', item);
}

/**
 * Template da função de clique
 * mais exempos em https://gantt-schedule-timeline-calendar.neuronet.io/documentation/configuration/templates
 * */
function chartTimelineItemsRowItemTemplate({className, labelClassName, styleMap, cache, shouldDetach, cutterLeft,
                                               cutterRight, getContent, actions, slots, html, vido, props,}) {
    const detach = shouldDetach || !props || !props.item;
    return cache(
        detach
            ? null
            : slots.html(
                'outer',
                html`
                    <div
                        class=${className}
                        data-gstcid=${props.item.id}
                        data-actions=${actions()}
                        style=${styleMap.directive()}
                        @click=${onItemClick}
                    >
                        ${slots.html(
                            'inner',
                            html`
                                ${cutterLeft()}
                                <div class=${labelClassName}>${slots.html('content', getContent())}</div>
                                ${cutterRight()}
                            `
                        )}
                    </div>
                `
            )
    );
}

const doNotSelectThisCells = ['2022-06-02'];
const doNotSelectThisItems = [GSTC.api.GSTCID('4')];

function canSelectItem(item) {
    // console.log('canSelect', item, doNotSelectThisItems.includes(item.id), doNotSelectThisItems);
    if (typeof item.canSelect === 'boolean') return item.canSelect;
    return !doNotSelectThisItems.includes(item.id);
}

function preventSelection(selecting) {
    return {
        'chart-timeline-grid-row-cell': selecting['chart-timeline-grid-row-cell'].filter(
            (cell) => !doNotSelectThisCells.includes(cell.time.leftGlobalDate.format('YYYY-MM-DD'))
        ),
        'chart-timeline-items-row-item': selecting['chart-timeline-items-row-item']
            .filter((item) => canSelectItem(item)),
    };
}

export {
    top, bottom, getRandomColor, getBorderColor, itemSlot, rowSlot,
    onCellCreateInterval, intervalOpRowSlot, chartTimelineItemsRowItemTemplate, preventSelection,
}
