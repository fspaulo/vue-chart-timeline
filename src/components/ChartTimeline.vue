<template>
    <q-card bordered style="height: calc(101vh - 100px)">
        <q-toolbar>
        <span class="text-h5 q-mr-md">
            Main Chart
        </span>

            <q-input
                v-model="search"
                dense
                borderless
                outlined
                label="Search name"
                style="width: 18%"
            >
                <template v-slot:append>
                    <q-icon class="cursor-pointer" name="search"/>
                </template>
            </q-input>

            <q-select
                outlined
                v-model="filterTypes"
                :options="optionsTypes"
                label="Filter"
                dense
                options-dense
                multiple
                emit-value
                clearable
                map-options
                class="q-ml-sm"
                style="width: 13%;"
            >
                <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
                    <q-item v-bind="itemProps">
                        <q-item-section>
                            <q-item-label v-html="opt.label"/>
                        </q-item-section>
                        <q-item-section side>
                            <q-checkbox dense :model-value="selected" @update:model-value="toggleOption(opt)"/>
                        </q-item-section>
                    </q-item>
                </template>
            </q-select>

            <q-btn
                dense unelevated class="q-ml-sm" icon="event" padding="sm"
                style="color: #797b82;"
            >
                <q-popup-proxy @before-show="updateProxy" cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="proxyDate" range today-btn>
                        <div class="row items-center justify-end q-gutter-sm">
                            <q-btn label="Cancel" color="primary" flat v-close-popup/>
                            <q-btn label="OK" color="primary" flat @click="saveDate" v-close-popup/>
                        </div>
                    </q-date>
                </q-popup-proxy>
                <q-tooltip>Filter dates</q-tooltip>
            </q-btn>

            <q-space
            ></q-space>

            <q-btn
                :loading="solutionButton.loading"
                :percentage="solutionButton.percentage"
                class="flex-center q-mr-lg"
                color="primary" unelevated
                text-color="white"
                @click="loadData(this)"
                style="width: 160px"
                icon="upload"
            >
                Load
                <template v-slot:loading>
                    <q-spinner-gears class="on-left" />
                    Loading...
                </template>
            </q-btn>

            <q-select
                v-model="interval"
                :options="optionsTime"
                dense
                borderless
                options-dense
                class="flex-center q-mr-sm"
            >
                <template v-slot:prepend>
                    <q-icon name="mdi-timeline-clock-outline"/>
                </template>
                <q-tooltip>Interval</q-tooltip>
            </q-select>

            <q-btn
                icon="mdi-clock-end"
                dense flat
                size="14px"
                class="q-mr-sm"
                style="color: #797b82;"
                @click="goToCurrentTime"
            >
                <q-tooltip :disable="$q.platform.is.mobile">Current Time</q-tooltip>
            </q-btn>

            <q-btn
                icon="refresh"
                color="primary"
                dense flat
                size="14px"
                class="q-mr-md"
                :loading="loadingChart"
                @click="reloadPage"
            >
                <q-tooltip :disable="$q.platform.is.mobile">Refresh</q-tooltip>
            </q-btn>
        </q-toolbar>

        <q-separator/>

        <div :key="key">
            <div class="gstc-wrapper" ref="gstc" id="gstc"></div>
            <q-separator/>
            <div id="footer"></div>
        </div>
    </q-card>

    <q-page-sticky position="bottom-right" :offset="[40, 50]">
        <q-fab
            v-show="selectedItems.length !== 0"
            v-model="floatButton"
            icon="edit"
            direction="up"
            color="primary"
        >
            <q-fab-action
                text-color="primary" color="white"
                label-position="left" external-label
                :disable="selectedItems[0]?.state >= 500"
                @click="showEdit=true"
            >
                <template v-slot:icon>
                    <q-icon name="edit" />
                </template>

                <template v-slot:label>
                    Edit
                </template>
            </q-fab-action>

            <q-fab-action
                text-color="primary" color="white"
                label-position="left" external-label
                @click="showInfo=!showInfo"
            >
                <template v-slot:icon>
                    <q-icon name="mdi-information-outline" />
                </template>
                <template v-slot:label>
                    Info
                </template>
            </q-fab-action>
        </q-fab>
    </q-page-sticky>

    <EditItemDialog
        :show-dialog="showEdit"
        :selected="selectedItems[0]"
        :users="users"
        @closeDialog="closeEdit"
        @save="saveTask"
    ></EditItemDialog>

</template>

<script>
import GSTC from "gantt-schedule-timeline-calendar/dist/gstc.wasm.esm.min";
import {Plugin as TimelinePointer} from "gantt-schedule-timeline-calendar/dist/plugins/timeline-pointer.esm.min";
import {Plugin as Selection} from "gantt-schedule-timeline-calendar/dist/plugins/selection.esm.min";
import {Plugin as ItemMovement} from "gantt-schedule-timeline-calendar/dist/plugins/item-movement.esm.min";
import {
    Plugin as Bookmarks,
    Plugin as TimeBookmarks
} from "gantt-schedule-timeline-calendar/dist/plugins/time-bookmarks.esm.min";
import {Plugin as CalendarScroll} from 'gantt-schedule-timeline-calendar/dist/plugins/calendar-scroll.esm.min';
import {Plugin as ProgressBar} from 'gantt-schedule-timeline-calendar/dist/plugins/progress-bar.esm.min';
import {Plugin as DependencyLines} from "gantt-schedule-timeline-calendar/dist/plugins/dependency-lines.esm.min";

import "gantt-schedule-timeline-calendar/dist/style.css";
import weekOfYear from "dayjs/plugin/weekOfYear";
import advFormat from "dayjs/plugin/advancedFormat";
import tippy from "tippy.js";
import 'tippy.js/dist/tippy.css';
import DoubleFormatterMixin from "src/mixins/DoubleFormatterMixin";
import {
    top, bottom, getRandomColor, getBorderColor, itemSlot, rowSlot,
    onCellCreateInterval, intervalOpRowSlot, chartTimelineItemsRowItemTemplate, preventSelection
} from 'src/utils/tasksChartMethods';
import EditItemDialog from "components/EditItemDialog.vue";

import {ref} from "vue";

let gstc, state;
const GSTCID = GSTC.api.GSTCID;

// helper functions
/**
 * Config tooltip content of User Column
 * var item = to all card data (current position, height, width)
 * var data = to all GANTT information, card, task, row..
 * */
function setItemTippyContent(element, data) {
    if (!gstc) return;
    if ((!data || !data.item) && element._tippy)
        return element._tippy.destroy();

    const item = gstc.api.getItemData(data.item.id);

    if (!item)
        return element._tippy.destroy();

    if (item.detached && element._tippy)
        return element._tippy.destroy();

    if (!item.detached && !element._tippy)
        tippy(element,
            {
                trigger: 'mouseenter click',
                allowHTML: true,
                animation: 'fade',
                theme: 'light',
            }
        );

    if (!element._tippy) return;

    const startDate = item.time.startDate;
    const endDate = item.time.endDate;

    // To set the duration of items
    let getTime = (secs) => {
        let sec_num = parseInt(secs, 10)
        let hours = Math.floor(sec_num / 3600)
        let minutes = Math.floor(sec_num / 60) % 60
        let seconds = sec_num % 60

        return [hours, minutes, seconds]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":")
    }

    let timeDiff = Math.abs(endDate - startDate);

    const tooltipContent = `<div>
        Item Name: ${data.item.label}<br>
        User: ${data.row.label}<br>
        From: ${startDate.format('HH:mm:ss')} to ${endDate.format('HH:mm:ss')}<br>
        Type: ${data.item.type}<br>
        Duration: ${getTime(timeDiff/1000)}<br>
        ${'<span style="height: 7px;width: 7px;background-color: #db0404;border-radius:50%;' +
        'display: inline-block; margin-right: 3px; margin-bottom: 1px"></span>Action needed'} <br>
        </div>`;

    element._tippy.setContent(tooltipContent);
}

function itemTippy(element, data) {
    setItemTippyContent(element, data);
    return {
        update(element, data) {
            if (element._tippy) element._tippy.destroy();
            setItemTippyContent(element, data);
        },
        destroy(element, data) {
            if (element._tippy) element._tippy.destroy();
        },
    };
}

/**
 * Config tooltip content of User Column
 * var item = to all card data (current position, height, width)
 * var data = to all GANTT information, card, task, row..
 * */
function setRowTippyContent(element, data) {
    if (!gstc) return;
    if ((!data || !data.item) && element._tippy)
        return element._tippy.destroy();

    const row = gstc.api.getRowData(data.row.id);

    if (!row)
        return element._tippy.destroy();

    tippy(element,
        {
            trigger: 'mouseenter click',
            allowHTML: true,
            animation: 'fade',
            theme: 'light',
        }
    );

    if (!element._tippy) return;

    const tooltipContent = `<div>
        <img src="/icons/id_card.png" style="max-height: 15px; max-width: 15px; margin-right: 3px" alt=""/>
        Registation: ${data.row.registration}<br>
        <img src="/icons/briefcase.png" style="max-height: 15px; max-width: 15px; margin-right: 3px; margin-top: 5px" alt=""/>
        Job: ${data.row.job}<br>
        </div>`;

    element._tippy.setContent(tooltipContent);
}

function rowTippy(element, data) {
    setRowTippyContent(element, data);
    return {
        update(element, data) {
            if (element._tippy) element._tippy.destroy();
            setRowTippyContent(element, data);
        },
        destroy(element, data) {
            if (element._tippy) element._tippy.destroy();
        },
    };
}

/**
 * Bookmarks configs
 * */
let bookmarks = [
    {
        time: GSTC.api.date().valueOf(),
        label: 'Now',
        style: {background: '#ea425d', fontWeight: 'bold'},
    },
]

// Main component
export default {
    name: "GSTC_chart",
    props: {
        zoomLevel: Number,
        filterNoTasks: Boolean,
    },

    components: {
        EditItemDialog: EditItemDialog,
    },

    mixins: [DoubleFormatterMixin],

    setup() {
        const users = []
        const items = []
        const search = ref('')
        const date = ref({from: '', to: ''})
        const proxyDate = ref({from: '', to: ''})

        const startDate = GSTC.api.date(new Date()).startOf('day');
        const endDate = GSTC.api.date(new Date()).endOf('day');

        const loadButton = ref({ loading: false, percentage: 0 })

        return {
            users,
            items,
            selectedItems: ref([]),
            key: 0,
            search,
            interval: ref({value: 16, label: '1 hour'}),
            optionsTime: [
                {value: 13, label: '15 minutes'},
                {value: 15, label: '30 minutes'},
                {value: 16, label: '1 hour'},
                {value: 17, label: '1 Day'},
            ],
            filterNoTasks: ref(false),
            zoomLevel: 16,
            loadingChart: ref(false),
            filterTypes: ref([]),
            optionsTypes: [
                {value: '*', label: 'All'},
                {value: 1, label: '1'},
                {value: 2, label: '2'},
                {value: 3, label: '3'},
                {value: 4, label: '4'},
                {value: 5, label: '5'},
                {value: 6, label: '6'},
                {value: 7, label: '7'},
                {value: 8, label: '8'},
                {value: 9, label: '9'},
            ],
            date,
            proxyDate,
            timer: 0,
            showEdit: ref(false),
            showInfo: ref(false),
            floatButton: ref(false),
            updateProxy() {
                proxyDate.value = date.value
            },
            saveDate() {
                date.value = proxyDate.value
            },
            solutionButton: loadButton,
            startDate,
            endDate,
            rowsNumber: 20,
        }
    },

    created() {
        // Att real time bookmark
        this.updateBookmark();
        this.timer = setInterval(this.updateBookmark, 5000);
    },

    mounted() {
        this.key++;
        this.loadingChart = true;

        setTimeout(() => {
            globalThis.GSTC = GSTC;

            this.mountChart(this);

            this.setCustomBookmarks(state);
            state.data.config.plugin.TimeBookmarks.bookmarks = bookmarks;

            this.startChartOnFirstItem();
            this.toggleDarkMode();

            this.loadingChart = false;
        }, 1000)
    },

    beforeUnmount() {
        if (gstc) gstc.destroy();
    },

    beforeDestroy() {
        clearInterval(this.timer);
    },

    computed: {
        /**
         * Seta o tamanho do gráfico de acordo com a tela
         */
        chartSizeByScreen() {
            console.log(`Tela: ${screen.height}p`)
            if (screen.height < 699) return 290
            if (screen.height >= 700 && screen.height < 749) return 330
            if (screen.height >= 750 && screen.height < 820) return 400
            if (screen.height >= 820 && screen.height < 1000) return 477
            if (screen.height >= 1000 && screen.height < 1199) return 607
            if (screen.height >= 1200) return 817
        },
    },

    methods: {
        /*
         * Load items on chart
         * @param ctx (context)
        */
        loadData(ctx) {
            this.solutionButton.loading = true;
            this.solutionButton.percentage = 0;

            for (let i = 0; i < 8; i++) {
                (function (i) {
                    let timeToInterval = 800 * i;
                    setTimeout(() => {
                        state.update('config', (config) => {
                            config.list.rows = ctx.getRows();
                            config.chart.items = ctx.getItems(i !== 7);
                            return config;
                        });
                        ctx.solutionButton.percentage += 12.5;
                        ctx.solutionButton.loading = i !== 7;
                    }, timeToInterval);
                })(i);
            }

            this.key++;
        },

        reloadPage() {
            // gstc.reload()
            this.loadingChart = true

            setTimeout(() => {
                this.loadingChart = false;
            },2000);
        },

        saveTask(body){
            //dialog
        },

        /**
         * Find and set bookmarkers (filter and mounted)
         * */
        setCustomBookmarks(state, filterFrom){
            let customBookmarks = JSON.parse(localStorage.getItem("bookmarks"));

            if(customBookmarks !== null) {
                customBookmarks.forEach(s => {
                    let startTime = s.bmStart.split(':')

                    let start = new Date(filterFrom == null ? state.data.config.chart.time.from : filterFrom);
                    start.setHours(parseInt(startTime[0]));
                    start.setMinutes(parseInt(startTime[1]));

                    bookmarks.push(
                        {
                            time: GSTC.api.date(start).valueOf(),
                            label: s.bmName,
                            style: {background: s.color, fontWeight: 'bold',},
                        },
                    )
                })
            }
        },

        /**
         * Called each 'x' sec to update bookmark current time
         * */
        async updateBookmark() {
            bookmarks[0] = {
                time: GSTC.api.date().valueOf(),
                label: 'Now',
                style: {background: '#ea425d', fontWeight: 'bold'},
            }

            if(state != null) {
                state.update('config', (config) => {
                    config.plugin.TimeBookmarks.bookmarks = bookmarks;

                    return config;
                });
            }
        },

        /**
         * Mount chart with properties
         * @param ctx
         * */
        mountChart(ctx){
            GSTC.api.dayjs.extend(weekOfYear);
            GSTC.api.dayjs.extend(advFormat);

            const config = {
                licenseKey:
                    '====BEGIN LICENSE KEY====\nXOfH/lnVASM6et4Co473t9jPIvhmQ/l0X3Ewog30VudX6GVkOB0n3oDx42NtADJ8HjYrhfXKSNu5EMRb5KzCLvMt/pu7xugjbvpyI1glE7Ha6E5VZwRpb4AC8T1KBF67FKAgaI7YFeOtPFROSCKrW5la38jbE5fo+q2N6wAfEti8la2ie6/7U2V+SdJPqkm/mLY/JBHdvDHoUduwe4zgqBUYLTNUgX6aKdlhpZPuHfj2SMeB/tcTJfH48rN1mgGkNkAT9ovROwI7ReLrdlHrHmJ1UwZZnAfxAC3ftIjgTEHsd/f+JrjW6t+kL6Ef1tT1eQ2DPFLJlhluTD91AsZMUg==||U2FsdGVkX1/SWWqU9YmxtM0T6Nm5mClKwqTaoF9wgZd9rNw2xs4hnY8Ilv8DZtFyNt92xym3eB6WA605N5llLm0D68EQtU9ci1rTEDopZ1ODzcqtTVSoFEloNPFSfW6LTIC9+2LSVBeeHXoLEQiLYHWihHu10Xll3KsH9iBObDACDm1PT7IV4uWvNpNeuKJc\npY3C5SG+3sHRX1aeMnHlKLhaIsOdw2IexjvMqocVpfRpX4wnsabNA0VJ3k95zUPS3vTtSegeDhwbl6j+/FZcGk9i+gAy6LuetlKuARjPYn2LH5Be3Ah+ggSBPlxf3JW9rtWNdUoFByHTcFlhzlU9HnpnBUrgcVMhCQ7SAjN9h2NMGmCr10Rn4OE0WtelNqYVig7KmENaPvFT+k2I0cYZ4KWwxxsQNKbjEAxJxrzK4HkaczCvyQbzj4Ppxx/0q+Cns44OeyWcwYD/vSaJm4Kptwpr+L4y5BoSO/WeqhSUQQ85nvOhtE0pSH/ZXYo3pqjPdQRfNm6NFeBl2lwTmZUEuw==\n====END LICENSE KEY====',
                innerHeight: this.chartSizeByScreen,
                plugins: [
                    TimelinePointer({
                        enabled: true,
                        captureEvents: {up: true, down: true, move: true},
                    }),
                    Selection({
                        events: {
                            onStart(lastSelected) {
                            },

                            onSelecting(selecting, lastSelected) {
                                return preventSelection(selecting);
                            },

                            onEnd(selected, lastSelected) {
                                const filtered = preventSelection(selected);
                                // set selected items
                                ctx.selectedItems = filtered['chart-timeline-items-row-item'];

                                return filtered;
                            },
                        },
                    }),
                    ItemMovement({
                        snapToTime: {
                            start({startTime}) {
                                return startTime;
                            },
                            end({endTime}) {
                                return endTime;
                            },
                        },
                        autoScroll: {
                            speed: {
                                horizontal: 1,
                                vertical: 1,
                            },
                        },
                    }),
                    Bookmarks(),
                    CalendarScroll(),
                    TimeBookmarks({
                        bookmarks,
                    }),
                    ProgressBar(),
                    DependencyLines({
                        onLine: [
                            (line) => {
                                line.type = GSTC.api.sourceID(line.fromItem.id) === '3' ? 'smooth' : 'square';
                                return line;
                            },
                        ],
                    }),
                ],

                // Rows and columns
                list: {
                    columns: {
                        data: {
                            [GSTC.api.GSTCID("label")]: {
                                id: GSTC.api.GSTCID("label"),
                                width: 250,
                                data: "label",
                                sortable: 'label',
                                header: {
                                    content: "User",
                                },
                            },
                        },
                    },
                    row: {
                        height: 43,
                    },
                    rows: this.getRows(),
                },

                // set items
                chart: {
                    items: this.getItems(false),
                    calendarLevels: [top, bottom],
                    time: {
                        zoom: this.zoomLevel,
                        from: GSTC.api.date(new Date()).startOf('hour').valueOf(),
                        to: GSTC.api.date(new Date()).endOf('day').valueOf(),
                        calculatedZoomMode: false,
                    },
                    item: {
                        height: 37,
                    },
                    grid: {
                        cell: {
                            onCreate: [onCellCreateInterval],
                        },
                    },
                },

                scroll: {
                    vertical: {precise: true},
                    horizontal: {precise: true},
                },

                slots: {
                    // item content slot that will show circle with letter next to item label
                    'chart-timeline-items-row-item': {content: [itemSlot]},
                    'list-column-row': {content: [rowSlot]},
                    'chart-timeline-grid-row': { content: [intervalOpRowSlot] },
                },

                actions: {
                    'chart-timeline-items-row-item': [itemTippy],
                    'list-column-row': [rowTippy],
                },

                templates: {
                    'chart-timeline-items-row-item': chartTimelineItemsRowItemTemplate,
                },
            };

            state = GSTC.api.stateFromConfig(config);

            gstc = GSTC({
                element: this.$refs.gstc,
                state,
            });

            globalThis.state = state;
            globalThis.gstc = gstc;
        },

        /*
         * Start chart on first task
         * */
        startChartOnFirstItem(){
            const api = gstc.api;
            api.scrollToTime(GSTC.api.date(new Date()), false);
        },

        /*
            * Centers the chart on the current time
        * */
        goToCurrentTime() {
            const api = gstc.api;
            api.scrollToTime(GSTC.api.date(new Date()), true);
        },

        /**
         * Generate items
         */
        getItems(isRandom) {
            const items = {};
            for (let i = 0; i < 45; i++) {
                let rowId = GSTC.api.GSTCID(this.getRandomNumber(0, this.rowsNumber).toString());

                if(isRandom) {
                    rowId = GSTC.api.GSTCID(this.getRandomNumber(0, this.rowsNumber).toString());
                }

                let id = GSTCID(i.toString());
                let type = this.getRandomNumber(1, 9);

                let taskStartTime = new Date()
                taskStartTime.setHours(this.getRandomNumber(5, 11));
                taskStartTime.setMinutes(this.getRandomNumber(0, 59));
                taskStartTime.setSeconds(0);

                let taskEndTime = new Date()
                taskEndTime.setHours(this.getRandomNumber(12, 20));
                taskEndTime.setMinutes(this.getRandomNumber(0, 59));
                taskEndTime.setSeconds(0);

                const date = GSTC.api.date;

                items[id] = {
                    id,
                    label: `Task ${i}`,
                    progress: Math.round(Math.random() * 100),
                    style: {
                        background: getRandomColor(),
                        fontWeight: 'bold',
                        border: '3px solid transparent',
                    },
                    time: {
                        start: date(taskStartTime).valueOf(),
                        end: date(taskEndTime).valueOf(),
                    },
                    rowId,
                    description: 'Lorem ipsum dolor sit amet',
                    type,
                };
            }

            items[GSTCID('0')].linkedWith = [GSTCID('1')];
            items[GSTCID('0')].label = 'Task 0 linked with 1';
            items[GSTCID('0')].type = 'task';
            items[GSTCID('1')].label = 'Task 1 linked with 0';
            items[GSTCID('1')].type = 'task';
            items[GSTCID('1')].time = {...items[GSTCID('0')].time};
            items[GSTCID('1')].dependant = [GSTCID('0'),GSTCID('2')];

            this.items = items;

            return items;
        },

        getRows() {
            const rows = {};
            for (let i = 0; i <= this.rowsNumber; i++) {
                const id = GSTCID(String(i));
                rows[id] = {
                    id,
                    label: `Michael Scott ${i}`,
                    expanded: false,
                    vacations: [],
                    progress: Math.floor(Math.random() * 100),
                    visible: true,
                    registration: `00${Math.floor(Math.random() * 10000)}`,
                    job: `Manager - branch ${i}`,
                    //style: {background: user.id && 1 ? '' : '#f8fafb'}
                };
            }

            rows[GSTCID('3')].vacations = [
                {
                    from: this.startDate.add(5, 'hour').startOf('hour').valueOf(),
                    to: this.startDate.add(5, 'hour').endOf('hour').valueOf()
                },
                {
                    from: this.startDate.add(8, 'hour').startOf('day').valueOf(),
                    to: this.startDate.add(8, 'hour').endOf('hour').valueOf()
                },
            ];

            this.users = rows;

            return rows;
        },

        /* Change theme */
        toggleDarkMode() {
            const el = document.getElementById('gstc');
            if (this.$q.dark.isActive) {
                el.classList.add('gstc--dark');
                document.body.classList.add('gstc--dark');
            } else {
                el.classList.remove('gstc--dark');
                document.body.classList.remove('gstc--dark');
            }

            gstc.reload()
        },

        /* Close edit dialog */
        closeEdit(){
            this.showEdit = false
        },

        getRandomNumber(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min)
        },
    },

    watch: {
        /* Set zoom on chart */
        interval: {
            handler: function (val) {
                console.log("Zoom: " + val.value);
                state.update("config.chart.time.zoom", val.value);
                this.startChartOnFirstItem();
            },
            deep: true,
        },

        isDarkTheme() {
            this.toggleDarkMode();
        },

        filterTypes(val) {
            console.log(val)
            let items = this.getItems();
            let selectedFilters = []

            if (val != null) {
                for (let k of val.values()) selectedFilters.push(k);

                // Convert obj to a key/value array
                const asArray = Object.entries(items);

                const filtered = asArray.filter(([key, value]) => selectedFilters.includes(value.type));

                // Convert the key/value array back to an object
                const filtredItems = Object.fromEntries(filtered);
                console.log(filtredItems)

                state.update('config', (config) => {
                    config.list.rows = this.getRows();
                    config.chart.items = filtredItems;
                    return config;
                });
                gstc.reload()
            } else {
                state.update('config', (config) => {
                    config.list.rows = this.getRows;
                    config.chart.items = items;
                    return config;
                });
                gstc.reload()
            }
        },

        date(val) {
            let from, to;
            let dateFrom, dateTo;

            if (typeof val === "string") {
                dateFrom = val;
                dateTo = val;
            } else {
                from = val.from.split('/');
                dateFrom = new Date(from[0], from[1] - 1, from[2]);

                to = val.to.split('/');
                dateTo = new Date(to[0], to[1] - 1, to[2]);
            }

            //check dates for bookmarks
            if(dateFrom === dateTo){
                this.setCustomBookmarks(state, dateFrom)
            }

            state.update('config', (config) => {
                config.chart.time.from = GSTC.api.date(dateFrom).valueOf();
                config.chart.time.to = GSTC.api.date(dateTo).endOf('day').valueOf();
                config.plugin.TimeBookmarks.bookmarks = bookmarks;
                return config;
            });
            gstc.reload()
        },

        search(val) {
            let rows = this.getRows;

            const search = String(val).trim();
            // console.log('search', search);
            const regex = new RegExp(`[\s\S]?${search}[\s\S]?`, 'gi');

            const rowsToKeep = [];
            for (const rowId in rows) {
                const row = rows[rowId];
                const rowData = gstc.api.getRowData(rowId);

                if (regex.test(row.label)) {
                    rowsToKeep.push(rowId);
                    for (const childRowId of rowData.allChildren) {
                        rowsToKeep.push(childRowId);
                    }
                    for (const parentRowId of rowData.parents) {
                        rowsToKeep.push(parentRowId);
                        if (search) rows[parentRowId].expanded = true;
                    }
                }
                regex.lastIndex = 0;
            }

            const uniqueRowsToKeep = [...new Set(rowsToKeep)]; // Not duplicate lines
            for (const rowId in rows) {
                rows[rowId].visible = uniqueRowsToKeep.includes(rowId);
            }
            state.update('config.list.rows', () => {
                return rows;
            });
        },
    }
};
</script>

<style scoped>
img {
    display: inline-block;
}

body {
    height: 100%;
}

#gstc {
    height: calc(100% - 40px);
}

#footer * {
    user-select: none;
    margin-right: 11px;
}

#footer {
    color: #676767;
    max-height: 30px !important;
}

</style>
