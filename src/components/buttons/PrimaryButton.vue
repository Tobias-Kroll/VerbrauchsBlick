<script setup lang="ts">
import { IonButton } from '@ionic/vue';

defineProps<{
    text: string 
}>()
</script>

<template>
    <ion-button 
        class="ion-padding">

            {{ text }}
    
        </ion-button>

</template>

<style>

</style>