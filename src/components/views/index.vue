<template>
<div>
  <el-container class="layout-container">
     <el-header style="font-size:16px; box-sizing:content-box; padding:0px 0px">
        <div class="intro">
          <div class="title">电力知识图谱</div>
          <div class="find">
          <input type="text" class="finds" placeholder="欢迎使用电力知识图谱...">
          <button>搜索</button>
          </div>
        </div>
     </el-header>
     <el-main style="height:100%">
         <div ref="graph" id="graph"></div>
     </el-main>
   </el-container>

</div>
</template>

<script>
import ForceGraph3D from "3d-force-graph";
import axios from 'axios'

export default {
  name: 'graph',
  
  data() {
      return {
          myGraph: null,            		// 3D-graph对象
          graphData: null,					// 3D-graph加载的图数据
          result:{}
          // db:{								// 数据库连接配置：
          //   uri : "bolt://127.0.0.1:7687",  // 		neo4j地址（不给端口默认7687）
          //   // uri : "http://127.0.0.1:7687",  // 		neo4j地址（不给端口默认7687）
          //   user : 'neo4j',                 // 		数据库用户名(默认neo4j，修改成自己的)
          //   password : '123'				// 		数据库密码（默认ne4oj，修改成自己的）
          // }
      }
      
    },

   mounted() {
      this.initGraph ()
     
  },

  methods: {
      async initGraph() {
      /********************************************** 1.创建图 **********************************************/
        try{
          this.myGraph = ForceGraph3D({
            controlType: "trackball",                                                                 // orbit沿2d轨迹绕着拖动，fly 固定不动
            rendererConfig:{ antialias: true, alpha: true }
          })(this.$refs.graph)
            /*------------------------------------------- 画布配置 -------------------------------------------*/
            .backgroundColor("black")                                                           // 背景颜色，支持内置颜色和RGB
            .width(this.$refs.graph.offsetWidth-10)                                       // 画布宽度(充满父级容器)
            .height(this.$refs.graph.offsetHeight)                           // 画布高度(充满父级容器)
            .showNavInfo(false)                                                               // 是否显示底部导航提示信息
            /*------------------------------------------- 节点配置 -------------------------------------------*/
            .nodeRelSize(5)                                                                           // 节点大小（支持数值）
            .nodeVal(node => node.size * 0.05)                                                        // 节点大小（支持回调）
            .nodeAutoColorBy('id')                                                                    // 节点颜色：根据属性划分（参数为graphData({nodes: nodes, links: links})）中nodes中每个node中的属性名称）
            .nodeAutoColorBy(node => node.id)                                                         // 节点颜色：回调函数处理（功能同上）
            .nodeOpacity(1)                                                                           // 节点透明度：回调函数处理（根据label划分）
            // .nodeLabel("labels")                                                          // 节点标签显示内容（鼠标滑到节点显示，支持直接写节点属性名称）
            .nodeLabel(node => node.labels+'<br>'+JSON.stringify(node.attrs))             // 节点标签显示内容（鼠标滑到节点显示，也可以使用回调函数）
            .onNodeHover(node => this.$refs.graph.style.cursor = node ? 'pointer' : null)     // 鼠标滑到节点上改变指针
            .onNodeClick(node => {                                                            // 点击节点事件（视角转移到该节点）
              // Aim at node from outside it
              const distance = 40;
              const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
              this.myGraph.cameraPosition(
                  {x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio}, // new position
                  node, // lookAt ({ x, y, z })
                  3000  // ms transition duration)
              )
            })
            /*------------------------------------------- 边的配置 -------------------------------------------*/
            .linkVisibility(true)                                                                    // 是否显示边
            .linkLabel(r => r.type)                                                      // 边的标签显示（鼠标滑到边上显示）
            .linkDirectionalArrowLength(3.5)                                                         // 边的指向箭头长度
            .linkDirectionalArrowRelPos(1)                                                           // 边的标签显示（鼠标滑到边上显示）
            .linkCurvature(0.25)                                                                     // 边的透明度
            .linkDirectionalParticles(5)                                                             // 边粒子：数量
            .linkDirectionalParticleSpeed(1)                                                         // 边粒子：移动速度
            .linkDirectionalParticleWidth(0.3)                                                       // 边粒子：大小
            .linkColor(()=>'RGB(119,136,153)')                                                       // 边颜色
            .linkAutoColorBy(r => r.type)                                                            // 边颜色自动化分
            .linkOpacity(0.3)                                                                        // 边透明度（越小越透明）

          /********************************************** 2.加载数据 **********************************************/
          // let graph_info = this.getAllData();
          // graph_info.then((res)=>{
          //     console.log(res.data);
          // })
       
          this.result = await this.getAllData();   
          console.log(this.result)
          /** 构造3D-Graph数据的边 */
          const links = Object.values(this.result.data.links);
          /** 构造3D-Graph数据的节点 */
          const nodes = Object.entries(this.result.data.nodes).map(entry=>{
            return {id:entry[0], labels:entry[1].labels, attrs:entry[1].attrs}
          })
          this.myGraph.graphData({
            nodes: nodes, links: links
          })
          /********************************************** 3.动态设置 **********************************************/
          /*  修改边长度,同d3引擎用法  */
          this.myGraph.d3Force('link').distance(500);
          // /*  设置图谱自动旋转  */
          const distance = 400;
          // let angle = 0;
          // setInterval(() => {
          //   this.myGraph.cameraPosition({
          //     x: distance * Math.sin(angle),
          //     y: distance * Math.sin(angle),
          //     z: distance * Math.cos(angle)
          //   });
          //   angle += Math.PI / 1000;
          // }, 100);
      } catch (err){
        console.log(err);
      }
  },
  getAllData(){
    let AllData = axios.get('http://localhost:8088').then(res=> {
      return res;
      })
    console.log(AllData);
    return AllData;
  }
    // /**
    //  * 读取neo4j结果
    //  * @param limit_items
    //  * @returns {Promise<node_info, rel_info>}
    //  */
    // async getCyperResult(limit_items) {
    //   const start = new Date()
    //   const neo4j = require('neo4j-driver')
    //   // const types = neo4j.types.v1
    //   const driver = neo4j.driver(this.db.uri, neo4j.auth.basic(this.db.user, this.db.password))
    //   const session = driver.session()
    //   const result = await session.run(
    //       'MATCH (n)-[r]->(m) ' +
    //       'RETURN ' +
    //       'id(n) as source, labels(n) as source_labels, properties(n) as source_attrs, ' +
    //       'id(m) as target, labels(m) as target_labels, properties(m) as target_attrs, ' +
    //       'id(r) as link,     type(r) as r_type,          properties(r) as r_attrs ' +
    //       'LIMIT $limit_items ',
    //       {limit_items: neo4j.int(limit_items)}
    //   );

    //   console.log(result)

    //   /* 存储节点和边信息
    //    * node_info[节点ID] = {节点标签：list, 节点属性:dict}
    //    *   rel_info[边ID] = {  边类别：str,   边属性:dict}
    //    */
    //   const node_info = {}
    //   const rel_info = {}
    //   result.records.map(r => {
    //     node_info[r.get('source').toString()] = {
    //       labels: r.get('source_labels').toString(),
    //       attrs: r.get('source_attrs').toString()
    //     };
    //     node_info[r.get('target').toString()] = {
    //       labels: r.get('target_labels').toString(),
    //       attrs: r.get('target_attrs')
    //     }
    //     rel_info[r.get('link').toString()] = {
    //       type: r.get('r_type').toString(),
    //       attrs: r.get('r_attrs'),
    //       source: r.get('source').toString(),
    //       target: r.get('target').toString()
    //     }
    //   });
    //   console.log(Object.keys(node_info).length + " nodes loaded and " + Object.keys(rel_info).length + " links loaded in " + (new Date() - start) + " ms.")
    //   return {
    //     node_info,
    //     rel_info
    //   }
    // },
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.layout-container{
  height:100%;
}
.intro{
  width:100%;
  height:40px;
  margin: 0px;
  background-color: lightsteelblue;

}
.title{
  color: white;
  line-height:35px;
  margin-left: 10px;
  float:left;
  display:inline
  
}
.find{
  text-align: right;
  line-height:35px;
  margin-right: 10px;
}

#graph{
  background-color: rgb(2, 44, 54);
  padding: 5px;
  height:100%;
  /*min-width: 300px;*/
  width: 100%;
  border-radius: 5px;
}
</style>
