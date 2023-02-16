<template>
    <q-dialog
        v-model="showDialog"
        persistent
        style="width: 500px"
    >
        <q-card style="width: 500px">
            <q-bar>
                <q-icon name="mdi-book-clock"/>
                <div>Bookmarks Settings</div>

                <q-space/>

                <q-btn dense flat icon="close" v-close-popup @click="closeDialog">
                    <q-tooltip>Close</q-tooltip>
                </q-btn>
            </q-bar>

            <q-card-section>
                <div
                    v-for="(shift, idx) in bmList"
                    :key="idx"
                    class="q-gutter-y-sm row q-mt-xs"
                >
                    <q-input
                        v-model="shift.bmName"
                        label="Name"
                        outlined
                        dense
                        maxlength="12"
                        style="width: 38%"
                        class="q-mr-sm"
                    />
                    <q-input
                        v-model="shift.bmStart"
                        type="time"
                        label="Start"
                        dense
                        outlined
                        min="1"
                        class="q-mr-xs"
                    />
                    <q-input
                        v-model="shift.color"
                        label="Color"
                        dense
                        outlined
                        class="my-input"
                        style="width: 28%"
                    >
                        <template v-slot:append>
                            <q-icon name="colorize" class="cursor-pointer" :style="'color:'+shift.color">
                                <q-popup-proxy transition-show="scale" transition-hide="scale">
                                    <q-color v-model="shift.color" no-header no-footer class="my-picker"/>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                        <q-tooltip>Color</q-tooltip>
                    </q-input>
                    <q-btn
                        round
                        flat
                        icon="delete"
                        text-color="primary"
                        class="q-ml-sm"
                        :disable="bmList.length === 1"
                        @click="deleteShift(idx)"
                    >
                        <q-tooltip>Delete</q-tooltip>
                    </q-btn>
                </div>
            </q-card-section>

            <q-separator></q-separator>

            <q-card-actions align="left">
                <q-btn
                    flat dense
                    label="Add Bookmark"
                    size="sm"
                    icon="mdi-plus"
                    @click="addMore"
                />

                <q-space></q-space>

                <q-btn
                    dense unelevated
                    label="Save"
                    size="sm"
                    color="primary"
                    class="q-mr-xs"
                    @click="saveShifts"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
import {ref} from "vue";
import {mapMutations} from "vuex";

export default {
    name: "BookmarksDialog",

    props: {
        showDialog: Boolean,
    },

    setup(){
        let count = ref(1)

        return{
            count,
            bmName: ref('Mark 1'),
            bmStart: ref('00:00'),
            color: ref(''),
            bmList: ref([
                {
                    bmName: 'Mark 1',
                    bmStart: '00:00',
                    color: '',
                }
            ]),
        }
    },

    mounted() {
        let storageBookmarks = JSON.parse(localStorage.getItem("bookmarks"));

        if(storageBookmarks != null || storageBookmarks != undefined)
            this.bmList = storageBookmarks
    },

    methods:{
        ...mapMutations("toolbar", ["setBookmarks", "isBookmarksDialog"]),

        saveShifts(){
            console.log(this.bmList);
            this.setBookmarks(this.bmList);
            localStorage.setItem("bookmarks", JSON.stringify(this.bmList));

            this.$emit('closeDialog');
        },

        deleteShift(index){
            this.bmList.splice(index, 1);
        },

        addMore(){
            let shift = {
                shiftName: this.bmName,
                shiftStart: this.bmStart,
                shiftEnd: this.shiftEnd,
                color: this.color,
            };

            this.bmList.push(shift);
        },

        closeDialog(){
            this.$emit('closeDialog')
        }
    }
}
</script>

<style lang="scss" scoped>
.my-picker {
    width: 250px
}
</style>
