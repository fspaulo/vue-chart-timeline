<!-- Dialogo com as legendas do grafico -->
<template>
    <q-dialog
        v-model="showDialog"
        persistent
        style="width: 400px; height: 500px"
    >
        <div style="background-color: white; width: 400px; height: 500px">
            <q-bar>
                <q-icon name="mdi-subtitles"/>
                <div>Legendas do Gráfico</div>

                <q-space/>

                <q-btn dense flat icon="close" v-close-popup @click="closeDialog"/>
            </q-bar>

            <q-card
                bordered
                class="q-pr-sm"
                style="height: 455px; margin-top: 5px; padding-left: 2px"
            >
                <q-toolbar
                    class="q-pl-md"
                    style="min-height: 35px"
                >
                    <span class="text-subtitle1">
                        <strong>Tarefas</strong>
                    </span>
                </q-toolbar>

                <q-card-section>
                    <table style="width:90%;">
                        <tr>
                            <td>Armazenamento</td>
                            <td>
                                <div class="circle" style="background-color: #debe59;"></div>
                            </td>
                            <td>Recebimento</td>
                            <td>
                                <div class="circle " style="background-color: #bf8c71;"></div>
                            </td>
                        </tr>

                        <tr>
                            <td>Transport_Order</td>
                            <td>
                                <div class="circle" style="background-color: #b1cca9;"></div>
                            </td>
                            <td>Transferência</td>
                            <td>
                                <div class="circle" style="background-color: #66cb67;"></div>
                            </td>
                        </tr>

                        <tr>
                            <td>Coleta</td>
                            <td>
                                <div class="circle" style="background-color: #67bfef;"></div>
                            </td>
                            <td>Packout</td>
                            <td>
                                <div class="circle" style="background-color: #668de5;"></div>
                            </td>
                        </tr>

                        <tr>
                            <td>Expedir</td>
                            <td>
                                <div class="circle" style="background-color: #a777c9;"></div>
                            </td>
                            <td>Reabastecimento</td>
                            <td>
                                <div class="circle" style="background-color: #f57070;"></div>
                            </td>
                        </tr>

                        <tr>
                            <td>Inventário</td>
                            <td>
                                <div class="circle" style="background-color: #F1892D;"></div>
                            </td>
                        </tr>
                    </table>
                </q-card-section>

                <q-separator/>

                <q-toolbar
                    class="q-pl-md"
                    style="min-height: 35px"
                >
                    <span class="text-subtitle1">
                        <strong>Grid</strong>
                    </span>
                </q-toolbar>

                <q-card-section>
                    <table style="width:90%;">
                        <tr class="tr">
                            <td>Representa o horário atual, atualizado a cada 5 segundos.</td>
                            <td>
                                <div class="circle-now" style="background-color: #ec6073;">Agora</div>
                            </td>
                        </tr>

                        <tr style="border:1px solid black;">
                            <td>Células nessa tonalidade representam o horário de intervalo do Operador.</td>
                            <td>
                                <div class="wrapper">
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div style="background-color: rgba(253,211,41,0.5)"></div>
                                    <div style="background-color: rgba(253,211,41,0.5)"></div>
                                    <div style="background-color: rgba(253,211,41,0.5)"></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </q-card-section>
            </q-card>
        </div>
    </q-dialog>
</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
    name: "captionsDialog",

    props: {
        showDialog: Boolean,
    },

    methods: {
        closeDialog() {
            this.$emit('closeDialog')
        },
    }
});
</script>

<style lang="scss">
@media screen and (max-width: 1368px) {
    .entity-data-card {
        position: sticky;
        overflow-y: auto !important;
    }
}

.tr {
    border:1px solid black;
}

.circle {
    height: 1.1em;
    width: 25px;
    border-radius: 25%;
    margin-left: 5px;
    margin-top: 2px
}

.circle-now {
    height: 1.5em;
    font-size: 0.8em;
    text-align: center;
    color: white;
    width: 40px;
    border-radius: 20%;
    margin-left: 5px;
    margin-top: 2px
}

.wrapper {
    display: grid;
    width: 50px;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-auto-rows: 15px;
}

.wrapper div {
    border: solid 1px;
}

</style>
