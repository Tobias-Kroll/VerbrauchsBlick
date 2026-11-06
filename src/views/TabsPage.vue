<script setup lang="ts">
import { 
  IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, 
  IonPage, IonRouterOutlet, IonModal, IonContent, 
  IonToolbar, IonTitle, IonButtons, IonButton, IonToggle
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

          <ion-modal ref="modal">
            <ion-header>
              <ion-toolbar>
                <ion-title>Löschen</ion-title>
                <ion-buttons slot="end">
                  <ion-button color="light" @click="closeResetModal()">Abbrechen</ion-button>
                </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content class="ion-padding">
              <ion-grid>
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
                <ion-row class="ion-align-items-center">
                  <ion-col>
                  <ion-toggle
                  v-model="isDeleteEnabled" 
                  :enable-on-off-labels="true">
                  </ion-toggle>
                  </ion-col>
                </ion-row>
                <ion-row>
                  <ion-col>
                    <ion-button @click="deleteAll" :disabled="!isDeleteEnabled" color="danger">
                      Vertragsdaten löschen
                    </ion-button>
                  </ion-col>
                </ion-row>            
              
              </ion-grid>
              </ion-content>
          </ion-modal>

  </ion-page>
</template>

<style>
  ion-modal {
    --height: 60%;
    --border-radius: 16px;
    --box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  }

   ion-modal::part(backdrop) {
    background: rgba(209, 213, 219);
    opacity: 1;
  } 

    ion-modal ion-toolbar {
    --background: rgb(14 116 144);
    --color: white;
  }
</style>