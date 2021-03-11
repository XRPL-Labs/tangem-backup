<template>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <div class="xapps-wrapper">
        <div class="container pt-2">
            <keep-alive>
                <component :state="state" :is="currentComponent" />
            </keep-alive>
        </div>
    </div>
</template>

<script>
import Start from './components/Start.vue'
import Wizard from './components/Wizard.vue'

const routes = {
    '/': Start,
    '/wizard': Wizard
}

export default {
    name: 'App',
    components: {
        Start,
        Wizard
    },
    data() {
        return {
            currentRoute: '/',
            state: {}
        }
    },
    computed: {
        currentComponent() {
            // Todo 404?
            return routes[this.currentRoute] || Start
        }
    },
    mounted() {
        window.addEventListener('popstate', (event) => {
            this.currentRoute = window.location.pathname
            this.state = event.state
            console.log("location: " + document.location + ", state: " + JSON.stringify(event.state))
        })
    }
}
</script>

<style>
@import url('https://use.typekit.net/iqo4nny.css');

#app {
    font-family: proxima-nova, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
    overflow-y: auto;
}
.swal2-container.swal2-backdrop-show,
.swal2-container.swal2-noanimation {
    background: rgba(255,255,255,.4) !important;
}
.swal2-popup {
    box-shadow: 2px 2px 11px rgba(0,0,0,0.3) !important;
    border-radius: 10px !important;
}
</style>
