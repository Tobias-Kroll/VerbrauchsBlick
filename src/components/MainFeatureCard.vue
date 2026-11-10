<script setup lang="ts">
 import { IonText, IonLabel, IonGrid, IonRow, IonCol } from '@ionic/vue';
 import { logoEuro, flash, ellipse } from 'ionicons/icons';
 import { computed, onMounted, ref } from 'vue';
 import type { IAppData } from '../models/IAppData';


const props = defineProps<{
  appData: IAppData;
}>();

//benötigte Variablen ziehen.

const lastReadingArray = computed(() => {
  const readings = props.appData?.meterReading;
  return readings && readings.length > 0 ? readings[readings.length - 1] : null;
});

const startReading = computed(() => {
  return props.appData?.billingPeriod?.[0]?.startReading ?? 0;
});

const basePrice = computed(() => {
    return props.appData?.billingPeriod?.[0]?.grossBasePrice ?? 0;
});

const consumerPrice = computed (() => {
    return props.appData?.billingPeriod?.[0]?.grossConsumptionPrice ?? 0;
});

const Discount = computed (() => {
    return props.appData?.advancePayment?.[0]?.grossAmount ?? 0;
});

const startDate = computed(() => {
    console.log("Inkommende appData in der Karte:", props.appData);
    // Wenn appData oder billingPeriod noch nicht da sind, gib einen leeren String zurück
    if (!props.appData?.billingPeriod || props.appData.billingPeriod.length === 0) {
        return '';
    }
    return props.appData.billingPeriod[0].startDate ?? '';
});
console.log("hallo:", startDate.value);

const endDate = computed (() => {
    return props.appData?.billingPeriod?.[0]?.endDate ?? 0;
});

const lastReading = computed(() => {
    return lastReadingArray.value?.readingValue ?? 0;
});

const lastReadingDate = computed(() => {
     return lastReadingArray.value?.readingDate;
});

//Berechnungen 
const totalConsumption = computed(() => {
    if (!lastReading.value) return 0;
  return lastReading.value - startReading.value;
});

const totalConsumptionPrice = computed(() => {
    if (!lastReading.value) return 0;
    const price = totalConsumption.value * (consumerPrice.value / 100);
  return Number(price.toFixed(2));
})

const elapsedMonths = computed(() => {
    if (!startDate.value || !lastReadingDate.value){ 
    return 1;
    }
  const startYear = Number(startDate.value.substring(0, 4));
  const startMonth = Number(startDate.value.substring(5, 7));

  const readingYear = Number(lastReadingDate.value.substring(0, 4));
  const readingMonth = Number(lastReadingDate.value.substring(5, 7));

  // In absolute Monate umrechnen
  const startTotalMonths = startYear * 12 + startMonth;
  const readingTotalMonths = readingYear * 12 + readingMonth;

  // Reine Differenz
  let months = readingTotalMonths - startTotalMonths +1;
 
    if (months > 12) {
        months = 12;
    }
    return months;

});
const totalGrossBasePrice = computed(() => {
    if (!lastReading.value) return 0;
    const grossPrice = basePrice.value * elapsedMonths.value; 
    return grossPrice;
});

const totalPrice = computed(() => {
    if (!lastReading.value) return 0;
    return totalConsumptionPrice.value + totalGrossBasePrice.value;
});

const totalAdvancePayments = computed(() => {
  if (!lastReading.value) return 0;

  // Begrenze die Monate für den Abschlag auf maximal 11
  let monthsForDiscount = elapsedMonths.value;
  if (monthsForDiscount > 11) {
    monthsForDiscount = 11;
  }

  // Jetzt mit den gedeckelten Monaten rechnen
  return Discount.value * monthsForDiscount;
});

const balance = computed (() => {
    const balanceTotal = (totalPrice.value + totalGrossBasePrice.value ) - totalAdvancePayments.value;
    return Number(balanceTotal.toFixed(2));
});

const isPlus = computed(() => balance.value <= 0);

function debugging() {
  // Alle Variablen sauber einzeln ausgeben:
  console.log("--- Debugging Computed Values ---");
  console.log("Letzter Zählerstand:", lastReading.value);
  console.log("Datum des letzten Zählers:", lastReadingDate.value);
  console.log("Start-Zählerstand:", startReading.value);
  console.log("Grundpreis:", basePrice.value);
  console.log("Verbrauchspreis:", consumerPrice.value);
  console.log("Abschlag (Discount):", Discount.value);
  console.log("Startdatum:", startDate.value);
  console.log("Enddatum:", endDate.value);
  console.log("Tatsächlicher Verbrauch", totalConsumption.value);
  console.log("Tatsächlicher Verbrauch in Euro", totalConsumptionPrice.value);
  console.log("Gesamtkosten", totalPrice.value);
  console.log("Abschläge gezahlt", totalAdvancePayments.value);
  console.log("Differrenz:", balance.value );
}

// Hier wird die Funktion für die Home.vue freigegeben:
defineExpose({
  debugging
});

</script>


<template>
    <ion-card class="styleMainFeature">
    <ion-card-header>
      Stromstatus & Bilanz
    </ion-card-header>

    <ion-card-content class="styleMainFeatureContent">

        <!--Oberste Teil-->
        <ion-grid class="ion-no-padding ion-margin-top">

<!-- Zeile 1: Badge -->
<ion-row class="ion-justify-content-center">
    <ion-col size="12" class="ion-text-center">
        <!-- Punkt-Icon farblich umschalten: success (grün) oder danger (rot) -->
        <ion-icon :icon="ellipse" :color="isPlus ? 'success' : 'danger'"></ion-icon>
        
        <!-- Badge-Inhalt mit v-if / v-else umschalten -->
        <ion-badge :color="isPlus ? 'success' : 'danger'">
            <template v-if="isPlus">Du bist im Plus</template>
            <template v-else>Du bist im Minus</template>
        </ion-badge>
    </ion-col>
</ion-row>

        <!-- Zeile 2: Großer Betrag -->
        <ion-row class="ion-justify-content-center">
            <ion-col size="12" class="ion-text-center">
            <h1 class="amount-value"> {{ isPlus ? '+' : '-' }} {{ balance }} €</h1>
            </ion-col>
        </ion-row>

        <!-- Zeile 3: Label -->
        <ion-row class="ion-justify-content-center">
            <ion-col size="12" class="ion-text-center">
            <ion-label color="medium"> <p>Aktueller Überschuss</p></ion-label>
            </ion-col>
        </ion-row>
        </ion-grid>

    <!--mittlerer Teil-->
    <ion-grid class="ion-no-padding bottom-border-row">
        <!--Gesamtkosten-->
        <ion-row class="ion-justify-content-center">
            <ion-col size="6" class="ion-text-end">
                <ion-text>Gesamtkosten:</ion-text>
            </ion-col>
            <ion-col size="6" class="ion-text-center">
                <ion-text class="ion-margin-end">{{ totalPrice }}</ion-text>
                <ion-icon :icon="logoEuro"></ion-icon>
            </ion-col>
        </ion-row>
         <!--Bisher gezahlt-->
        <ion-row class="ion-justify-content-center">
            <ion-col size="6" class="ion-text-end">
                <ion-text>Bisher gezahlt:</ion-text>
            </ion-col>
            <ion-col size="6" class="ion-text-center">
                <ion-text class="ion-margin-end">{{ totalAdvancePayments }}</ion-text>
                <ion-icon :icon="logoEuro"></ion-icon>
            </ion-col>
        </ion-row>
                <!--Verbrauchter Strom-->
        <ion-row class="ion-justify-content-center">

            <ion-col size="6" class="ion-text-end">
                <ion-text>Verbraucht:</ion-text>
            </ion-col>
            <ion-col size="6" class="ion-text-center">
                <ion-text class="ion-margin-end">{{ totalConsumption }}</ion-text>
                <ion-icon  :icon="flash"></ion-icon>
            </ion-col>
        </ion-row>
    </ion-grid>


      <!-- Haftungsausschluss -->
    <div class="legal-hint">
        <ion-label>
            <p>Hinweis: Alle Rechnungen und Informationen sind ohne Gewähr. Es gilt die offizielle Abrechnung des Stromanbieters.</p>
        </ion-label>
    </div>    
    </ion-card-content>
  </ion-card>
</template>

<style>
.legal-hint {
  border-top: 1px solid #d6e0ea;
  margin-top: 8px;
  margin-left: 16px;
  margin-right: 16px;

}

</style>