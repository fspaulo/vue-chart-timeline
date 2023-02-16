<template>
    <q-page>
        <toolbar title="Data" :data="data" :header="header"/>

        <q-separator/>

        <div class="q-pl-xs q-pt-xs q-pr-xs q-pb-xs">
            <gstc/>
        </div>

    </q-page>
</template>

<script>
import TasksPresentation from "components/ChartTimeline.vue";
import toolbar from "components/toolbar";

export default {
    name: "Presentation",

    components: {
        toolbar,
        'gstc': TasksPresentation,
    },

    setup() {
        return {}
    },

    data() {
        return {
            data: [],
            header: [],
        }
    },
}
</script>

