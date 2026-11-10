<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonInput, IonToast, IonContent, IonItem, IonLabel, IonAlert, onIonViewWillEnter } from '@ionic/vue';
import { trashOutline, informationCircle } from 'ionicons/icons'
import { computed, ref, onMounted } from 'vue';
import type { IAppData } from '../models/IAppData';
import MainFeatureCard from '../components/MainFeatureCard.vue';




const cardRef = ref<any>(null);
const readingInput = ref<number>();
const readingValueOutput =ref<number>(); //lertzter Zählstand
const readingDateOutput =ref<string>(); //letztes erfasstes Datum 
const alertButtons = ['Verstanden'];

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
onIonViewWillEnter(() => {
  const storedData = localStorage.getItem('AppData');

  if(storedData) {
    const parsedData = JSON.parse(storedData) ; // JSON.parse wandelt einen JSON-String in ein JavaScript-Objekt um

    homeSavedData.value = parsedData; 

    if(lastReading.value?.readingValue && lastReading.value?.readingDate){
        readingValueOutput.value = lastReading.value?.readingValue;
        readingDateOutput.value = lastReading.value?.readingDate;
    }
else {
    // Falls startReading nicht direkt greift, schauen wir direkt in parsedData nach dem Vertrag
    const billingPeriod = parsedData?.billingPeriod?.[0];
    
    readingValueOutput.value = lastReading.value?.readingValue ?? billingPeriod?.startReading ?? 0;
    readingDateOutput.value = lastReading.value?.readingDate ?? billingPeriod?.startDate ?? '';
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
    

    if(!startReading.value){
        console.log("Noch kein Startzähler eingetragen");
        toastText.value ="Bitte hinterlege zu erst deinen Startzählerstand";
        isToastOpen.value= true;
        readingInput.value = 0;
        return;
    }    

    // 3. Prüfen, ob der Wert kleiner oder gleich dem letzten Stand ist

    if (readingInput.value <= (readingValueOutput.value ?? 0) || readingInput.value <= (startReading.value?.startReading ?? 0)) {
        console.log("Fehler: Wert zu niedrig!");
        toastText.value = "Dein neuer Zählerstand kann nicht gleich oder kleiner deines letzten erfassten Zählerstandes sein";
        isToastOpen.value = true;
        return;
    }

    
    homeSavedData.value.meterReading.push({
    readingValue: Math.round(Number(readingInput.value)),
    readingDate: new Date().toISOString().split('T')[0],
})


console.log(homeSavedData.value.meterReading);

localStorage.setItem('AppData', JSON.stringify(homeSavedData.value));
console.log("Gespeichert:", homeSavedData.value);

readingValueOutput.value = Math.round(Number(readingInput.value));
readingDateOutput.value = new Date().toISOString().split('T')[0];
readingInput.value = undefined;

cardRef.value?.debugging();
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

    <ion-page>
        
        <ion-header condence = "fade">
                <ion-toolbar>
                    <ion-title> Verbrauchsblick </ion-title>  
                    <ion-button  fill="clear" size="default" id="present-home-alert" slot="end" class="ion-padding-right info-Button">
                        <ion-icon size="default" :icon="informationCircle"></ion-icon>
                    </ion-button>
                        <ion-alert
                            trigger="present-home-alert"
                            css-class="home-about-alert"
                            header="Über dieses Projekt"
                            message= "Hallo liebe Verbrauchsblick-Freunde,
                            diese App habe ich als Student als mein erstes kleines Herzensprojekt entwickelt.

                            Die Idee entstand, als ich zum ersten Mal wissen wollte, ob ich beim Strom im Plus oder im Minus bin. Ich musste feststellen, dass ich alles mühsam auf Papier ausrechnen musste – und das auch erst, nachdem ich mich belesen hatte, wie die Abrechnung überhaupt funktioniert. Genau hier wollte ich Abhilfe schaffen!

                            Aus zeittechnischen Gründen startet ihr hier erst einmal mit Version 1.0 (einem minimal funktionsfähigen Produkt). Ich habe aber schon viele Ideen für zukünftige Features, darunter zum Beispiel:

                            - Dynamische Anpassung von monatlichen Abschlägen
                            -- Variable Verbrauchskosten und Berücksichtigung von Preisänderungen
                            - Detaillierte Einblicke in euren Verbrauch (z. B. Diagramme und Prognosen)
                            - Und vieles mehr!

                            Ich hoffe sehr, dass euch die bisherige Version gefällt und euch im Alltag weiterhilft."
                            :buttons="alertButtons"
                        ></ion-alert>
               </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding" >
            <ion-toast
                :is-open="isToastOpen"
                :message="toastText"
                :duration="3500"
                @didDismiss="setIsToastOpen(false)"
                position="bottom" 
                color="danger"></ion-toast>
        <!--Hauptfeature-->
            <MainFeatureCard ref="cardRef" :app-data="homeSavedData"></MainFeatureCard>


        <!--Meterreadings-->
            <ion-card>
                <!--Header: letzter Zählerstand-->
                <ion-card-header class = "lastreading">       
                           
                            <ion-text>Letzter Zählerstand</ion-text>  

                </ion-card-header>       

            <ion-card-content>
                <ion-grid class="styleReadingOutput ion-text-center">
                <ion-row class="ion-align-items-center">  
                            <ion-col size="9">
                                <ion-text v-if="readingValueOutput" class ="ion-text-start">
                                    {{ readingValueOutput }} kWh &nbsp;&nbsp;&nbsp;am {{ formatDateGerman(readingDateOutput) }} 
                                </ion-text>
                                <ion-text v-else class ="ion-text-end" style="margin-inline-start: 4px;">Noch kein Zählerstand eingetragen</ion-text>
                            </ion-col>
                            <ion-col size="3" class="ion-text-left">
                                <ion-button @click="deleteLastReading" fill="clear" size="default" class="ion-no-padding delete-btn">
                                    <ion-icon  size="default" :icon="trashOutline"></ion-icon>  
                                </ion-button>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                <!--Content: neuster Zählerstand-->

<div class="label-row">
    <ion-text class="description">
        Neuer Zählerstand
    </ion-text>
    <ion-button fill="clear" id="present-alert" class="info-Button">
        <ion-icon :icon="informationCircle"></ion-icon>
    </ion-button>

                        <ion-alert
                            trigger="present-alert"
                            header="Neuer Zählerstand"
                            message=" Der neue Zählerstand ist der aktuelle Stand, den dein Stromzähler im Moment anzeigt. Er wird mit deinem Startzählerstand verglichen, um deinen tatsächlichen Stromverbrauch zu berechnen.

                                    Du findest diesen Wert direkt an deinem physischen Stromzähler (meist auf dem digitalen Display oder dem Rollenzählwerk).

                                    Trag hier einfach den aktuellen Zählerstand in Kilowattstunden (kWh) ein, ohne Nachkommastellen."
                            :buttons="alertButtons"
                        ></ion-alert>
                        </div>
                        <!-- Ein eigener Rahmen-Container für das Input -->
                        <div class="custom-input-wrapper">
                            <ion-input class="custom-input" type="number" placeholder="42XX kWh" v-model="readingInput">
                        </ion-input>
                        </div>                            
                        <ion-button @click="saveNewReading" expand="block"  class="custom-button">
                                    Stand jetzt speichern
                        </ion-button>
            </ion-card-content>

            </ion-card>

        </ion-content>



    </ion-page>
</template>

<style scoped>



</style>