<template>
  <div>
    <div class="crumb">
      <div class="w">
        <div class="crumb-con">
          <a class="link" href="javascript:void(0)" @click.prevent="goHome">老师好在线</a>
          <span>></span>
          <span class="link-text">{{$route.meta.name}}</span>
        </div>
      </div>
    </div>
    <div class="order-detail-wrap w">
      <pc-nav-side></pc-nav-side>
      <div class="content with-nav">
        <div class="panel">
          <div class="panel-title">订单信息</div>
          <div class="panel-body" style="margin-top: 0px;">
            <div class="order-info">
              <div class="text-line">
                <span class="text">订单号：{{orderVo.orderNo}}</span>
                <span class="text">创建时间：{{orderVo.createTime}}</span>
              </div>
              <!-- <div class="text-line">
                                <span class="text">
                                    收件人：{{orderVo.receiverName}}
                                  {{orderVo.shippingVo.receiverProvince}}
                                  {{orderVo.shippingVo.receiverCity}}
                                  {{orderVo.shippingVo.receiverAddress}}
                                  {{orderVo.shippingVo.receiverMobile}}
              </span></div>-->
              <div class="text-line">
                <span class="text">订单状态： {{orderVo.statusDesc}}</span>
              </div>
              <div class="text-line">
                <span class="text">支付方式：{{orderVo.paymentTypeDesc}}</span>
              </div>
              <div class="text-line" v-if="(orderVo.status === 50||orderVo.status === 20)">
                <span class="text">
                  该课程属于
                  <span style="color: #4d7fff;">{{orderVo.orderItemVoList[0].organName}}</span>，立即听课请
                  <span class="link" @click="loadPage('download')">下载App</span>
                </span>
              </div>
              <div class="text-line" v-if="orderVo.status === 10">
                <!-- <a class="btn" @click="loadPage('order-payment', {'orderNo': orderVo.orderNo})">去支付</a> -->
                <a class="btn" @click="orderPayment">去支付</a>
                <a class="btn order-cancel" @click="cancelOrder(orderVo.orderNo)">取消订单</a>
              </div>
              <div
                class="text-line"
                v-if="(orderVo.status === 50||orderVo.status === 20)&&orderVo.refundOutDate === 0"
              >
                <!-- <a class="btn" @click="loadPage('order-payment', {'orderNo': orderVo.orderNo})">去支付</a> -->
                <a class="btn order-cancel" @click="refundApplyClick(orderVo.orderNo)">申请退款</a>
              </div>
            </div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-title">课程清单</div>
          <div class="panel-body" style="margin-top: 0px;">
            <table class="product-table">
              <tr>
                <th class="cell-th cell-img">&nbsp;</th>
                <th class="cell-th cell-info">课程信息</th>
                <th class="cell-th cell-price">单价</th>
                <th class="cell-th cell-count">数量</th>
                <th class="cell-th cell-total">小计</th>
              </tr>
              <tr v-for="detail in orderVo.orderItemVoList" :key="detail.id">
                <td class="cell cell-img">
                  <a
                    href="javascript:void(0)"
                    @click="goProductDetailPage(detail.productId)"
                    target="_blank"
                  >
                    <img class="p-img" :src="detail.productImage" :alt="detail.productName" />
                  </a>
                </td>
                <td class="cell cell-info">
                  <a
                    class="link"
                    href="javascript:void(0)"
                    @click="goProductDetailPage(detail.productId)"
                    target="_blank"
                  >{{detail.productName}}</a>
                </td>
                <td class="cell cell-price">{{detail.currentUnitPrice | formatMoney}}</td>
                <td class="cell cell-count">{{detail.quantity}}</td>
                <td class="cell cell-total">{{detail.totalPrice | formatMoney}}</td>
              </tr>
            </table>
            <p class="total">
              <span>订单总价：</span>
              <span class="total-price">{{orderVo.payment | formatMoney}}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
import pcNavSide from "components/layout/nav-side";

export default {
  data() {
    return {
      orderVo: {}
    };
  },
  created() {},
  activated() {
    this.queryOrderItemVoList();
  },
  methods: {
    orderPayment() {
      var agent = navigator.userAgent.toLowerCase();
      if (/android/gi.test(agent)) {
        // 安卓
        this.$confirm("请选择扫码支付还是跳转支付宝app支付?", "提示", {
          confirmButtonText: "支付宝app支付",
          cancelButtonText: "支付宝扫码支付",
          cancelButtonClass: "cancelButtonClass",
          confirmButtonClass: "confirmButtonClass",
          center: true
        })
          .then(() => {
            // app支付
            this.ajax({
              url: `/omc/pay/createAlipayForm/${this.orderVo.orderNo}?payWay=1`,
              success: res => {
                if (res.code === 200) {
                  // 支付
                  // let newwindow = window.open("#","_blank");
                  // newwindow.document.write(res.result);
                  // this.optUploadFileRespDto = res.result;
                  const div = document.createElement("divform");
                  div.innerHTML = res.result;
                  document.body.appendChild(div);
                  document.forms[0].acceptCharset = "utf-8"; //保持与支付宝默认编码格式一致，如果不一致将会出现：调试错误，请回到请求来源地，重新发起请求，错误代码 invalid-signature 错误原因: 验签出错，建议检查签名字符串或签名私钥与应用公钥是否匹配
                  document.forms[0].submit();
                  // console.log('utf-8');
                  // console.log(res.result);
                } else {
                  this.$message({
                    type: "info",
                    message: res.message
                  });
                }
              },
              error: err => {
                this.$pcMessage(err.data.message);
              }
            });
          })
          .catch(() => {
            // 扫码
            this.ajax({
              url: `/omc/pay/createAlipayForm/${this.orderVo.orderNo}?payWay=0`,
              success: res => {
                if (res.code === 200) {
                  // 支付
                  // let newwindow = window.open("#","_blank");
                  // newwindow.document.write(res.result);
                  // this.optUploadFileRespDto = res.result;
                  const div = document.createElement("divform");
                  div.innerHTML = res.result;
                  document.body.appendChild(div);
                  document.forms[0].acceptCharset = "utf-8"; //保持与支付宝默认编码格式一致，如果不一致将会出现：调试错误，请回到请求来源地，重新发起请求，错误代码 invalid-signature 错误原因: 验签出错，建议检查签名字符串或签名私钥与应用公钥是否匹配
                  document.forms[0].submit();
                  // console.log('utf-8');
                  // console.log(res.result);
                } else {
                  this.$message({
                    type: "info",
                    message: res.message
                  });
                }
              },
              error: err => {
                this.$pcMessage(err.data.message);
              }
            });
          });
        return;
      }
      // let newwindow = window.open("#","_blank");
      this.ajax({
        url: `/omc/pay/createAlipayForm/` + this.orderVo.orderNo,
        success: res => {
          if (res.code === 200) {
            // 支付
            // let newwindow = window.open("#","_blank");
            // newwindow.document.write(res.result);
            // this.optUploadFileRespDto = res.result;
            const div = document.createElement("divform");
            div.innerHTML = res.result;
            document.body.appendChild(div);
            document.forms[0].acceptCharset = "utf-8"; //保持与支付宝默认编码格式一致，如果不一致将会出现：调试错误，请回到请求来源地，重新发起请求，错误代码 invalid-signature 错误原因: 验签出错，建议检查签名字符串或签名私钥与应用公钥是否匹配
            document.forms[0].submit();
            // console.log('utf-8');
            // console.log(res.result);
          } else {
            // ajax不会来到这里
            // console.log(res);
                this.$pcMessage(err.data.message);
          }
        },
        error: err => {
          this.$pcMessage(err.data.message);
        }
      });
    },
    goProductDetailPage(productId) {
      this.loadPage("goods-detail", { productId: productId });
    },
    queryOrderItemVoList() {
      this.ajax({
        url: `/omc/order/queryUserOrderDetailList/` + this.$route.query.orderNo,
        success: res => {
          if (res.code === 200) {
            this.orderVo = res.result;
          }
        }
      });
    },
    refundApplyClick(orderNo, refundReason) {
      this.$prompt("退款原因", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(({ value }) => {
          // console.log(value);
          this.refundApply(orderNo, value);
        })
        .catch(obj => {
          // 取消
          // this.$pcMessage({
          //   type: 'info',
          //   message: '取消输入'
          // });
        });
    },
    refundApply(orderNo, refundReason) {
      if (!orderNo) {
        alert("订单号不能为空");
        return;
      }
      this.ajax({
        url: `/omc/refund/refundApply`,
        data: { orderNo, refundReason },
        success: res => {
          if (res.code === 200) {
            this.$pcMessage({
              type: "success",
              message: "申请成功!"
            });
            window.location.reload();
          } else {
            this.$pcMessage(res.data.message);
          }
        }
      });
    },
    cancelOrder(orderNo) {
      if (!orderNo) {
        alert("订单号不能为空");
        return;
      }
      if (window.confirm("确实要取消该订单？")) {
        this.ajax({
          url: `/omc/order/cancelOrderDoc/` + orderNo,
          success: res => {
            if (res.code === 200) {
              this.goBack();
            }
          }
        });
      }
    }
  },
  components: {
    pcNavSide
  }
};
</script>
<style>
.cancelButtonClass {
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
}

.cancelButtonClass:hover {
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
}
.confirmButtonClass {
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
}
.confirmButtonClass:hover {
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
}
</style>
