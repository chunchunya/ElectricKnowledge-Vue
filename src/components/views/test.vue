<template>
<div>
  <template v-if="loginType === true">
    <label>Username</label>
    <input placeholder="Enter your username" key="username-input" />
  </template>
  <template v-else>
    <label>Email</label>
    <input placeholder="Enter your email address" key="email-input" />
  </template>
  <!-- <button v-on:click="Trans">切换输入方式</button> -->
   <button @click="Trans">切换输入方式</button>
</div>
</template>

<script>
export default {
  name: 'Test',
  data() {
    return {
      loginType: true,
    };
  },
  methods:{
    Trans(){
      // console.log(this.loginType)
      this.loginType = !this.loginType
    }
  }
};
</script>
<style scoped>

</style>