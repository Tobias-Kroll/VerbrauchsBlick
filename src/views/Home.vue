<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle } from '@ionic/vue';
import { pencilSharp, informationCircle } from 'ionicons/icons'
import { computed, ref, onMounted } from 'vue';
import type { IAppData } from '../models/IAppData';

const readingInput = ref<number>();
const readingValueOutput =ref<number>(); //lertzter Zählstand
const readingDateOutput =ref<string>(); //letztes erfasstes Datum 

//Speicher variable
const homeSavedData = ref<IAppData>();

//lastReading -> 
const lastReading = computed (() => {
    const readings = homeSavedData.value?.meterReading;
    return readings && readings.length > 0 ? readings[readings.length-1] : undefined;
});
//startReading ->
const startReading = computed (() => {
    const starts = homeSavedData.value?.billingPeriod;
    return starts && starts.length > 0 ? starts[starts.length-1] : undefined;

});
    
//Beim Seite laden:
onMounted(() => {
  const storedData = localStorage.getItem('AppData');

  if(storedData) {
    const parsedData = JSON.parse(storedData) ; // JSON.parse wandelt einen JSON-String in ein JavaScript-Objekt um

    homeSavedData.value = parsedData; 

    if(lastReading.value?.readingValue && lastReading.value?.readingDate){
        readingValueOutput.value = lastReading.value?.readingValue;
        readingDateOutput.value = lastReading.value?.readingDate;
    }
    else {
        readingValueOutput.value = startReading.value?.startReading;
        readingDateOutput.value = startReading.value?.startDate;

    }
  }
  else{
    readingValueOutput.value = undefined;
    readingDateOutput.value = undefined;
  }
});

//------Vallidierung:--------

const disabled = computed (() => {
    return(false);
})

</script>

<template> 

    <IonPage>

        <ion-header>
                <ion-toolbar class="ion-text-center">
                    <ion-title> Verbrauchsblick </ion-title>
                </ion-toolbar>
        </ion-header>

        <ion-content>
        <!--Hauptfeature-->
            <ion-card color="medium">
                <ion-card-header> Hauptfeature </ion-card-header>
                    
                <ion-card-content>cooming soon...</ion-card-content>
            </ion-card>


        <!--Meterreadings-->
            <ion-card color="primary" class="ion-text-center">
                <!--Header: letzter Zählerstand-->
                <ion-card-header class = "lastreading">
                  <ion-text>{{ readingValueOutput }} </ion-text>
                  <ion-text>{{ readingDateOutput }}</ion-text>
            </ion-card-header>

            <ion-card-content>
                <!--Content: neuster Zählerstand-->
                    <ion-item color="primary" class="custom-box">
                        <ion-label position="stacked" class="ion-text-center">
                            Neuer Zählerstand
                        </ion-label>
                        <ion-input 
                        type="number" 
                        placeholder="42XX kWh"
                        v-model="readingInput"
                        >
                            <ion-button fill="clear" slot="end">
                                <ion-icon class="" :icon="informationCircle" slot="end"></ion-icon>
                            </ion-button>
                            </ion-input>
                        
                    </ion-item>
                    <ion-button expand="block" size="default" class="custom-button" :disabled="true"  color="light">
                                Stand jetzt speichern
                    </ion-button>
            </ion-card-content>

            </ion-card>

        </ion-content>

        <ion-footer>

        </ion-footer>

    </IonPage>
</template>

<style scoped>
ion-card-header.lastreading {
    border-bottom: 1px solid #000000;
}

.custom-box {
    margin: 0 0;
}

.custom-button {
    margin: 1rem 16px;
    --border-radius: 0.4rem;
}

ion-input{
    --background: #FFFFFF;
    --color: #000000;
    --placeholder-color: #666666; 
    --placeholder-opacity: 1;
    margin-top: 0.6rem;   
    margin-left: 0;        
    text-align: center;
    --padding-start: 5.5rem; 
    --padding-end: 0.5rem;
}

ion-icon {
    padding-right: 0.5rem;
    font-size: 1.5rem;
}
</style>