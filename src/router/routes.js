const routes = [
    {
        path: '/',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {path: '', component: () => import('pages/Main.vue')},
            {
                path: '/homepage',
                component: () => import("pages/Index.vue")
            },

            {
                path: '/teste',
                component: () => import("pages/teste.vue")
            },
        ]
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        component: () => import('pages/Error404.vue')
    }
]

export default routes
