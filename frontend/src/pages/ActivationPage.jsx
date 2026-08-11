import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, message, Result } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../api/axiosConfig';
import { ShieldCheck } from 'lucide-react';

const { Title, Text } = Typography;

export const ActivationPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('VALIDATING');
    const [loading, setLoading] = useState(false);
    const { loginWithToken, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    useEffect(() => {
        if (!token) {
            setStatus('INVALID');
            return;
        }

        const validateToken = async () => {
            try {
                await axiosInstance.get(`/v1/auth/invitation/validate?token=${token}`);
                
                if (isAuthenticated) {
                    // Already logged in, they should just accept the invite via the dashboard
                    setStatus('ALREADY_LOGGED_IN');
                } else {
                    setStatus('READY');
                }
            } catch (error) {
                setStatus('INVALID');
            }
        };

        validateToken();
    }, [token, isAuthenticated]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/v1/auth/invitation/activate', {
                token,
                firstName: values.firstName,
                lastName: values.lastName,
                password: values.password
            });
            
            const accessToken = response.data?.data?.accessToken;
            if (accessToken) {
                message.success('Account activated successfully!');
                await loginWithToken(accessToken);
                // The protected route or auth context will redirect them to their organization
                navigate('/');
            } else {
                throw new Error("Activation failed to return token");
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to activate account');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'VALIDATING') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
                    <Text type="secondary">Verifying your secure invitation...</Text>
                </div>
            </div>
        );
    }

    if (status === 'INVALID') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="max-w-md w-full text-center">
                    <Result
                        status="error"
                        title="Invalid or Expired Link"
                        subTitle="This activation link is no longer valid. Please ask your administrator to send a new invitation."
                        extra={[
                            <Button type="primary" key="home" onClick={() => navigate('/')}>
                                Go to Home
                            </Button>
                        ]}
                    />
                </Card>
            </div>
        );
    }

    const handleAcceptInvite = async () => {
        setLoading(true);
        try {
            await axiosInstance.post(`/v1/organizations/invitations/${token}/accept`);
            message.success('Successfully joined organization!');
            navigate('/');
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to accept invitation');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOutAndActivate = async () => {
        if (logout) {
            await logout();
        }
        setStatus('READY');
    };

    if (status === 'ALREADY_LOGGED_IN') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="max-w-md w-full text-center shadow-md border-0">
                    <Result
                        status="info"
                        title="You are already logged in"
                        subTitle="You currently have an active session. Would you like to accept this invitation with your current account or sign out to set up a new account?"
                        extra={[
                            <Button 
                                type="primary" 
                                key="accept" 
                                size="large"
                                loading={loading}
                                onClick={handleAcceptInvite}
                                className="w-full mb-2 bg-emerald-600 hover:bg-emerald-700"
                            >
                                Accept & Join Organization
                            </Button>,
                            <Button 
                                key="signout" 
                                size="large"
                                onClick={handleSignOutAndActivate}
                                className="w-full mb-2"
                            >
                                Sign Out & Activate New Account
                            </Button>,
                            <Button type="text" key="dash" onClick={() => navigate('/')} className="w-full text-gray-500">
                                Skip to Dashboard
                            </Button>
                        ]}
                    />
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="max-w-md w-full shadow-lg border-0">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                        <ShieldCheck size={32} />
                    </div>
                    <Title level={3} className="!mb-1">Activate Account</Title>
                    <Text type="secondary">
                        Welcome! Please complete your profile and set a secure password to join your organization.
                    </Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark={false}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="firstName"
                            label="First Name"
                            rules={[{ required: true, message: 'Please enter your first name' }]}
                        >
                            <Input prefix={<UserOutlined className="text-gray-400" />} />
                        </Form.Item>

                        <Form.Item
                            name="lastName"
                            label="Last Name"
                            rules={[{ required: true, message: 'Please enter your last name' }]}
                        >
                            <Input prefix={<UserOutlined className="text-gray-400" />} />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Please set a password' },
                            { min: 8, message: 'Password must be at least 8 characters' }
                        ]}
                        hasFeedback
                    >
                        <Input.Password prefix={<LockOutlined className="text-gray-400" />} />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Confirm Password"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Please confirm your password' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords do not match'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined className="text-gray-400" />} />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" className="w-full" size="large" loading={loading}>
                        Activate & Join
                    </Button>
                </Form>
            </Card>
        </div>
    );
};
