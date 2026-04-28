import {useCallback, useEffect, useMemo, useState} from "react";
import {Alert, Pressable, SafeAreaView, ScrollView, Text, TextInput, View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {stylesPassword, stylesRegister, stylesVerification} from "../../../styles/register/style";
import {authApi} from "../../../services/api";

type PasswordResetStep = 'email' | 'verification' | 'password';

export default function PasswordResetPage() {
    const navigation = useNavigation();

    const [currentStep, setCurrentStep] = useState<PasswordResetStep>('email');
    const [email, setEmail] = useState<string>("");
    const [emailError, setEmailError] = useState<string>("");
    const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);

    const [verificationCode, setVerificationCode] = useState<string>("");
    const [isVerifying, setIsVerifying] = useState<boolean>(false);

    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");
    const [isSubmittingPassword, setIsSubmittingPassword] = useState<boolean>(false);

    const validateEmail = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) {
            setEmailError("Email обязателен для заполнения");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
            setEmailError("Введите корректный email");
            return false;
        }
        setEmailError("");
        return true;
    };

    const handleSendResetEmail = async () => {
        if (!validateEmail(email)) {
            return;
        }

        setIsSendingEmail(true);
        try {
            await authApi.passwordResetInit({email: email.trim()});
            setCurrentStep('verification');
        } catch (error: any) {
            Alert.alert(
                "Ошибка",
                error.response?.data?.message || "Не удалось отправить код восстановления."
            );
        } finally {
            setIsSendingEmail(false);
        }
    };

    const validatePasswords = (pass: string, confirm: string) => {
        if (!pass || pass.length < 6) {
            setPasswordError("Пароль должен содержать минимум 6 символов");
            return false;
        }

        if (pass !== confirm) {
            setPasswordError("Пароли не совпадают");
            return false;
        }

        setPasswordError("");
        return true;
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (confirmPassword) {
            validatePasswords(text, confirmPassword);
        } else if (!text) {
            setPasswordError("");
        }
    };

    const handleConfirmPasswordChange = (text: string) => {
        setConfirmPassword(text);
        if (password) {
            validatePasswords(password, text);
        }
    };

    const isPasswordFormValid = useMemo(() => {
        return password.length >= 6 && password === confirmPassword && !passwordError;
    }, [password, confirmPassword, passwordError]);

    const handleGoBack = () => {
        if (currentStep === 'password') {
            setCurrentStep('verification');
            return;
        }
        if (currentStep === 'verification') {
            setCurrentStep('email');
            setVerificationCode("");
            return;
        }
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleVerifyCode = useCallback(async (code: string) => {
        setIsVerifying(true);
        try {
            await authApi.passwordResetVerify({code});
            setCurrentStep('password');
        } catch (error: any) {
            Alert.alert(
                "Неверный код",
                error.response?.data?.message || "Код верификации неверен. Попробуйте еще раз."
            );
            setVerificationCode("");
        } finally {
            setIsVerifying(false);
        }
    }, []);

    useEffect(() => {
        const code = verificationCode.replace(/\D/g, "");
        if (code.length !== 6 || isVerifying || currentStep !== 'verification') {
            return;
        }
        handleVerifyCode(code);
    }, [verificationCode, isVerifying, currentStep, handleVerifyCode]);

    const handleSetNewPassword = async () => {
        if (!validatePasswords(password, confirmPassword)) {
            return;
        }

        setIsSubmittingPassword(true);
        try {
            await authApi.passwordResetSetPassword({
                password,
                confirmPassword,
            });
            Alert.alert("Успешно", "Пароль обновлен. Теперь можно войти в аккаунт.");
            navigation.navigate('Authorization' as never);
        } catch (error: any) {
            Alert.alert(
                "Ошибка",
                error.response?.data?.message || "Не удалось обновить пароль. Попробуйте еще раз."
            );
        } finally {
            setIsSubmittingPassword(false);
        }
    };

    const handleResendCode = async () => {
        if (!email.trim()) {
            Alert.alert("Ошибка", "Email не найден. Вернитесь и введите email снова.");
            return;
        }

        try {
            await authApi.passwordResetInit({email: email.trim()});
            Alert.alert("Готово", "Новый код отправлен на ваш email.");
        } catch (error: any) {
            Alert.alert(
                "Ошибка",
                error.response?.data?.message || "Не удалось отправить код повторно."
            );
        }
    };

    if (currentStep === 'email') {
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
                        Восстановление пароля
                    </Text>

                    <View style={stylesRegister.formContainer}>
                        <View style={stylesRegister.inputGroup}>
                            <Text style={stylesRegister.label}>Email</Text>
                            <TextInput
                                style={[
                                    stylesRegister.input,
                                    emailError && stylesRegister.inputError
                                ]}
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (emailError) {
                                        setEmailError("");
                                    }
                                }}
                                placeholder="example@mail.com"
                                placeholderTextColor="#999999"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {emailError ? (
                                <Text style={stylesRegister.errorText}>{emailError}</Text>
                            ) : null}
                        </View>
                    </View>

                    <Pressable
                        style={[
                            stylesRegister.continueButton,
                            isSendingEmail && {opacity: 0.6}
                        ]}
                        onPress={handleSendResetEmail}
                        disabled={isSendingEmail}
                    >
                        <Text style={stylesRegister.continueButtonText}>
                            {isSendingEmail ? 'Отправка...' : 'Отправить код'}
                        </Text>
                        {!isSendingEmail && <Text style={{color: '#FFFFFF', fontSize: 16}}>→</Text>}
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (currentStep === 'verification') {
        return (
            <SafeAreaView style={stylesVerification.container}>
                <Pressable
                    style={stylesVerification.backButton}
                    onPress={handleGoBack}
                >
                    <Text style={stylesVerification.backButtonText}>←</Text>
                </Pressable>
                <ScrollView
                    contentContainerStyle={stylesVerification.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={stylesVerification.title}>
                        Введите код из письма
                    </Text>
                    <View style={stylesVerification.inputGroup}>
                        <Text style={stylesVerification.label}>Код</Text>
                        <TextInput
                            style={stylesVerification.input}
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            placeholder="_ _ _  _ _ _"
                            placeholderTextColor="#999999"
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                    </View>
                    <Pressable style={stylesVerification.resendButton} onPress={handleResendCode}>
                        <Text style={stylesVerification.resendButtonText}>Получить новый код</Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={stylesPassword.container}>
            <Pressable
                style={stylesPassword.backButton}
                onPress={handleGoBack}
            >
                <Text style={stylesPassword.backButtonText}>←</Text>
            </Pressable>
            <ScrollView
                contentContainerStyle={stylesPassword.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={stylesPassword.title}>
                    Придумайте новый пароль
                </Text>
                <View style={stylesPassword.inputGroup}>
                    <Text style={stylesPassword.label}>Пароль</Text>
                    <TextInput
                        key="reset-new-password"
                        testID="reset-new-password"
                        style={[
                            stylesPassword.input,
                            passwordError && stylesPassword.inputError
                        ]}
                        value={password}
                        onChangeText={handlePasswordChange}
                        placeholder="Введите пароль"
                        placeholderTextColor="#999999"
                        secureTextEntry={true}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="newPassword"
                        autoComplete="password-new"
                        passwordRules="minlength: 6;"
                        importantForAutofill="no"
                    />
                </View>
                <View style={stylesPassword.inputGroup}>
                    <Text style={stylesPassword.label}>Подтверждение пароля</Text>
                    <TextInput
                        key="reset-confirm-password"
                        testID="reset-confirm-password"
                        style={[
                            stylesPassword.input,
                            passwordError && stylesPassword.inputError
                        ]}
                        value={confirmPassword}
                        onChangeText={handleConfirmPasswordChange}
                        placeholder="Подтвердите пароль"
                        placeholderTextColor="#999999"
                        secureTextEntry={true}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="newPassword"
                        autoComplete="password-new"
                        passwordRules="minlength: 6;"
                        importantForAutofill="no"
                    />
                    {passwordError ? (
                        <Text style={stylesPassword.errorText}>{passwordError}</Text>
                    ) : null}
                </View>
                <Pressable
                    style={[
                        stylesPassword.continueButton,
                        (!isPasswordFormValid || isSubmittingPassword) && stylesPassword.continueButtonDisabled
                    ]}
                    onPress={handleSetNewPassword}
                    disabled={!isPasswordFormValid || isSubmittingPassword}
                >
                    <Text style={stylesPassword.continueButtonText}>
                        {isSubmittingPassword ? 'Загрузка...' : 'Сохранить пароль'}
                    </Text>
                    {!isSubmittingPassword && <Text style={{color: '#FFFFFF', fontSize: 16}}>→</Text>}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
