<template>
    <q-page class="flex column items-center justify-center q-pa-md">
        <div class="text-h5 q-mb-md">Saisir votre numéro de téléphone</div>
        
        <!-- Étape 1 : Saisie du numéro de téléphone -->
        <q-form 
            v-if="!showCodeVerification" 
            @submit="requestCode" 
            class="q-gutter-md" 
            style="width: 100%; max-width: 400px;">
            
            <q-select
                v-model="operator"
                :options="[{
                    label: 'Orange',
                    value: '1'
                }, {
                    label: 'MTN',
                    value: '2'
                }, {
                    label: 'Nexttel',
                    value: '3'
                }]"
                label="Opérateur"
                outlined></q-select>
            
            <q-input
                v-model="phone"
                label="Numéro de téléphone"
                :rules="[val => !!val || 'Le numéro est requis']"
                outlined
            />

            <div v-if="error" class="text-negative q-mb-md">
                {{ error }}
            </div>

            <div class="row justify-center">
                <q-btn
                    type="submit"
                    color="primary"
                    label="Recevoir le code"
                    class=""
                    :loading="loading"
                />
            </div>
        </q-form>

        <!-- Étape 2 : Vérification du code -->
        <q-form v-else @submit="verifyCode" class="q-gutter-md" style="width: 100%; max-width: 400px;">
            <div class="text-subtitle1 q-mb-sm">
                Un code a été envoyé au {{ phone }}
            </div>

            <q-input
                v-model="verificationCode"
                label="Code de vérification"
                :rules="[val => !!val || 'Le code est requis']"
                outlined
            />

            <div class="row justify-between q-mb-md">
                <q-btn
                    flat
                    color="primary"
                    label="Changer de numéro"
                    @click="resetForm"
                />
                
                <q-btn
                    v-if="countdown === 0"
                    flat
                    color="primary"
                    label="Renvoyer le code"
                    @click="requestCode"
                    :loading="loading"
                />
                <div v-else class="text-grey">
                    Renvoyer dans {{ countdown }}s
                </div>
            </div>

            <div v-if="error" class="text-negative q-mb-md">
                {{ error }}
            </div>

            <q-btn
                type="submit"
                color="primary"
                label="Vérifier"
                class="full-width"
                :loading="loading"
            />
        </q-form>

        <div class="q-mt-md">
            Langue sélectionnée : {{ currentLang }}<br>
            device_id : {{ deviceId }}
        </div>
    </q-page>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { useQuasar } from 'quasar'
    import { useRouter } from 'vue-router'
    import { Device } from '@capacitor/device'
    import useApi from 'src/composables/useApi'
    import { useAuthStore } from 'src/stores/auth'
    
    const $q = useQuasar()
    const router = useRouter()
    const currentLang = ref('')
    const operator = ref(1)
    const phone = ref('0679593028')
    const deviceId = ref('')
    const showCodeVerification = ref(false)
    const verificationCode = ref('')
    const countdown = ref(0)
    let countdownInterval = null
    const authStore = useAuthStore()

    const { post, loading, error } = useApi()

    const generateDeviceId = async () => {
        const info = await Device.getId()
        deviceId.value = info.identifier
    }

    const startCountdown = (seconds) => {
        countdown.value = seconds
        clearInterval(countdownInterval)
        countdownInterval = setInterval(() => {
            if (countdown.value > 0) {
                countdown.value--
            } else {
                clearInterval(countdownInterval)
            }
        }, 1000)
    }

    const requestCode = async () => {
        // Générer et sauvegarder le device_id
        if (!deviceId.value) {
            deviceId.value = generateDeviceId()
        }

        const formData = new FormData()
        formData.append('phone', phone.value)
        formData.append('device_id', deviceId.value)
        formData.append('operator_id', operator.value)

        const data = await post('request_code', formData)
        if(data.success)
        {
            showCodeVerification.value = true    
            verificationCode.value = data.data.sms.code                             
            startCountdown(data.data.sms.repeated) // Démarrer le compte à rebours de 60 secondes
        }        
    }

    const verifyCode = async () => {    
        try {
            const success = await authStore.verifyPhoneCode(phone.value, deviceId.value, verificationCode.value)
            if (success) {
                router.push('/home')
            }
        } catch (err) {
            error.value = err.message
        }
    }

    const resetForm = () => {
        showCodeVerification.value = false
        verificationCode.value = ''
        error.value = ''
        clearInterval(countdownInterval)
        countdown.value = 0
    }

    onMounted(() => {
        currentLang.value = localStorage.getItem('selectedLanguage')

        generateDeviceId()
    })
</script>