<script setup lang="ts">
import { IonCard, IonCardHeader, IonCardTitle, IonItem, IonIcon, IonInput, IonButton } from '@ionic/vue'
import { pencilSharp, helpCircleOutline } from 'ionicons/icons'
import { ref, watch} from 'vue'

const model = defineModel<number>(); 

defineProps<{
    title: string,
    text: string
    placeholderValue?: string 
    unittext: string,
    stepValue?: string,
}>()

const isEditing = ref(!model.value);
const isInitialized = ref(false); // Merker, ob der Start-Check schon durch ist

// Der Watcher läuft exakt einmal beim Laden durch und ignoriert danach jede Benutzereingabe beim Tippen!
watch(model, (newValue) => {
  if (!isInitialized.value) {
    if (newValue !== undefined && newValue !== null && newValue !== 0) {
      isEditing.value = false; // Daten vorhanden -> Feld beim Start gesperrt
      isInitialized.value = true;
    } else {
      isEditing.value = true;  // Keine Daten -> Feld beim Start offen zum Tippen
      isInitialized.value = true;
    }
  }
}, { immediate: true });

</script>

<template>
  <ion-card>

     <ion-card-header class="card-header">
        <ion-card-title class="card-title">
            {{ title }}
        </ion-card-title>
    </ion-card-header>

    <ion-card-content>
        <ion-item lines="none">
            
                <ion-input class="input-field"
                fill="outline"
                    :class="{ 'active-editing': isEditing }"
                    v-model="model" 
                    :placeholder="placeholderValue"
                    enterkeyhint="done"
                    type="number"
                    :step="stepValue || 'any'"
                    :readonly ="!isEditing"
                    @ion-blur="isEditing = false"
                    @ionChange="isEditing = false"
                   />
                <div slot="end" class="currency-unit">{{ unittext }}</div>
                <ion-button @click="isEditing = !isEditing" fill="clear" color="primary" slot="end">
                    <ion-icon :icon="pencilSharp" />
                </ion-button>
            
                <ion-button fill="clear" slot="end">
                    <ion-icon :icon="helpCircleOutline" />
                </ion-button>
                
        </ion-item>
        <p v-show="!model || model === 0"  class="error-text">
            {{text}}
        </p>    

        </ion-card-content>

        
  </ion-card>
</template>

<style scoped>

.input-field[readonly]{
    --background :#f8f9fa;
    padding: 0;
    pointer-events: none;
}

.input-field.active-editing {
  --background: #f0f0f0; 
  --border-width: 2px; 
  --border-color:#3880ff;
  box-shadow: 0 0 0 2px rgba(56, 128, 255, 0.1);
}
.editing {
    --background: #694c4c;
    margin-left: 0%;
}
</style>

