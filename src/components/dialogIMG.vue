<!--
Nobody wanna see us together
But it don't matter, no
('Cause I got you)

by Mister lonly
-->
<template>
    <q-dialog
        :model-value="showDialog"
        @update:model-value="$emit('update:showDialog', $event)"
    >
        <q-card>
            <q-bar>
                <q-icon name="eva-file-text-outline"/>
                Akon tem um recado para você...
                <q-space/>
                <q-btn
                    dense flat icon="close"
                    v-close-popup @click="closeDialog"
                ></q-btn>
            </q-bar>

            <div class="row noto-sans q-col-gutter-x-md q-pa-sm">
                <div class="col-12">
                    <q-card class="fit cursor-pointer" flat>
                        <img
                            v-if="new Date().getHours() >= 6 && new Date().getHours() <= 12"
                            alt="misterlonly" src="../assets/utils/bomdiaakon.jpg"
                        />
                        <img
                            v-if="new Date().getHours() >= 13 && new Date().getHours() <= 17"
                            alt="misterlonly" src="../assets/utils/boatardeakon.jpg"
                        />
                        <img
                            v-if="new Date().getHours() >= 18 || new Date().getHours() <= 5"
                            alt="misterlonly" src="../assets/utils/boanoiteakon.jpg"
                        />
                    </q-card>
                </div>
            </div>
        </q-card>
    </q-dialog>
</template>

<script>
export default {
    name: "dialogImgPOD",

    props: {
        showDialog: Boolean,
        src: String,
    },

    methods: {
        closeDialog() {
            this.$emit('update:showDialog', false); // Notifica o pai para fechar o diálogo
        },
    },
}
</script>

