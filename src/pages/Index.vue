<template>
    <q-page
        class="flex flex-center"
        :style="!isDarkTheme ? 'background-color: #f0f0f0' : 'background-color: #3D3D3DFF'"
    >

    </q-page>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'PageIndex',

    computed: {
        isDarkTheme() {
            return this.$q.dark.isActive
        }
    }
})
</script>
