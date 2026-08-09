<script setup lang="ts">
import { IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonToast } from '@ionic/vue';
import ContractInputField from '../components/ContractInputField.vue'
import PrimaryButton from '../components/buttons/PrimaryButton.vue'
import { ref, computed } from 'vue';

const basePrice = ref<number>();
const pricePerkWh = ref<number>();
const monthlyInstallment = ref<number>();
const isToastOpen = ref(false);
const toastText = ref('');


const setIsToastOpen = (state: boolean) => {
  isToastOpen.value = state;
};

const isFormValid = computed(() => {
  return (
    basePrice.value !== undefined && basePrice.value > 0 &&
    pricePerkWh.value !== undefined && pricePerkWh.value > 0 &&
    monthlyInstallment.value !== undefined && monthlyInstallment.value > 0
  );
});

function saveContractData(){

 // 1. Prüfung: Ist ein Feld WIRKLICH leer? (0 zählt hier NICHT als leer)
  if (
    basePrice.value === undefined || 
    pricePerkWh.value === undefined || 
    monthlyInstallment.value === undefined
  ) {
    toastText.value = "Bitte fülle alle Felder aus, bevor du die Änderungen speicherst.";
    setIsToastOpen(true);
    return;
  }

  // 2. Prüfung: Ist eine Zahl 0 oder negativ?
  if (basePrice.value <= 0 || pricePerkWh.value <= 0 || monthlyInstallment.value <= 0) {
    toastText.value = "Bitte gib nur Zahlen größer als 0 ein.";
    setIsToastOpen(true);
    return;
  }

  

  console.log('Base Price:', basePrice.value);
  console.log('Price per kWh:', pricePerkWh.value);
  console.log('Monthly Installment:', monthlyInstallment.value);
}
</script>

<template>

<ion-page>
  <ion-header>
    <ion-toolbar>
      <ion-title>Header</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content :fullscreen="true" class="ion-padding">

    <ion-toast
  :is-open="isToastOpen"
  :message="toastText"
  :duration="3500"
  @didDismiss="setIsToastOpen(false)"
  position="bottom" 
  color="danger"
  
></ion-toast>

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

  <ion-footer>
    <ion-toolbar class="ion-text-center">
      <PrimaryButton @click="saveContractData"
        :color="!isFormValid ? 'medium' : 'primary'"
        text = "Änderungen speichern"
      />
    </ion-toolbar>  
  </ion-footer>
</ion-page>
</template>

<style scoped>
  .activePossible {
    --background: #f0f0f0;
  }
</style>