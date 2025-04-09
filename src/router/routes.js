import MainLayout from 'layouts/MainLayout.vue';
import Main from 'pages/Main.vue';
import Index from 'pages/Index.vue';
import Teste from 'pages/teste.vue';
import Error404 from 'pages/Error404.vue';

const routes = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {path: '', component: Main},
            {path: '/homepage', component: Index},
            {path: '/teste', component: Teste},
        ]
    },
    {
        path: '/:catchAll(.*)*',
        component: Error404
    }
];

export default routes;
