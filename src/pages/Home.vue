<template>
    <q-page class="flex column items-center justify-start">
      Home  
      <h2>{{ carousel?.name_lang }}</h2>
      <div class="q-pa-md">
    <q-carousel
      v-model="carouselIndex"
      transition-prev="slide-right"
      transition-next="slide-left"
      animated
      control-color="primary"
      class="rounded-borders"
      :swipeable="true"
    >
      <q-carousel-slide :img-src="base_url+'/uploads/'+slide.image" v-for="slide in carousel?.slides" name="style" class="column no-wrap flex-center">
        <q-icon name="style" color="primary" size="56px" />
        <div class="q-mt-md text-center">
          {{slide.name}}          
        </div>
      </q-carousel-slide>
    </q-carousel>
  </div>


      <q-btn
        label="Logout"
        @click="logout"
      />

    </q-page>
</template>
  
<script setup>
import { useAuthStore } from 'src/stores/auth'
import useApi from 'src/composables/useApi'
import { ref, onMounted } from 'vue'

const { get, loading, error } = useApi()
const carousel = ref(null)
const carouselIndex = ref('style')
const base_url = ref(process.env.API_URL);

const logout = () => {
  useAuthStore().logout()
}

const fetchData = async () => {
    try {
        const response = await get('fr/home')
        carousel.value = response.data.carousel
    } catch (err) {
        console.error('Erreur:', err)
    }
}

onMounted(() => {
    fetchData()
})
</script>
  