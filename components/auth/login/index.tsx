import {View, Pressable, Text, TextInput, ScrollView, SafeAreaView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {stylesRegister} from "../../../styles/register/style";
import {useState} from "react";

export default function LoginPage() {
    const navigation = useNavigation();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    const handleGoBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const validateLoginForm = () => {
        const errors: {
            email?: string;
            password?: string;
        } = {};

        if (!email.trim()) {
            errors.email = "Email обязателен для заполнения";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.email = "Введите корректный email";
            }
        }

        if (!password.trim()) {
            errors.password = "Пароль обязателен для заполнения";
        } else if (password.length < 6) {
            errors.password = "Пароль должен содержать минимум 6 символов";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = () => {
        if (validateLoginForm()) {
            console.log('Вход:', { email, password });
            // navigation.navigate('NextScreen' as never);
        }
    };

    return (
        <SafeAreaView style={stylesRegister.container}>
            <Pressable 
                style={stylesRegister.backButton} 
                onPress={handleGoBack}
            >
                <Text style={stylesRegister.backButtonText}>←</Text>
            </Pressable>
            <ScrollView 
                contentContainerStyle={stylesRegister.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={stylesRegister.title}>
                    Вход
                </Text>

                <View style={stylesRegister.formContainer}>
                    {/* Email */}
                    <View style={stylesRegister.inputGroup}>
                        <Text style={stylesRegister.label}>Email</Text>
                        <TextInput
                            style={[
                                stylesRegister.input,
                                validationErrors.email && stylesRegister.inputError
                            ]}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (validationErrors.email) {
                                    setValidationErrors({ ...validationErrors, email: undefined });
                                }
                            }}
                            placeholder="example@mail.com"
                            placeholderTextColor="#999999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {validationErrors.email && (
                            <Text style={stylesRegister.errorText}>{validationErrors.email}</Text>
                        )}
                    </View>

                    {/* Пароль */}
                    <View style={stylesRegister.inputGroup}>
                        <Text style={stylesRegister.label}>Пароль</Text>
                        <TextInput
                            style={[
                                stylesRegister.input,
                                validationErrors.password && stylesRegister.inputError
                            ]}
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (validationErrors.password) {
                                    setValidationErrors({ ...validationErrors, password: undefined });
                                }
                            }}
                            placeholder="Введите пароль"
                            placeholderTextColor="#999999"
                            secureTextEntry={true}
                        />
                        {validationErrors.password && (
                            <Text style={stylesRegister.errorText}>{validationErrors.password}</Text>
                        )}
                    </View>
                </View>

                {/* Кнопка Войти */}
                <Pressable style={stylesRegister.continueButton} onPress={handleLogin}>
                    <Text style={stylesRegister.continueButtonText}>Войти</Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 16 }}>→</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
