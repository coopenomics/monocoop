<template lang='pug'>
div

  q-card.bordered.q-pa-md.signup(flat)
    p.text-h6.text-center.q-mb-md ВСТУПИТЬ В ПАЙЩИКИ
    q-stepper(v-model='store.step', vertical, animated, flat, done-color='primary')
      EmailInput

      SetUserData

      GenerateAccount

      ReadStatement

      SignStatement

      PayInitial(v-model:step='store.step')

      WaitingRegistration(v-model:step='store.step')

      Welcome(v-model:step='store.step')
  q-btn(@click="out" dense size="sm" flat) начать с начала


</template>

<script lang="ts" setup>
import { watch, onMounted, onBeforeUnmount, computed } from 'vue'
import EmailInput from './EmailInput.vue'
import GenerateAccount from './GenerateAccount.vue'
import SetUserData from './SetUserData.vue'
import SignStatement from './SignStatement.vue'
import ReadStatement from './ReadStatement.vue'
import PayInitial from './PayInitial.vue'
import WaitingRegistration from './WaitingRegistration.vue'
import Welcome from './Welcome.vue'

import { COOPNAME } from 'src/shared/config'
import { useCurrentUserStore } from 'src/entities/User'
const currentUser = useCurrentUserStore()

import { useRegistratorStore } from 'src/entities/Registrator'
import { useLogoutUser } from 'src/features/Registrator/Logout'
import { useSessionStore } from 'src/entities/Session'
import { useAgreementStore } from 'src/entities/Agreement'
import { useWalletStore } from 'src/entities/Wallet'

const { state, clearUserData } = useRegistratorStore()
const session = useSessionStore()
const store = state
const username = computed(() => session.username)
const agreementer = useAgreementStore()
const wallet = useWalletStore()

onMounted(() => {
  agreementer.loadCooperativeAgreements(COOPNAME)
  if (!currentUser.isRegistrationComplete) {

    if (currentUser.userAccount?.status === 'registered' || currentUser.userAccount?.status === 'active' || currentUser.userAccount?.status === 'blocked') {
      store.step = 7
      return
    }
  }

})


const out = async () => {
  const { logout } = await useLogoutUser()
  await logout()

  clearLocalStorage()

  window.location.reload()
}

const clearLocalStorage = () => {
  clearUserData()
}

onBeforeUnmount(() => {
  if (store.step == 8) {
    clearLocalStorage()
  }
})

watch(() => currentUser.participantAccount, (newValue) => {
  if (newValue) {
    clearLocalStorage()
    store.step = 8
  }
})

watch(
  () => [store.step, store.email, store.account, store.userData],
  () => {
    if (store.step >= 4 && store.step < 8) {
      currentUser.loadProfile(username.value, COOPNAME)
      wallet.loadUserWalet({coopname: COOPNAME, username: username.value})
    }
  }
)
</script>
<style></style>
