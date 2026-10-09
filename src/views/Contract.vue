<script setup lang="ts">
import { IonPage, IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonToast } from '@ionic/vue';
import ContractInputField from '../components/ContractInputField.vue'
import PrimaryButton from '../components/buttons/PrimaryButton.vue'
import { ref, computed, onMounted } from 'vue';
import type { IAppData } from '../models/IAppData.ts';

const basePrice = ref<number>();
const pricePerkWh = ref<number>();
const monthlyInstallment = ref<number>();
const isToastOpen = ref(false);
const toastText = ref('');
const savedContractData = ref<IAppData>();


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

//last Period = Ziel ist es das letzte Objekt von billing Period in einer Variable zu speichern.
const lastPeriod = computed(() => {
  const periods = savedContractData.value?.billingPeriod; // holt Billingperiods
  return periods && periods.length > 0 ? periods[periods.length - 1] : undefined; 
  // periods && periods.length > 0 : -> sind Datenvorhanden 
  // Daten vorhanden -> periods[periods.length - 1] (das letzte gepeischerte BillingPeriod Objekt)
  // Daten nicht vorhanden -> : undefined 
});

//lastAdvancePayment = hat das gleiche Ziel wie last Period bloß für die monatliche Buchung 
const lastAdvancePayment = computed(() => {
  const payments = savedContractData.value?.advancePayment; 
  return payments && payments.length > 0 ? payments[payments.length -1] : undefined;
});

// isDirty = Ziel : sind die vom Nutzer eingebenen Werte gleich der letzen eingetragenen Werte ?
const isDirty = computed(() => {
  return (
    basePrice.value !== lastPeriod.value?.grossBasePrice ||
    pricePerkWh.value !== lastPeriod.value?.grossConsumptionPrice || 
    monthlyInstallment.value !== lastAdvancePayment.value?.grossAmount
  );
});


//canSave = Ziel: wenn isFormValid & isDirty erfüllt dann kann der Nutzer seine Werte speichern 
const canSave = computed(() => isFormValid.value && isDirty.value);


// beim rendern der Seite wird geprüft ob bereits Werte vorhanden sind. 
onMounted (() => { 

  const storedData = localStorage.getItem('AppData');

  if(storedData) {
    const parsedData = JSON.parse(storedData); // JSON.parse wandelt einen JSON-String in ein JavaScript-Objekt um

    savedContractData.value = parsedData; 

    basePrice.value = lastPeriod.value?.grossBasePrice;
    pricePerkWh.value = lastPeriod.value?.grossConsumptionPrice;
    monthlyInstallment.value = lastAdvancePayment.value?.grossAmount;
  }

  else{
    basePrice.value = undefined;
    pricePerkWh.value = undefined;
    monthlyInstallment.value = undefined;
  }
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

  //wenn alles passt neue Objekte bauen.
  // Period
  const newPeriod = {
    grossBasePrice: Number(basePrice.value),
    grossConsumptionPrice: Number(pricePerkWh.value),
  };

  const newPayment = {
    grossAmount: Number(monthlyInstallment.value),
  };

  savedContractData.value = {
  ...savedContractData.value, // 1. Alle anderen Eigenschaften des Ober-Objekts behalten
  
  billingPeriod: [
  ...(savedContractData.value?.billingPeriod ?? []), // <- Komma hier!
  newPeriod
],

advancePayment: [
  ...(savedContractData.value?.advancePayment ?? []), // <- Schließende Klammer + Komma!
  newPayment
],
meterReading: savedContractData.value?.meterReading ?? [],
};

// 1. Objekt in JSON-String umwandeln
const appDataJson = JSON.stringify(savedContractData.value);

// 2. Im localStorage unter 'AppData' speichern
localStorage.setItem('AppData', appDataJson);
console.log(savedContractData.value);

console.log("LocalStorage AppData:", JSON.parse(localStorage.getItem('AppData') || '{}'));

console.log("Aktuelle AppData:", JSON.parse(JSON.stringify(savedContractData.value)));
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
        :color=" !canSave ? 'medium' : 'primary'"
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