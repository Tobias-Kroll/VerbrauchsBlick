<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonInput, IonToast, IonContent, IonItem, IonLabel } from '@ionic/vue';
import { trashOutline, informationCircle } from 'ionicons/icons'
import { computed, ref, onMounted } from 'vue';
import type { IAppData } from '../models/IAppData';



const readingInput = ref<number>();
const readingValueOutput =ref<number>(); //lertzter Zählstand
const readingDateOutput =ref<string>(); //letztes erfasstes Datum 

//Speicher variable
    const homeSavedData = ref<IAppData>({
    advancePayment: [],
    billingPeriod: [],
    meterReading: []
});

//Toast
const toastText = ref('');
const isToastOpen = ref(false);

const setIsToastOpen = (state: boolean) => {
    isToastOpen.value = state;
};


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

const formatDateGerman = (readingDateOutput? :string) => {
    if(!readingDateOutput){
        return('');
    }
    else {
        return new Date(readingDateOutput).toLocaleDateString('de-DE');
    }
};

function saveNewReading(){
    console.log("Aktueller Input-Wert:", readingInput.value);

    // 1. Prüfen, ob das Feld komplett leer ist (fängt undefined, null und "" ab)
    if (!readingInput.value) {
        console.log("Fehler: Feld ist leer!");
        toastText.value = "Trage einen Zählerstand ein";
        isToastOpen.value = true; // Direkt auf true setzen reicht völlig aus!
        return;
    }
    
    // 2. Prüfen, ob der Wert kleiner oder gleich dem letzten Stand ist

    if (readingInput.value <= (readingValueOutput.value ?? 0) || readingInput.value <= (startReading.value?.startReading ?? 0)) {
        console.log("Fehler: Wert zu niedrig!");
        toastText.value = "Dein neuer Zählerstand kann nicht gleich oder kleiner deines letzten erfassten Zählerstandes sein";
        isToastOpen.value = true;
        return;
    }
    
    homeSavedData.value.meterReading.push({
    readingValue: Number(readingInput.value),
    readingDate: new Date().toISOString().split('T')[0],
})


console.log(homeSavedData.value.meterReading);

localStorage.setItem('AppData', JSON.stringify(homeSavedData.value));
console.log("Gespeichert:", homeSavedData.value);

readingValueOutput.value = Number(readingInput.value);
readingDateOutput.value = new Date().toISOString().split('T')[0];
readingInput.value = undefined;


};

function deleteLastReading () {
    if (homeSavedData.value.meterReading.length === 0){
        console.log("kein Löschen möglich");
        toastText.value="du kannst deinen start Zählerstand nicht löschen, sondern nur in der Vertragsseite ändern";
        isToastOpen.value =true;
        return;
    }
    
    homeSavedData.value.meterReading.pop();
    localStorage.setItem('AppData', JSON.stringify(homeSavedData.value));
    console.log("Eintrag gelöscht. Verbleibend:", homeSavedData.value.meterReading);    

    if (homeSavedData.value.meterReading.length > 0) {
        // Es gibt noch weitere Einträge -> Zeige den neuen letzten Wert an
        readingValueOutput.value = lastReading.value?.readingValue;
        readingDateOutput.value = lastReading.value?.readingDate;
    } else {
        // Array ist jetzt leer -> Fallback auf den Start-Zählerstand
        readingValueOutput.value = startReading.value?.startReading;
        readingDateOutput.value = startReading.value?.startDate;
    }
};

//------Vallidierung:--------



</script>

<template> 

    <IonPage>

        <ion-header>
                <ion-toolbar class="ion-text-center">
                    <ion-title> Verbrauchsblick </ion-title>
                </ion-toolbar>
        </ion-header>

        <ion-content>
            <ion-toast
                :is-open="isToastOpen"
                :message="toastText"
                :duration="3500"
                @didDismiss="setIsToastOpen(false)"
                position="bottom" 
                color="danger"></ion-toast>
        <!--Hauptfeature-->
            <ion-card color="medium">
                <ion-card-header> Hauptfeature </ion-card-header>
                    
                <ion-card-content>cooming soon...</ion-card-content>
            </ion-card>


        <!--Meterreadings-->
            <ion-card color="primary" class="ion-text-center">
                <!--Header: letzter Zählerstand-->
                <ion-card-header class = "lastreading">       
                    <ion-grid class="ion-no-padding ion-no-margin">          
                       <ion-row style="margin-bottom: 12px">
                            <ion-col >
                            <ion-text>Letzter Zählerstand</ion-text>  
                            </ion-col>
                       </ion-row>
                       <ion-row class="ion-align-items-center">  
                            <ion-col size="9">
                                <ion-text class ="ion-text-start" style="margin-inline-start: 16px;">{{ readingValueOutput }} kwH  am {{ formatDateGerman(readingDateOutput) }} </ion-text>
                            </ion-col>
                            <ion-col size="3" class="ion-text-left">
                                <ion-button @click="deleteLastReading" color="warning" fill="solid" size="small" class="ion-no-padding">
                                    <ion-icon style="transform: translateX(15%);" size="small" :icon="trashOutline"></ion-icon>  
                                </ion-button>
                            </ion-col>
                        </ion-row>
                  </ion-grid>
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
                    <ion-button @click="saveNewReading"
                    expand="block" size="default" class="custom-button" color="light">
                                Stand jetzt speichern
                    </ion-button>
            </ion-card-content>

            </ion-card>

        </ion-content>



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