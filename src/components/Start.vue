<template>
    <Header />
    <div class="overflow-auto">
        <div>
            <p>{{ $t("start.description") }}</p>
        </div>
        <div class="my-3 text-center h4">
            <Illustration />
        </div>
        <div class="shadow-sm mt-3 alert alert-primary px-3 py-2">
            {{ $t("start.list_header") }}
            <ol class="mb-0 pb-0 mt-1 ml-0 pl-4">
                <li>{{ $t("start.list_item_1") }}</li>
                <li>{{ $t("start.list_item_2") }}</li>
                <li>{{ $t("start.list_item_3") }}</li>
            </ol>
        </div>
        <div class="mt-4 text-center">
            <a v-if="ready" @click.prevent="next()" class="shadow text-white btn btn-lg btn-primary btn-block" >
                {{ $t("start.button") }}
                <fa :icon="['fas', 'arrow-right']"/>
            </a>
            <a v-else-if="busy" class="shadow text-white btn btn-lg btn-primary btn-block disabled" >
                <Spinner />
            </a>
            <a v-else-if="error" class="shadow text-white btn btn-lg btn-primary btn-block" @click="getTokenData()">
                {{ $t("start.try_again") }}
                <fa :icon="['fas', 'arrow-right']"/>
            </a>
        </div>
        <div style="margin-top: 10px">
            <Alert v-if="error" type="danger" :msg="error"/>
        </div>
    </div>
</template>

<script>
import axios from 'redaxios'
import Header from '@/components/Header.vue'
import Illustration from '@/components/Illustration.vue'
import Spinner from '@/components/Spinner.vue'
import Alert from '@/components/Alert.vue'

export default {
    components: { Header, Illustration, Spinner, Alert },
    data() {
        return {
            ott: Object,
            busy: true,
            ready: false,
            data: '',
            error: ''
        }
    },
    async mounted() {
        await this.getTokenData()
    },
    methods: {
        async getTokenData () {
            try {
                const res = await axios({
                    method: 'get',
                    url: `${this.endpoint}/xapp/ott/${this.token}`,
                    headers: { 'x-api-key': this.apikey }
                })
                this.data = res.data
                this.ready = true
                this.error = false
            } catch(e) {
                console.error(e)
                this.error = this.$t('start.error')
            }
            this.busy = false
        },
        next() {
            window.history.pushState('this.data', 'state', '/wizard')
            const popStateEvent = new PopStateEvent('popstate', { state: this.data })
            dispatchEvent(popStateEvent)
        }
    }
}
</script>
