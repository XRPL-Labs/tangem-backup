<template>
    <Header />
    <div class="vertical-wizard">
        <ul>
            <li v-for="(step, index) in 3" :class="getStepClass(index)" :key="index">
                <a @click="changeIndex(index)">
                    {{ $t(`wizard.step_${step}.header`) }}
                    <fa v-if="index < activeIndex" class="ico ico-green" :icon="['fa', 'check']"></fa>
                    <fa v-if="index > activeIndex" class="ico ico-muted" :icon="['fa', 'lock']"></fa>
                    <span class="desc d-block">
                        {{ $t(`wizard.step_${step}.body`) }}
                        <a @click="next()" v-if="index === activeIndex" class="d-block shadow py-1 btn-block text-white btn btn-lg btn-primary mt-3" :class="{ disabled: busy }">
                            {{ $t(`wizard.step_${step}.button`) }}
                            <fa v-if="!busy" :icon="['fas', 'arrow-right']"/>
                            <Spinner v-else/>
                        </a>
                    </span>
                </a>
            </li>
            <a v-if="finished" @click="close()" class="d-block shadow py-1 btn-block text-white btn btn-lg btn-success mt-3">
                {{ $t('wizard.success') }}
            </a>
        </ul>
        <!-- <Alert v-if="error || msg" type="danger" :msg="msg"/> -->
    </div>
</template>

<script>
import axios from 'redaxios'
import Header from '@/components/Header.vue'
import Spinner from '@/components/Spinner.vue'
import Alert from '@/components/Alert.vue'

export default {
    components: { Header, Spinner, Alert },
    props: ['state'],
    data() {
        return {
            activeIndex: 0,
            busy: false,
            error: false,
            msg: '',
            account: '',
            RegularKey: '',
            finished: false,
        }
    },
    methods: {
        close() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                command: 'close'
            }))
        },
        changeIndex(index) {
            if (this.activeIndex > index) this.activeIndex = index
        },
        getStepClass(index) {
            const obj = {
                current: this.activeIndex === index,
                complete: this.activeIndex > index,
                'prev-step': this.activeIndex === (index - 1),
                locked: this.activeIndex < index
            }
            return obj
        },
        openSignRequest(uuid) {
            if (typeof window.ReactNativeWebView === 'undefined') throw new Error(this.$t('wizard.error.reactNative'))
            window.ReactNativeWebView.postMessage(JSON.stringify({
                command: 'openSignRequest',
                uuid: uuid
            }))
        },
        isResolved() {
            return new Promise((resolve, reject) => {
                function message(event) {
                    window.removeEventListener("message", message)
                    document.removeEventListener("message", message)

                    const data = JSON.parse(event.data)
                    if(data.method !== 'payloadResolved') return reject('')
                    if(data.reason === 'SIGNED') return resolve()
                    else return reject('')
                }
                //iOS
                window.addEventListener('message', message)
                //Android
                document.addEventListener('message', message)
            })
        },
        getWebSocketUrl(nodetype) {
            switch (nodetype) {
                case "MAINNET":
                    return 'wss://xrplcluster.com'
                case "TESTNET":
                    return 'wss://testnet.xrpl-labs.com'
            }
            return 'wss://xrplcluster.com'
        },
        accountInfo(account) {
            const command = {
                id: 666,
                command: "account_info",
                strict: true,
                account: account,
                ledger_index: "current"
            }
            return new Promise((resolve, reject) => {
                const socket = new WebSocket(this.getWebSocketUrl(this.state.nodetype))
                socket.onopen = event => {
                    socket.send(JSON.stringify(command))
                }
                socket.onmessage = msg => {
                    const data = JSON.parse(msg.data)
                    if (data.error) {
                        reject(this.$t(`wizard.error.${data.error}`))
                    }
                    if (data.id == 666) {
                        resolve(data)
                        socket.close()
                    }
                }
                socket.onclose = msg => {
                    reject(msg)
                }
                socket.onerror = e => {
                    reject(e)
                }
            })
        },
        throwError(e) {
            this.error = true
            if (e === '') return
            if (e.status === 403) e = this.$t('wizard.error.403')
            if (e.status === 404) e = this.$t('wizard.error.404')
            this.msg = e
            console.log(e)
            this.$swal({
                icon: 'error',
                title: this.$t('wizard.error.title'),
                text: e
            })
        },
        async next() {
            this.msg = ''
            this.busy = true
            this.error = false

            const headers = { headers: { Authorization: this.state.token, 'x-api-key': this.apikey } }

            switch(this.activeIndex) {
                case 0:
                    try {
                        const payload = {
                            user_token: this.token,
                            txjson: {
                                TransactionType: "SignIn"
                            }
                        }

                        const res = await axios.post(`${this.endpoint}/payload`, payload, headers)
                        this.openSignRequest(res.data.uuid)
                        await this.isResolved()
                        const result = await axios.get(`${this.endpoint}/payload/${res.data.uuid}`, headers)

                        if (result.data.payload.signmethod !== 'TANGEM') throw new Error(this.$t('wizard.error.notTangem'))

                        this.account = result.data.response.account

                        const account_info_response = await this.accountInfo(this.account)
                        this.msg = account_info_response
                        if (account_info_response.result.account_data.RegularKey) { 
                            const lsfDisableMaster = 0x00100000
                            let acct_flags = account_info_response.result.account_data.Flags
                            if ((lsfDisableMaster & acct_flags) === lsfDisableMaster) {
                                console.log("Master key pair is DISABLED")
                                throw new Error(this.$t('wizard.error.dissabledMasterkey'))
                            } else {
                                this.msg = 'Masterkey enabled and already a Regular key: ' + account_info_response.result.account_data.RegularKey
                                const callback = await this.$swal({
                                    title: this.$t('wizard.error.hasRegularKeyTitle'),
                                    text: this.$t('wizard.error.changeRegularKey'),
                                    icon: 'warning',
                                    showCancelButton: true,
                                    // confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: this.$t('wizard.error.cancelAction'),
                                    cancelButtonText: this.$t('wizard.error.confirmChangeRegularKey')
                                })
                                if (callback.isConfirmed) throw ''
                            }
                        }

                    } catch(e) {
                        this.throwError(e)
                    }
                    break
                case 1:
                    try {
                        const payload = {
                            user_token: this.token,
                            txjson: {
                                TransactionType: "SignIn"
                            }
                        }
                        const res = await axios.post(`${this.endpoint}/payload`, payload, headers)
                        this.openSignRequest(res.data.uuid)
                        await this.isResolved()
                        const result = await axios.get(`${this.endpoint}/payload/${res.data.uuid}`, headers)
                        if (result.data.payload.signmethod !== 'TANGEM') throw new Error(this.$t('wizard.error.notTangem'))
                        if (this.account === result.data.response.account) throw new Error(this.$t('wizard.error.equalAccounts'))
                        this.RegularKey = result.data.response.account
                    } catch(e) {
                        this.throwError(e)
                    }
                    break
                case 2:
                    try {
                        const payload = {
                            user_token: this.token,
                            txjson: {
                                TransactionType: "SetRegularKey",
                                Account: this.account,
                                RegularKey: this.RegularKey
                            }
                        }
                        const res = await axios.post(`${this.endpoint}/payload`, payload, headers)
                        this.openSignRequest(res.data.uuid)
                        await this.isResolved()
                        const result = await axios.get(`${this.endpoint}/payload/${res.data.uuid}`, headers)
                        if (result.data.response.dispatched_result !== 'tesSUCCESS') throw new Error(this.$t(`wizard.error.${result.data.response.dispatched_result}`))
                        this.msg = this.$t('wizard.success')
                        this.finished = true
                        this.$swal({
                            icon: 'info',
                            title: this.$t('wizard.info.title'),
                            text: this.$t('wizard.info.text')
                        })
                    } catch (e) {
                        this.throwError(e)
                    }
                    break
            }
            this.busy = false
            if (this.error) return null
            this.activeIndex ++
        }
    }
}
</script>
