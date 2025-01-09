// Langues.vue
<template>
    <q-page class="flex column items-center justify-center">
        <div class="text-h5 q-mb-md">Choisissez votre langue</div>
        
        <!-- Loading state -->
        <q-spinner-dots v-if="loading" color="primary" size="40px" />
        
        <!-- Error state -->
        <div v-else-if="error" class="text-negative">
            {{ error }}
        </div>
        
        <!-- Languages list -->
        <div v-else class="q-gutter-md flex row justify-center items-center">
            <template v-for="lang in languages" :key="lang.code">
                <div class="flex column items-center q-mb-md">
                    <img           
                        style="max-width: 80px;"
                        :src="`${lang.flag}`"
                        :alt="lang.name"
                        class="q-mr-sm" 
                        @click="selectLanguage(lang)"
                    />        
                </div>
            </template>
        </div>
    </q-page>
</template>
  
<script setup>
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import useApi from 'src/composables/useApi'
    
    const router = useRouter()
    const languages = ref([])
    const { get, loading, error } = useApi()

    const fetchLanguages = async () => {
        try {
            const response = await get('langs')
            languages.value = response.data.langs
        } catch (err) {
            console.error('Erreur:', err)
        }
    }

    const selectLanguage = (lang) => {
        // Stockage de la langue sélectionnée et redirection
        localStorage.setItem('selectedLanguage', lang.code)
        router.push('/phone')
    }

    onMounted(() => {
        fetchLanguages()
    })
</script>