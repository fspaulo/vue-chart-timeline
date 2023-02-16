import {store} from 'quasar/wrappers'
import {createStore} from 'vuex'

import toolbar from './toolbar'

import VuexPersist from 'vuex-persist'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

const vuexPersist = new VuexPersist({
    key: 'tasks',
    storage: window.localStorage
})

export default store(function (/* { ssrContext } */) {
    const Store = createStore({
        modules: {
            toolbar
        },

        plugins: [vuexPersist.plugin], //Persist state on browser 'session storage'


        // enable strict mode (adds overhead!)
        // for dev mode and --debug builds only
        strict: process.env.DEBUGGING
    })

    return Store
})
