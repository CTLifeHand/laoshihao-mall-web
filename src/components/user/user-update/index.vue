<template>
  <div class="user-info">
    <el-form :label-position="labelPosition" label-width="60px" :model="updateUserForm">
      <el-form-item label="登录名">
        <el-input v-model="updateUserForm.loginName" class="form-line-input" :disabled="true"/>
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="updateUserForm.mobileNo" class="form-line-input" :disabled="true"/>
      </el-form-item>
      <el-form-item label="昵称">
        <el-input v-model="updateUserForm.userName" class="form-line-input"/>
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="updateUserForm.email" class="form-line-input"/>
        <el-button
          :plain="true"
          type="danger"
          @click="getEmailCode"
          :disabled="buttonDisabled"
        >获取验证码</el-button>
      </el-form-item>
      <el-form-item label="验证码">
        <el-input v-model="updateUserForm.emailCode" class="form-line-input"/>
      </el-form-item>
    </el-form>
    <a class="btn btn-submit" @click="updateUserInfo">保存</a>
  </div>
</template>
<script type="text/ecmascript-6">
import { gbs } from "../../../util/settings";
export default {
  data() {
    return {
      buttonDisabled: false,
      errMsg: "",
      labelPosition: "right",
      updateUserForm: {
        userName: "",
        mobileNo: "",
        email: "",
        emailCode: ""
      }
    };
  },
  created() {
    this.queryUserInfo();
  },
  methods: {
    getEmailCode() {
      let reg = new RegExp(
        "^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"
      ); //正则表达式
      let email = this.updateUserForm.email;
      if (email === "") {
        //输入不能为空
        this.$pcMessage("请输入邮箱");
        return false;
      } else if (!reg.test(email)) {
        //正则验证不通过，格式不对
        this.$pcMessage("请输入正确的邮箱");
        return false;
      }
      let keyStr = gbs.secret.key_str;
      let ivStr = gbs.secret.iv_str;
      email = this.$pcEncrypt.aesEncrypt(email, keyStr, ivStr);

      this.$http
        .post(`/uac/email/sendRestEmailCode`, {
          email: email
        })
        .then(response => {
          if (response && response.code === 200) {
            this.buttonDisabled = true;
            this.$pcMessage("发送验证码成功");
          }
        })
        .catch(response => {
          this.$pcMessage(response.data.message);
        });

      // this.ajax({
      //   url: `/uac/email/sendRestEmailCode`,
      //   isUnMusk: true,
      //   data: {
      //     email: email
      //   },
      //   success: (res) => {
      //     console.log(res);
      //     if (res && res.code === 200) {
      //       this.buttonDisabled = true;
      //       this.$pcMessage("发送验证码成功");
      //     }
      //     // else {
      //     //   this.$pcMessage(res.message);
      //     // }
      //   }
      // });
    },
    updateUserInfo() {
      let _this = this;
      if (!this.validate(this.updateUserForm.email, "require")) {
        alert("请填写邮箱地址");
        return;
      }
      if (!this.validate(this.updateUserForm.email, "email")) {
        alert("邮箱格式不正确");
        return;
      }

      let email = this.updateUserForm.email;
      if (!email) {
        alert("邮箱地址不能为空");
        return;
      }
      let keyStr = gbs.secret.key_str;
      let ivStr = gbs.secret.iv_str;
      email = this.$pcEncrypt.aesEncrypt(email, keyStr, ivStr);

      this.$http
        .post(`/uac/email/checkRestEmailCode`, {
          email: email,
          emailCode: _this.updateUserForm.emailCode
        })
        .then(response => {
          if (response && response.code === 200) {
            _this.ajax({
                url: `/uac/user/updateInformation`,
                isUnMusk: true,
                data: _this.updateUserForm,
                success: () => {
                  this.$pcMessage("操作成功");
                  const authToken = this.$store.getters.getAuthToken;
                  authToken.username = _this.updateUserForm.userName;
                  this.$store.dispatch("update_auth_token", authToken);
                  
                  this.loadPage("user-center");
                }
              });
          }
        })
        .catch(response => {
          this.$pcMessage(response.data.message);
        });

      // this.ajax({
      //   url: `/uac/email/checkRestEmailCode`,
      //   isUnMusk: true,
      //   data: {
      //     email: email,
      //     emailCode: _this.updateUserForm.emailCode
      //   },
      //   success: res => {
      //     if (res.code === 200) {
      //       _this.ajax({
      //         url: `/uac/user/updateInformation`,
      //         isUnMusk: true,
      //         data: _this.updateUserForm,
      //         success: () => {
      //           alert("操作成功");
      //           const authToken = this.$store.getters.getAuthToken;
      //           authToken.username = _this.updateUserForm.userName;
      //           this.$store.dispatch("update_auth_token", authToken);
      //         }
      //       });
      //     }
      //   }
      // });
    },
    queryUserInfo() {
      this.ajax({
        url: `/uac/user/getInformation`,
        success: res => {
          if (res.code === 200) {
            this.updateUserForm = res.result;
          }
        }
      });
    }
  },
  components: {}
};
</script>
<style rel="stylesheet/scss" lang="scss">
.user-info .error-item {
  position: relative;
  padding: 4px 0 4px 40px;
  margin-bottom: 10px;
  border: 1px solid red;
  color: red;
  background: #fde9e9;
}
</style>
