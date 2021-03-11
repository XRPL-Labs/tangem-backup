<template>
    <div class="alert" :class="`alert-${type}`" role="alert">
        {{ msg }}
    </div>
</template>

<script>
// Types: primary, secondary, success, danger, warning, info, light, dark

export default {
    props: {
        msg: String,
        type: String
    }
}
</script>