<template>
    <q-layout view="hHh lpR fFf">
        <q-header class="header q-layout__section--marginal fixed-top absolute-top">
            <q-toolbar>
                <q-btn
                    flat
                    dense
                    round
                    icon="menu"
                    aria-label="Menu"
                    @click="toggleLeftDrawer"
                />

                <q-toolbar-title class='flex text-bold'>
<!--                    <q-img class="q-mb-sm" alt="" src='~assets/logo.png' width="80px" height="30px"/>-->
                    VUE CHART TIMELINE
                </q-toolbar-title>

                <q-toggle
                    v-model="toggleDark"
                    class="q-mr-md"
                    color="purple"
                    checked-icon="mdi-weather-night"
                    unchecked-icon="mdi-white-balance-sunny"
                    @click="clickDark"
                >
                    <q-tooltip>Change Theme</q-tooltip>
                </q-toggle>

                <span>v1.0.0 </span>
                <span v-on:dblclick="dblClick">
                    _ <q-icon size="xs" class="q-mb-sm" name="mdi-hand-heart-outline"/>
                    <q-tooltip>{{ akonOnceSaid }}</q-tooltip>
                </span>
            </q-toolbar>
        </q-header>

        <q-drawer
            v-model="leftDrawerOpen"
            show-if-above
            bordered
            :mini="miniState"
            @mouseover="miniState = false"
            @mouseout="miniState = true"
            mini-to-overlay
            ontransitionrun="slide-right"
            z-index="0"
            :style="!toggleDark ? 'background-color: #f1f1f1' : ''"
        >
            <q-list>
                <q-item
                    to="/homepage"
                    v-ripple clickable
                    class=""
                >
                    <q-item-section avatar>
                        <q-icon name="home"/>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>Homepage</q-item-label>
                    </q-item-section>
                </q-item>

                <EssentialLink
                    v-for="link in essentialLinks"
                    :key="link.title"
                    v-bind="link"
                />
            </q-list>
        </q-drawer>

        <dialog-i-m-g
            :show-dialog="showIMGDialog"
            @close="closeDialog"
        />

        <q-page-container>
            <router-view/>
        </q-page-container>
    </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'
import dialogIMG from "components/dialogIMG";

const linksList = [
    {
        title: 'Main',
        caption: 'Timeline Chart',
        icon: "mdi-chart-timeline",
        link: '/',
    },
];

import {defineComponent, ref} from 'vue'
import {useQuasar} from 'quasar'

let isDark;
export default defineComponent({
    name: 'MainLayout',

    components: {
        EssentialLink,
        dialogIMG,
    },

    setup() {
        isDark = JSON.parse(localStorage.getItem('darkMode'));

        if (isDark == null) isDark = false;

        const leftDrawerOpen = ref(false)
        const $q = useQuasar();

        $q.dark.set(JSON.parse(localStorage.getItem('darkMode')));

        return {
            essentialLinks: linksList,
            leftDrawerOpen,
            toggleLeftDrawer() {
                leftDrawerOpen.value = !leftDrawerOpen.value
            },
            miniState: ref(true),
            showIMGDialog: ref(false),
            akonOnceSaid: 'Nobody wanna see us togheda',
            toggleDark: ref(isDark),
        }
    },

    methods: {
        clickDark() {
            isDark = !isDark
            this.$q.dark.set(isDark)
            return isDark
        },

        dblClick(){
            this.showIMGDialog = true;
        },

        closeDialog(){
            this.showIMGDialog = false;
        }
    },

    computed: {
        isDarkTheme() {
            return this.$q.dark.isActive
        },
    },

    watch: {
        toggleDark(val) {
            this.$q.dark.set(val);
            localStorage.setItem("darkMode", this.toggleDark.toString())
        }
    }
})
</script>

<style scoped>
.header {
    background: linear-gradient(
        145deg,
        rgb(46, 34, 172) 15%,
        rgb(224, 75, 157) 70%
    );
}
</style>
