<script setup lang="ts">
import { 
  IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, 
  IonPage, IonRouterOutlet, IonModal, IonContent, 
  IonToolbar, IonTitle, IonButtons, IonButton, IonToggle, IonItem
} from '@ionic/vue';
import { homeOutline, documentTextOutline, trashOutline, warningOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { ref } from 'vue';



const modal =ref();
const isDeleteEnabled = ref(false);

const openResetModal = () => {
modal.value.$el.present();
};

const closeResetModal = () => {
  modal.value.$el.dismiss(null, 'cancel');
};

const router = useRouter();

const deleteAll = () => {
  // 1. Aus dem LocalStorage löschen
  console.log("hier an");
localStorage.clear();
  // 3. Modal schließen
  modal.value.$el.dismiss(null, 'confirm');
  // 4. Saubere Weiterleitung zur Home-Seite via Router (ohne echten Browser-Reload!)
  router.push('/tabs/home');
  window.location.reload();
};
</script>

<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="homeOutline" />
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="contract" href="/tabs/contract">
          <ion-icon :icon="documentTextOutline" />
          <ion-label>Vertrag</ion-label>
        </ion-tab-button>

        <ion-tab-button @click="openResetModal">          
          <ion-icon :icon="trashOutline" />
          <ion-label>Turnus löschen</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>

          <ion-modal ref="modal" class="ion-padding">

              <ion-toolbar class="left-title-toolbar">
                <ion-title>Löschen</ion-title>
                <ion-buttons slot="end">
                  <ion-button color="light" @click="closeResetModal()">Abbrechen</ion-button>
                </ion-buttons>
                </ion-toolbar>

            <ion-item>
              <ion-grid class="modal-content">
                 <!-- Warnung mit Icon (Row & Col) -->
                <ion-row class="ion-align-items-center">
                  <ion-col size="2" class="ion-text-center">
                    <ion-icon :icon="warningOutline" size="large" color="warning"></ion-icon>
                  </ion-col>
                  <ion-col size="10">
                    <p style="margin: 0; font-size: 14px;">
                      Vorsicht! Diese Aktion <strong>löscht</strong> alle aktuellen Zählerstände und Vertragsdaten unwiderruflich.
                    </p>
                  </ion-col>
                </ion-row>
              <!-- Zusatztext -->
                <ion-row>
                  <ion-col>
                    <p style="font-size: 14px; color: #555;">
                     Das ist nötig, um ein neues Vertragsjahr bzw. Turnus zu starten.
                    </p>
                  </ion-col>
                </ion-row>

                  <ion-toggle
                  v-model="isDeleteEnabled" 
                  :enable-on-off-labels="true">
                  </ion-toggle>

                <ion-row>
                  <ion-col>
                    <ion-button @click="deleteAll" :disabled="!isDeleteEnabled" color="danger">
                      Vertragsdaten löschen
                    </ion-button>
                  </ion-col>
                </ion-row>            
              
              </ion-grid>
              </ion-item>
          </ion-modal>

  </ion-page>
</template>

<style>

</style>