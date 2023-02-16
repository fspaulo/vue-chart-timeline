<template>
    <div class="q-gutter-sm">

        <q-bar dark>
            <q-btn-dropdown
                v-for="(item, indexItem) in itemsMenu" :key="indexItem"
                :label="item.title"
                dense flat
            >
                <q-list dense>
                    <q-item
                        v-for="(subItem, indexSubItem) in item.items" :key="subItem.title"
                        @click="menuActionClick(subItem.action, indexItem, indexSubItem)"
                        clickable
                        dense
                        v-close-popup
                    >
                        <q-item-section avatar>
                            <q-avatar :icon="subItem.icon" size="lg" text-color="primary"/>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>{{ subItem.title }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-btn-dropdown>
        </q-bar>
    </div>

    <BookmarksDialog
        :show-dialog="showBookmarksDialog"
        @closeDialog="closeShiftDialog"
    ></BookmarksDialog>

</template>

<script>
import {mapGetters, mapMutations} from "vuex"
import BookmarksDialog from "components/BookmarksDialog.vue";
import CaptionsDialog from "components/captionsDialog";

export default {
    name: "toolbar",

    props: {
        title: String,
        data: Array,
        header: Array,
    },

    components: {
        BookmarksDialog,
        CaptionsDialog,
    },

    data() {
        return {
            downloadLoading: false,
            showBookmarksDialog: false,
            showCaptionsDialog: false,
        }
    },

    setup() {
        return {}
    },

    computed: {
        itemsMenu() {
            return [
                {
                    title: "Actions",
                    items: [
                        {
                            title: "Bookmarks", icon: "mdi-book-clock",
                            action: () => {
                                this.shiftDialog();
                            }
                        },
                        {
                            title: "Export PDF", icon: "mdi-file-export-outline",
                            action: () => {}
                        },
                        {
                            title: "Export Image", icon: "mdi-file-export-outline",
                            action: () => {}
                        },
                    ],
                },
            ]
        },
    },

    methods: {
        ...mapGetters("toolbar", ["getBookmarks", "getShowDialog"]),
        ...mapMutations("toolbar", ["setBookmarks", "isBookmarksDialog"]),

        menuActionClick(action, indexItem, indexSubItem) {
            if (this.itemsMenu[indexItem].items[indexSubItem].action === action)
                this.itemsMenu[indexItem].items[indexSubItem].action();
        },

        shiftDialog() {
            this.showBookmarksDialog = true;
        },

        closeShiftDialog(){
            this.showBookmarksDialog = false;
        },
    },
}
</script>

