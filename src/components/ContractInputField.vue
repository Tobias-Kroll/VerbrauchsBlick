<script setup lang="ts">
import { IonCard, IonCardHeader, IonCardTitle, IonItem, IonIcon, IonInput, IonButton } from '@ionic/vue'
import { pencilSharp, helpCircleOutline } from 'ionicons/icons'
import { ref} from 'vue'

const isEditing = ref(true);

const model = defineModel<number>(); 


defineProps<{
    title: string,
    text: string
    placeholderValue?: string 
}>()


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
                    :class="{ 'active-editing': isEditing }"
                    v-model="model" 
                    :placeholder="placeholderValue"
                    enterkeyhint="done"
                    type="number"
                    :readonly ="!isEditing"
                    @ion-blur="isEditing = false"
                    @keyup.enter="isEditing = false"
                    
                    
                />
                <div slot="end" class="currency-unit">€</div>
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

.input-field.active-editing {
  --background: #f0f0f0; /* Hier deine Wunschfarbe eintragen (z.B. ein helles Grau oder ein leichtes Blau #e8f0fe) */
  border-radius: 8px;    /* Optional: Schöne abgerundete Ecken */
}
.editing {
    --background: #f0f0f0;
    margin-left: 0%;
}
</style>

