<script setup lang="ts">
import { MailIcon } from "@heroicons/vue/outline";
</script>

<template>
  <div>
    <div class="form">
      <div class="flex justify-between mb-1">
        <h1 class="font-bold text-2xl">Signin</h1>
        <button class="text-slate-600">Try another way</button>
      </div>

      <div class="input-row">
        <label class="input-title">Email</label>
        <input type="text" class="block w-full text-sm rounded-xl" />
        <div class="input-icon">
          <MailIcon />
        </div>
      </div>

      <button type="button" class="btn btn-primary btn-animated-caret w-full rounded-xl p-2.5 mt-8">
        Submit
        <span class="next-caret">-></span>
      </button>
    </div>
  </div>
</template>
