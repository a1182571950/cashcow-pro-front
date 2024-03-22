import { useCallback, useState } from "react";
import { Form, Input, Button, Checkbox, message, Row } from "antd";
import { useDispatch } from "react-redux";
import MyIcon from "@/components/icon";
import { saveUser, getLocalUser, saveToken } from "@/utils";
import { setUserInfoAction } from "@/store/user/action";
import { login } from "@/api";
import { UserInfo } from "@/types"
import "./index.less";
import { useThemeToken } from "@/hooks";



const IPT_RULE_USERNAME = [
  {
    required: true,
    message: "请输入用户名",
  },
];

const IPT_RULE_PASSWORD = [
  {
    required: true,
    message: "请输入密码",
  },
];

function Login() {
  const [btnLoad, setBtnLoad] = useState(false);
  const dispatch = useDispatch()
  const setUserInfo = useCallback((info: UserInfo) => dispatch(setUserInfoAction(info)), [dispatch])
  const token = useThemeToken()
  const onFinish = useCallback((values: any) => {
    setBtnLoad(true);
    login(values)
      .then((res) => {
        const { data, msg, status, token } = res;
        setBtnLoad(false);
        if (status === 1 && !data) return;
        const info = Object.assign({ isLogin: true }, data)
        saveToken(token);
        message.success(msg);
        if (values.remember) {
          saveUser(info);
        }
        setUserInfo(info);
      })
      .catch(() => {
        setBtnLoad(false);
      });
  }, [setUserInfo]);
  return (
    <div className="login-container" style={{ backgroundColor: token.colorBgContainer }}>
      <div className="wrapper">
        <div className="title">订票系统</div>
        <div className="welcome">欢迎使用，请先登录</div>
        <Form
          className="login-form"
          initialValues={{
            remember: true,
            ...getLocalUser(),
          }}
          onFinish={onFinish}
        >
          <Form.Item name="account" rules={IPT_RULE_USERNAME}>
            <Input
              prefix={<MyIcon type="icon_nickname" />}
              placeholder="账号:admin/user"
            />
          </Form.Item>
          <Form.Item name="pswd" rules={IPT_RULE_PASSWORD}>
            <Input
              prefix={<MyIcon type="icon_locking" />}
              type="password"
              autoComplete="off"
              placeholder="密码:admin123/user123"
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住我</Checkbox>
            </Form.Item>
            <a className="login-form-forgot" href="">忘记密码</a>
          </Form.Item>
          <Row justify="space-around">
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              loading={btnLoad}
            >
              登录
            </Button>
            <Button htmlType="reset">重置</Button>
          </Row>
          <Row>
            <div className="login-form-register-box">还没有账号？<a className="login-form-register" href="">马上注册</a> 👉</div>
          </Row>
        </Form>
      </div>
      <div className="bg div-class"></div>
    </div>
  );
}

export default Login;
