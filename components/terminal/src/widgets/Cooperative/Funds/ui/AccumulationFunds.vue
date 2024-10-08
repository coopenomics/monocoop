<script setup lang="ts">
import { computed, ref } from 'vue';
import { FundContract } from 'cooptypes';
import { useEditFund } from 'src/features/Cooperative/EditFund';
import { COOPNAME } from 'src/shared/config';
import { useSessionStore } from 'src/entities/Session';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useCooperativeStore } from 'src/entities/Cooperative';
import AddAccumulationFund from './AddAccumulationFund.vue'
import { useDeleteFund } from 'src/features/Cooperative/DeleteFund';

const props = defineProps({
  accumulationFunds: {
    type: Object as () => FundContract.Tables.AccumulatedFunds.IAccumulatedFund[],
    required: true
  }
})

const coop = useCooperativeStore()
const showAdd = ref(false)

const session = useSessionStore()

const totalAccumulationPercent = computed(() =>
  props.accumulationFunds.reduce((sum, item) => sum + Number(item.percent), 0)
);

const totalExpensePercent = computed(() => (100 - totalAccumulationPercent.value).toFixed(2))

const delFund = async(fund: FundContract.Tables.AccumulatedFunds.IAccumulatedFund) => {
  const { deleteFund } = useDeleteFund()
  try {
    await deleteFund({
      coopname: COOPNAME,
      username: session.username,
      type: 'accumulation',
      fund_id: fund.id
    })

    await coop.loadFunds(COOPNAME)
    SuccessAlert('Фонд успешно удалён')

  } catch (e: any){
    FailAlert(e.message)
  }
}

const saveFund = async (fund: FundContract.Tables.AccumulatedFunds.IAccumulatedFund) => {
    const percent = Number(fund.percent) * 10000

    const { editFund } = useEditFund()

    try {

      await editFund({
        coopname: COOPNAME,
        username: session.username,
        type: 'accumulation',
        fund_id: fund.id,
        contract: '',
        name: fund.name,
        description: fund.description,
        percent: percent
      })

      await coop.loadFunds(COOPNAME)

      SuccessAlert('Фонд успешно обновлён')
    } catch(e: any){
      FailAlert(e.message)
      await coop.loadFunds(COOPNAME)
    }

};

const getLabel = (id: any) => {
  if (id <= 3)
    return 'обязательный'
}

const columns = ref([
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'name', label: 'Название', field: 'name', align: 'left' },
  { name: 'description', label: 'Заметка', field: 'description', align: 'left' },
  { name: 'percent', label: 'Процент', field: 'percent', align: 'left' }
] as any)

</script>

<template lang="pug">
div
  q-table(flat :rows-per-page-options="[0]" :rows="accumulationFunds" :columns="columns" row-key="id")
    template(#top)
      div.full-width
        p.text-h6 Фонды накопления
        p Все членские взносы распределяются по фондам накопления, а остаток после распределения заносится на баланс кошелька членских взносов для дальнейших расходов по фондам списания.

      div.q-mt-lg.full-width
        q-btn(icon="add" @click="showAdd = true" color="primary") добавить фонд

    template(v-slot:body="props")
      q-tr(:props="props" :key="props.row.id")
        q-td(:props="props" key="id") {{ props.row.id }}
        q-td(:props="props" key="name")
          q-input(v-model="props.row.name" :label="getLabel(props.row.id)" :readonly="props.row.id <= 3" filled dense)

        q-td(:props="props" key="description")
          q-input( placeholder="Место для заметки" v-model="props.row.description" filled dense)

        q-td(:props="props" key="percent")
          q-input( v-model="props.row.percent" type="number" filled dense)

        q-td
          q-btn(@click="saveFund(props.row)" label="Обновить" color="primary" dense).q-ma-xs
          q-btn(@click="delFund(props.row)" :disabled="props.row.id <= 3" label="Удалить" color="primary" dense).q-ma-xs
    template(#bottom)
      p {{ totalAccumulationPercent }}% от каждого членского взноса распределяется среди всех фондов накопления, а {{ totalExpensePercent }}% направляются на кошелёк членских взносов кооператива для дальнейших расходов по фондам списания.
  AddAccumulationFund(:showAdd="showAdd" @close="showAdd = false")

</template>
