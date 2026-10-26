<script setup lang="ts">
import { IonPage, IonCard, IonCardContent, IonCardHeader, IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonToast, IonDatetime } from '@ionic/vue';
import ContractInputField from '../components/ContractInputField.vue'
import PrimaryButton from '../components/buttons/PrimaryButton.vue'
import { ref, computed, onMounted } from 'vue';
import type { IAppData } from '../models/IAppData.ts';
import { informationCircle } from 'ionicons/icons';
import { star } from 'ionicons/icons';

const basePrice = ref<number>();
const pricePerkWh = ref<number>();
const monthlyInstallment = ref<number>();
const isToastOpen = ref(false);
const toastText = ref('');
const savedContractData = ref<IAppData>();
const startReadingInput = ref<number>();
const startDateInput = ref<string>();


const setIsToastOpen = (state: boolean) => {
  isToastOpen.value = state;
};

const isFormValid = computed(() => {
  return (
    basePrice.value !== undefined && basePrice.value > 0 &&
    pricePerkWh.value !== undefined && pricePerkWh.value > 0 &&
    monthlyInstallment.value !== undefined && monthlyInstallment.value > 0 &&
    startReadingInput.value !== undefined && startReadingInput.value >0
  );
});

//last Period = Ziel ist es das letzte Objekt von billing Period in einer Variable zu speichern
// zukunftssicher für mehrere Perioden zu machen (MVP-Workaround). Da theoretisch noch nicht nötig 
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
    startReadingInput.value = lastPeriod.value?.startReading;
    monthlyInstallment.value = lastAdvancePayment.value?.grossAmount;
    startDateInput.value = lastPeriod.value?.startDate;
    
  }

  else{
    basePrice.value = undefined;
    pricePerkWh.value = undefined;
    startReadingInput.value = undefined;
    monthlyInstallment.value = undefined;
    startDateInput.value = undefined;
  }

});

function saveContractData(){

  let endDateString = '';
  let startDateString = '';

 // 1. Prüfung: Ist ein Feld WIRKLICH leer? (0 zählt hier NICHT als leer)
  if (
    basePrice.value === undefined || 
    pricePerkWh.value === undefined || 
    monthlyInstallment.value === undefined ||
    !startDateInput.value
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

  // 3. Prüfung: Liegt das Start-Datum in der Zukunft?
  if (startDateInput.value) {
    // Schneide die Uhrzeit ab, damit nur "YYYY-MM-DD" übrig bleibt
    const selectedDateOnly = startDateInput.value.split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    if (selectedDateOnly > today) {
      toastText.value = "Das Start-Datum darf nicht in der Zukunft liegen.";
      setIsToastOpen(true);
      return;
    }
    else {
    // 1. Aus dem Start-Datum ein echtes Date-Objekt machen
    const startDate = new Date(startDateInput.value);

    // 2. Genau 1 Jahr aufaddieren
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    endDate.setDate(endDate.getDate() - 1); // Typisch bei Verträgen: 1 Jahr minus 1 Tag

    // 3. Wieder als sauberen ISO-String (oder nur den Datumsteil) für die Speicherung umwandeln
    endDateString = endDate.toISOString().split('T')[0];
    startDateString = startDate.toISOString().split('T')[0];

    console.log("Berechnetes Enddatum:", endDateString);
  }
  }
// wenn alles passt -> speichern.
// zu speichern: 
    // IBillingPeriod : grossBasePrice 
    //                  grossConsumtionPrice
    //                  startReading
    //IAdvancePayment : grossAmount 
savedContractData.value = {
  ...(savedContractData.value ?? {
    advancePayment: [],
    billingPeriod: [],
    meterReading: [],
  }),
  billingPeriod: [
    {
      grossBasePrice: Number(basePrice.value),
      grossConsumptionPrice: Number(pricePerkWh.value),
      startReading: Math.round(Number(startReadingInput.value)) || 0,
      startDate: startDateString,
      endDate: endDateString
    },
  ],
  advancePayment:[{
    grossAmount : Number(monthlyInstallment.value),
    },  
  ],

 
};

localStorage.setItem('AppData', JSON.stringify(savedContractData.value));
console.log("Gespeichert:", savedContractData.value);
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
                    unittext="€"
                    /> 

        <ContractInputField 
                    title="Preis pro kWh"
                    v-model="pricePerkWh"
                    placeholderValue="0.34"
                    text="Bitte den Preis pro kWh hinterlegen"
                    unittext="€"
                    step-value="0.01"
                    /> 
        
        <ContractInputField 
                    title="Monatlicher Abschlag"
                    v-model="monthlyInstallment"
                    placeholderValue="40"
                    text="Bitte den monatlichen Abschlag hinterlegen"
                    unittext="€"
                    /> 
      
        <ContractInputField 
                    title="Zählerstand bei Turnusbeginn"
                    v-model="startReadingInput"
                    placeholderValue="4020"
                    text="Bitte den Zählerstand bei Turnusbeginn hinterlegen"
                     unittext="kWh"
                    />            
        
        <ion-card>
          
          <ion-card-header>
            <ion-card-title>Turnusbeginn </ion-card-title>
          </ion-card-header>
          
          <ion-card-content class="content" >
            <ion-item lines="none" class="item">      
              <ion-datetime-button class="date-button" datetime = "datetime" 
                :class="{ 'has-date': startDateInput, 'empty-date': !startDateInput }">
              </ion-datetime-button>       
              <ion-icon class="icon" slot="end" :icon="informationCircle"></ion-icon>
            
            </ion-item>
            <p class="text" v-show="!startDateInput || startDateInput === '0'">Bitte den Turnusbeginn hinterlegen</p>
            <ion-modal :keep-contents-mounted = "true">
              <IonDatetime id="datetime" v-model="startDateInput" presentation="date" size="cover"></IonDatetime>
            </ion-modal>
          </ion-card-content>

        </ion-card>  
      
            
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

.content {
  margin: -8px;
}

.icon {
  margin: 16px;
}

.text {
  margin: 8px
}

/* Falls du über eine Klasse den Platzhalter steuern willst: */
.empty-date::part(native) {
  color: #92949c; /* Das Ausgegraute */
}

.has-date::part(native) {
  color: #000000; /* Das Schwarz wenn gewählt */
}
</style>