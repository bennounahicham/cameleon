// src/boot/auth.js
import { boot } from 'quasar/wrappers'
import { LocalStorage } from 'quasar'

const getToken = async () => {
  try {
    const formData = new FormData()
    formData.append('grant_type', 'client_credentials')
    formData.append('client_id', process.env.OAUTH_CLIENT_ID,)
    formData.append('client_secret', process.env.OAUTH_CLIENT_SECRET)

    const response = await fetch(process.env.API_URL+'/oauth/token', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Erreur d\'authentification:', error)
    throw error
  }
}

export default boot(async ({ router }) => {
    let token = null;

    try {
      console.log('gat app token');
      
      token = await getToken()      
      LocalStorage.set('app_token', token)

      console.log('pp token:', token);
      
    } catch (error) {
      console.error(error)
      return
    }

    window.getAuthToken = () => LocalStorage.getItem('app_token')
})

export { getToken }