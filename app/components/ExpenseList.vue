<template>
  <div>
    <p v-if="expenses.length === 0" class="empty">No expenses yet. Add one above!</p>
    <div v-for="expense in expenses" :key="expense.id" class="item">
      <div class="info">
        <span class="name">{{ expense.name }}</span>
        <span class="meta">{{ expense.category }} · {{ expense.date }}</span>
      </div>
      <div class="right">
        <span class="amount">RM {{ expense.amount.toFixed(2) }}</span>
        <button @click="$emit('delete', expense.id)">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ expenses: Array })
defineEmits(['delete'])
</script>

<style scoped>
.empty { color: #999; text-align: center; padding: 2rem 0; }
.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}
.item:last-child { border-bottom: none; }
.info { display: flex; flex-direction: column; gap: 0.2rem; }
.name { font-weight: 500; }
.meta { font-size: 0.82rem; color: #888; }
.right { display: flex; align-items: center; gap: 0.75rem; }
.amount { font-weight: 600; color: #2c3e50; }
button {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0.2rem 0.4rem;
}
button:hover { color: #e74c3c; }
</style>
