import Footer from '@/components/Footer';
import { userLogin, userRegister } from '@/services/backend/userController';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginFormPage, ProFormText } from '@ant-design/pro-components';
import { ProFormInstance } from '@ant-design/pro-form/lib';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Helmet, history, useModel } from '@umijs/max';
import { message, Tabs } from 'antd';
import React, { useRef, useState } from 'react';
import Settings from '../../../../config/defaultSettings';

type type = 'account' | 'register' | 'forgetPassword';

const Login: React.FC = () => {
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const formRef = useRef<ProFormInstance>();
  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });

  let loginFailureCount = 0;
  let blockEndTime: number | undefined;

  const handleSubmit = async (values: API.UserRegisterRequest) => {
    const { userPassword, checkPassword } = values;
    const currentTime = Date.now();
    if (loginFailureCount >= 3) {
      if (!blockEndTime) {
        blockEndTime = currentTime + 30 * 1000;
      }
      if (currentTime < blockEndTime) {
        message.error(
          `登录失败次数过多，请${Math.ceil((blockEndTime - currentTime) / 1000)}秒后再试`,
        );
        return;
      } else {
        loginFailureCount = 0;
        blockEndTime = undefined;
      }
    }
    if (checkPassword) {
      if (userPassword !== checkPassword) {
        message.error('两次输入密码不一致！');
        return;
      }
      try {
        // 注册
        await userRegister({
          ...values,
        });

        const defaultLoginSuccessMessage = '注册成功！';
        message.success(defaultLoginSuccessMessage);
        // 切换到登录
        setType('account');
        // 重置表单
        formRef.current?.resetFields();
      } catch (error: any) {
        const defaultLoginFailureMessage = `注册失败，${error.message}`;
        message.error(defaultLoginFailureMessage);
      }
    } else {
      try {
        // 登录
        const res = await userLogin({
          ...values,
        });
        const defaultLoginSuccessMessage = '登录成功！';
        message.success(defaultLoginSuccessMessage);
        // 保存已登录用户信息
        setInitialState({
          ...initialState,
          currentUser: res.data,
        });
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      } catch (error: any) {
        const defaultLoginFailureMessage = `登录失败，${error.message}`;
        message.error(defaultLoginFailureMessage);
        loginFailureCount++;
      }
    }
  };

  return (
    <div
      className={containerClassName}
      style={{
        backgroundColor: 'white',
        height: '100vh',
      }}
    >
      <Helmet>
        <title>
          {'登录'}- {Settings.title}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginFormPage
          // backgroundImageUrl="https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*y0ZTS6WLwvgAAAAAAAAAAAAADml6AQ/fmt.webp"
          // backgroundVideoUrl="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/jXRBRK_VAwoAAAAAAAAAAAAAK4eUAQBr"
          // containerStyle={{
          //   backgroundColor: 'rgba(0, 0, 0,0.65)',
          //   backdropFilter: 'blur(4px)',
          // }}
          logo={
            <img alt="logo" style={{ height: '100%', width: '120%' }} src="/React-icon.svg.png" />
          }
          title="测试项目"
          subTitle={'快速开发属于自己的前端项目'}
          initialValues={{
            autoLogin: true,
          }}
          submitter={{
            searchConfig: {
              submitText: type === 'account' ? '登录' : '注册', // 根据当前标签页类型动态设置submitText
            },
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.UserRegisterRequest);
          }}
        >
          {
            <Tabs centered activeKey={type} onChange={(activeKey) => setType(activeKey as type)}>
              <Tabs.TabPane key={'account'} tab={'登录'} />
              <Tabs.TabPane key={'register'} tab={'注册'} />
            </Tabs>
          }
          {type === 'account' && (
            <>
              <ProFormText
                name="userAccount"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={'请输入账号'}
                rules={[
                  {
                    required: true,
                    message: '账号是必填项！',
                  },
                ]}
              />
              <ProFormText.Password
                name="userPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={'请输入密码'}
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！',
                  },
                ]}
              />
            </>
          )}

          {type === 'register' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                name="userAccount"
                placeholder={'请输入用户名'}
                rules={[
                  {
                    required: true,
                    message: '用户名是必填项！',
                  },
                  {
                    min: 4,
                    message: '长度不能少于4位！',
                  },
                ]}
              />
              <ProFormText.Password
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                name="userPassword"
                placeholder={'请输入密码'}
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！',
                  },
                  {
                    min: 8,
                    message: '长度不能少于8位！',
                  },
                ]}
              />
              <ProFormText.Password
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                name="checkPassword"
                placeholder={'请再次输入密码'}
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！',
                  },
                  {
                    min: 8,
                    message: '长度不能少于8位！',
                  },
                ]}
              />
            </>
          )}
        </LoginFormPage>
      </div>
      <Footer />
    </div>
  );
};
export default Login;
