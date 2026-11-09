<script setup lang="ts">
import { IonPage, IonCard, IonCardContent, IonCardHeader, IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonToast, IonDatetime, IonAlert } from '@ionic/vue';
import ContractInputField from '../components/ContractInputField.vue'
import { ref, computed, onMounted } from 'vue';
import type { IAppData } from '../models/IAppData.ts';
import { informationCircle } from 'ionicons/icons';


const basePrice = ref<number>();
const pricePerkWh = ref<number>();
const monthlyInstallment = ref<number>();
const isToastOpen = ref(false);
const toastText = ref('');
const savedContractData = ref<IAppData>();
const startReadingInput = ref<number>();
const startDateInput = ref<string>();

const alertRef = ref();
const alertButtons = ['Verstanden'];

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

// isDirty = Ziel : sind die vom Nutzer eingebenen Werte gleich der letzen eingetragenen Werte ?
const isDirty = computed(() => {
  return (
    Number(basePrice.value) !== Number(lastPeriod.value?.grossBasePrice) ||
    Number(pricePerkWh.value) !== Number(lastPeriod.value?.grossConsumptionPrice) || 
    Number(monthlyInstallment.value) !== Number(lastAdvancePayment.value?.grossAmount) ||
    Number(startReadingInput.value) !== Number(lastPeriod.value?.startReading) ||
    (startDateInput.value ? startDateInput.value.split('T')[0] : '') !== (lastPeriod.value?.startDate ? lastPeriod.value.startDate.split('T')[0] : '')
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
    startReadingInput.value = undefined;
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
      <ion-title>Vertragsübersicht</ion-title>
  </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">

    <ion-toast
  :is-open="isToastOpen"
  :message="toastText"
  :duration="3500"
  @didDismiss="setIsToastOpen(false)"
  position="bottom" 
  color="danger"
  
></ion-toast>

      <ion-card>
        <ion-card-header>
          <ion-text>Preisangaben</ion-text>  
        </ion-card-header>
        
        <ion-card-content>
        <ContractInputField 
                    title="Monatlicher Grundpreis"
                    v-model="basePrice"
                    placeholderValue="8"
                    text="Bitte Grundpreis hinterlegen"
                    unittext="€"
                    info-title="Grundpreis (monatlich)"
                    info-text="Der Grundpreis ist ein fester Monatsbetrag, der unabhängig von deinem Verbrauch anfällt. Zusammen mit den Verbrauchskosten ergibt er deine Gesamtrechnung.

                    Du findest ihn in der Regel in deiner Jahresabrechnung, im Vertrag oder im Kundenportal. 

                    Hinweis: Steht dort nur ein Jahresbetrag? Teile diesen einfach durch 12, um den monatlichen Wert zu erhalten."
                    /> 

        <ContractInputField 
                    title="Preis pro kWh"
                    v-model="pricePerkWh"
                    placeholderValue="34,78"
                    text="Bitte den Preis pro kWh hinterlegen"
                    unittext="ct"
                    step-value="0.01"
                    info-title="Preis pro kWh"
                    info-text="Der Preis pro kWh (auch Arbeitspreis genannt) ist der Betrag, den du für jede tatsächlich verbrauchte Kilowattstunde Strom bezahlst. 

Du findest ihn in der Regel auf deiner Jahresabrechnung bei der Verbrauchsaufstellung oder in deiner Vertragsbestätigung (angegeben z. B. in „ct/kWh“ oder „€/kWh“).

Hinweis: Preisangabe in Cent"
                    /> 

        <ContractInputField 
                    title="Monatlicher Abschlag"
                    v-model="monthlyInstallment"
                    placeholderValue="40"
                    text="Bitte den monatlichen Abschlag hinterlegen"
                    unittext="€"
                    info-title="Monatlicher Abschlag"
                    info-text="Der monatliche Abschlag ist die Vorauszahlung, die du jeden Monat an deinen Energieversorger leistest. Am Ende des Abrechnungsjahres wird dein tatsächlicher Verbrauch mit diesen Zahlungen verrechnet.

Du findest ihn in der Regel auf deiner Jahresabrechnung im Abschnitt zu den Abschlägen oder in deinem Online-Kundenportal.

Trag hier einfach den monatlichen Betrag in Euro ein, den du aktuell an deinen Anbieter zahlst (z. B. 56,00€)."
                    /> 
                    </ion-card-content>                    
        </ion-card>

    <ion-text color="danger">Bitte gib alle Beträge als Bruttopreise an. Damit die gesetzliche MwSt. in den Berechnungen enthalten ist.</ion-text>
        <ion-card>
        <ion-card-header>
          <ion-text>Turnusdetails</ion-text>  
        </ion-card-header>
        <ion-card-content>
        <ContractInputField 
                    title="Zählerstand bei Turnusbeginn"
                    v-model="startReadingInput"
                    placeholderValue="4020"
                    text="Bitte den Zählerstand bei Turnusbeginn hinterlegen"
                     unittext="kWh"
                     info-title="Zählerstand bei Turnusbeginn"
                     info-text="Der Zählerstand bei Turnusbeginn bezeichnet den Stand deines Stromzählers zu Beginn des neuen Abrechnungszeitraums (des sogenannten Turnus).

Du findest ihn in der Regel auf deiner letzten Jahresabrechnung oder im Online-Kundenportal.

Hinweis: Dieser Startzählerstand ist im Regelfall exakt der Endzählerstand aus deinem letzten Abrechnungsjahr."
                    />            

               
              <ion-grid>
                <ion-label>Turnusstart</ion-label>
              <ion-row class="ion-align-items-center">  
                <ion-col size="5">
                  <ion-datetime-button class="date-button" datetime = "datetime" 
                    :class="{ 'has-date': startDateInput, 'empty-date': !startDateInput }">
                <p class="text" v-show="!startDateInput || startDateInput === '0'">Bitte den Turnusbeginn hinterlegen</p>
                <ion-modal :keep-contents-mounted = "true">
                  <IonDatetime id="datetime" v-model="startDateInput" presentation="date" size="cover"></IonDatetime>
                </ion-modal>                    
                  </ion-datetime-button>                    
                </ion-col>
                <ion-col>
                  <ion-button  fill="clear" class="ion-no-padding ion-no-margin info-Button" @click="alertRef.$el.present()">
                    <ion-icon class="icon ion-no-margin" slot="end" :icon="informationCircle"></ion-icon>
                  </ion-button> 

                  <ion-alert
                    ref="alertRef"
                    header="Turnusbeginn"
                    message=" Der Turnusbeginn ist das Startdatum deines aktuellen Abrechnungszeitraums – also der Tag, ab dem dein neues Abrechnungsjahr läuft (in der Regel genau ein Jahr minus ein Tag).

    Du findest dieses Datum meist auf deiner letzten Jahresabrechnung unter „Abrechnungszeitraum“ oder in deinem Vertrag.

    Hinweis: Das ist meist der Tag direkt nach dem Ende deines vorherigen Abrechnungszeitraums. Lief dein letztes Abrechnungsjahr beispielsweise vom 12.07.2025 bis 11.07.2026, beginnt dein neuer Turnus am 12.07.2026 und endet am 11.07.2027."
                    :buttons="alertButtons"
                  ></ion-alert>
                </ion-col>
              </ion-row>
          </ion-grid>
          </ion-card-content>
        </ion-card>  
      


  <ion-button class="customButtonContract"
    @click="saveContractData"
    :disabled="!canSave">
    Änderungen speichern
  </ion-button>


  </ion-content>
</ion-page>
</template>

<style scoped>
  .activePossible {
    --background: #f0f0f0;
  }


.content {
  margin: -8px;
}



.text {
  margin: 8px
}

.empty-date::part(native) {
  color: #92949c; /* Das Ausgegraute */
}

.has-date::part(native) {
  color: #000000; 
}


</style>