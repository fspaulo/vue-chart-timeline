<template>
    <q-dialog
        v-model="showDialog"
        persistent
        style="width: 300px"
    >
        <q-card style="width: 300px">
            <q-bar>
                <q-icon name="mdi-pencil"/>
                <div>Edit - {{ selected.label }}</div>

                <q-space/>

                <q-btn dense flat icon="close" v-close-popup @click="closeDialog"/>
            </q-bar>

            <q-card-section>
                <div
                    class="q-gutter-y-sm q-mt-xs"
                >
                    <q-select
                        v-model="type"
                        :options="typeOptions"
                        label="Type"
                        bottom-slots
                        dense borderless
                        options-dense
                        emit-value
                        map-options outlined
                        transition-show="jump-up"
                        transition-hide="jump-up"
                        color="primary"
                    >
                        <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                                <q-item-section avatar>
                                    <q-icon :name="scope.opt.icon" size="20px"/>
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label v-html="scope.opt.label"/>
                                </q-item-section>
                            </q-item>
                        </template>
                    </q-select>

                    <q-select
                        v-model="user"
                        :options="usersName"
                        label="User"
                        bottom-slots
                        dense borderless
                        options-dense
                        emit-value
                        map-options outlined
                        transition-show="jump-up"
                        transition-hide="jump-up"
                        color="primary"
                    />
                </div>
            </q-card-section>

            <q-separator></q-separator>

            <q-card-actions align="left">

                <q-space></q-space>

                <q-btn
                    unelevated
                    label="Save"
                    :loading="loadingSave"
                    size="sm"
                    color="primary"
                    class="q-mr-xs"
                    @click="saveEdit"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
import {ref} from "vue";

export default {
    name: "EditTaskDialog",

    props: {
        showDialog: Boolean,
        selected: Object,
        users: Array,
    },

    updated() {
        this.type = this.selected?.type;
        Object.keys(this.users).forEach((item) => {
            this.usersName.push(this.users[item].label);
        });
    },

    setup() {
        return {
            type: ref(1),
            user: ref(''),
            usersName: ref([]),
            typeOptions: [
                {value: 1, label: 'Type 1'},
                {value: 2, label: 'Type 2'},
                {value: 3, label: 'Type 3'},
                {value: 4, label: 'Type 4'},
                {value: 5, label: 'Type 5'},
                {value: 6, label: 'Type 6'},
                {value: 7, label: 'Type 7'},
                {value: 8, label: 'Type 8'},
                {value: 9, label: 'Type 9'}
            ],
            loadingSave: false,
        }
    },

    methods: {
        closeDialog() {
            this.$emit('closeDialog')
        },

        saveEdit() {
            this.loadingSave = true;

            let body = {
                type: this.type,
                user: this.user,
            }

            this.$emit('save', body);

            this.loadingSave = false;
            this.closeDialog();
        },
    }
}
</script>
