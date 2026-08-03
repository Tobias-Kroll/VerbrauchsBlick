<script setup lang="ts">
import { IonPage, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/vue';
import ContractInputField from '../components/ContractInputField.vue'
import { ref } from 'vue';

const basePrice = ref<number>();
const pricePerkWh = ref<number>();
const monthlyInstallment = ref<number>();
</script>

<template>

<ion-page>
  <ion-header>
    <ion-toolbar>
      <ion-title>Header</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content :fullscreen="true" class="ion-padding">
    <IonTitle> Vertragsübersicht</IonTitle>
    
      
        <ContractInputField 
                    title="Grundpreis (monatlich)"
                    v-model="basePrice"
                    placeholderValue="8"
                    text="Bitte Grundpreis hinterlegen"
                    /> 

        <ContractInputField 
                    title="Preis pro kWh"
                    v-model="pricePerkWh"
                    placeholderValue="0.34"
                    text="Bitte den Preis pro kWh hinterlegen"
                    /> 
        
        <ContractInputField 
                    title="Monatlicher Abschlag"
                    v-model="monthlyInstallment"
                    placeholderValue="40"
                    text="Bitte den monatlichen Abschlag hinterlegen"
                    /> 
            
    <ion-text color="danger">Bitte gib alle Beträge als Bruttopreise an. Die gesetzliche Mehrwertsteuer ist somit in den Berechnungen bereits enthalten.</ion-text>

  </ion-content>
</ion-page>
</template>