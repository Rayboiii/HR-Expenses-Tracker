<template>
  <form @submit.prevent="submit">
    <div class="row">
      <input v-model="form.name" placeholder="Expense name" required />
      <input v-model.number="form.amount" type="number" placeholder="Amount (RM)" min="0.01" step="0.01" required />
    </div>
    <div class="row">
      <select v-model="form.category" required>
        <option value="">Select category</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <input v-model="form.date" type="date" required />
    </div>
    <button type="submit">Add Expense</button>
  </form>
</template>

<script setup>
const emit = defineEmits(['add'])

const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other']

const today = () => new Date().toISOString().split('T')[0]

const form = reactive({ name: '', amount: '', category: '', date: today() })

const submit = () => {
  emit('add', { ...form })
  form.name = ''
  form.amount = ''
  form.category = ''
  form.date = today()
}
</script>

<style scoped>
form { display: flex; flex-direction: column; gap: 0.75rem; }
.row { display: flex; gap: 0.75rem; }
.row > * { flex: 1; }
input, select {
  padding: 0.6rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  width: 100%;
}
button {
  padding: 0.65rem;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
}
button:hover { background: #2980b9; }
</style>
