import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Index from '@/components/views/index'
import Test from '@/components/views/test'



Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
  
    },{
      path: '/test',
      name: 'Test',
      component: Test
  
    }

  ]
})
