<script>
import "./Sidebar.scss";
export default {
  data() {
    return {
      selectedFolder: null
    };
  }
};
</script>

<template>
  <div class="col chat_sidebar py-6 px-5">
    <div class="d-flex align-center flex-row justify-space-between">
      <div class="chat_sidebar-user_avatar">
        <div class="d-flex flex-row justify-space-between">
          <div class="d-flex">
            <v-avatar class="mr-3 chat_sidebar-customized_avatar" size="70">
              <span></span>
              <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="John"></v-img>
            </v-avatar>
            <div>
              <h1 class="text-high-emphasis chat_sidebar-user_avatar-username">John Doe</h1>
              <span class="text-disabled chat_sidebar-user_avatar-state">Online</span>
            </div>
          </div>

          <div class="d-flex align-center">
            <AppMenu />
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8">
      <v-text-field rounded="lg" prepend-inner-icon="mdi-magnify" placeholder="Search" variant="solo"></v-text-field>

      <h2>Messages</h2>
      <ChatRows />
    </div>
  </div>
</template>
