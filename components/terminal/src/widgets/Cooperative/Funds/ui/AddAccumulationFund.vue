<script setup lang="ts">
import { useCooperativeStore } from 'src/entities/Cooperative';
import { useSessionStore } from 'src/entities/Session';
import { useCreateFund } from 'src/features/Cooperative/CreateFund';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { COOPNAME } from 'src/shared/config';
import { ref, watch } from 'vue';

const props = defineProps({
  showAdd: {
    type: Boolean,
    required: true,
  }
})

const emit = defineEmits(['close'])
const coop = useCooperativeStore()
const { createFund } = useCreateFund()
const session = useSessionStore()


const localShowAdd = ref(false)
const name = ref('')
const description = ref('')
const percent = ref()

const addFund = async() => {
  try{
    await createFund({
      coopname: COOPNAME,
      username: session.username,
      type: 'accumulation',
      contract: '',
      name: name.value,
      description: description.value,
      percent: Number(percent.value) * 10000
    })

    await coop.loadFunds(COOPNAME)
    localShowAdd.value = false
    name.value = ''
    description.value = ''
    percent.value = ''

    SuccessAlert('Фонд успешно создан')
  } catch(e: any){
    localShowAdd.value = false
    FailAlert(e.message)
  }

}

watch(() => props.showAdd, (newValue: boolean) => {
  localShowAdd.value = newValue
})

watch(localShowAdd, (newValue) => {
  if (newValue === false)
    emit('close')
})
</script>

<template lang="pug">
q-dialog(v-model="localShowAdd" persistent :maximized="false" )
  q-card
    div()
      q-bar.bg-primary.text-white
        span Добавить фонд накопления
        q-space
        q-btn(v-close-popup dense flat icon="close")
          q-tooltip Close

      div
        q-input(filled label="Название фонда" v-model="name")
        q-input(filled label="Заметка для фонда (не обязательно)" v-model="description")
        q-input(filled label="Процент фона" v-model="percent" type="number" min=0 step=1)
      q-btn(flat @click="localShowAdd = false") отменить
      q-btn(color="primary" @click="addFund") добавить
</template>
