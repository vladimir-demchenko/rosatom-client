import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button as AButton, Checkbox, Form, Input} from 'antd';

const AuthPage = () => {
    const onFinish = () => {
        console.log('Кончил!');
    }

    return (
        <Form
            name="normal_login"
            className="login-form"
            initialValues={{remeber: true}}
            onFinish={onFinish}
        >
            <Form.Item
                name='username'
                rules={[
                    {
                        required: true,
                        message: "Пожалуйста введите вашу почту!"
                    }
                ]}
            >
                <Input prefix={<UserOutlined className='site-form-item-icon'/>} placeholder='Логин'/>
            </Form.Item>
            <Form.Item
                name='password'
                rules={[
                    {
                        required: true,
                        message: 'Пожалуйста введите ваш пароль!'
                    }
                ]}
            >
                <Input 
                    prefix={<LockOutlined className='site-form-item-icon'/>}
                    type='password'
                    placeholder='Пароль'
                />
            </Form.Item>
            <Form.Item>
                <Form.Item>
                    <AButton
                        type='primary' htmlType='submit' className='login-form-button'
                    >Войти</AButton>
                </Form.Item>
            </Form.Item>
        </Form>
    );
};

export default AuthPage;