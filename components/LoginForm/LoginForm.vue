<script lang="ts">
import { formattedPhone, unformattedPhone } from "@/utils/phone_formatter";
import "./LoginForm.scss";

export default {
  props: ["handleLogin", "submitLoading"],
  data() {
    return {
      phoneNumber: "",
      keepMeSignedIn: true
    };
  },
  methods: {
    formattedPhone,
    unformattedPhone,
    handlePhoneInput() {
      this.phoneNumber = this.formattedPhone(this.phoneNumber)
    },
  },
  mounted() {
    // FIXME - development
    this.phoneNumber = this.formattedPhone("9368392346")
  }
};
</script>

<template>
  <div class="login_form">
    <img src="~/assets/img/logo.png" class="logo mb-5" />
    <h1>Sign in to Kavka</h1>
    <p class="text-medium-emphasis mb-8">Please enter your phone number.</p>
    <div>
      <v-text-field placeholder="(987) 654-3210" @input="handlePhoneInput()" v-model="phoneNumber" maxlength="16" color="primary" label="Phone Number" variant="outlined"></v-text-field>

      <v-checkbox v-model="keepMeSignedIn" label="Keep me signed in" color="primary"></v-checkbox>

      <v-btn :loading="submitLoading" @click="handleLogin(unformattedPhone(phoneNumber), keepMeSignedIn)" class="rounded-sm" size="x-large" type="submit" color="primary" flat block>Next</v-btn>
    </div>
  </div>
</template>
