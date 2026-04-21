import {useState} from 'react';
import {View, Pressable, Text, TextInput, ScrollView, SafeAreaView, Alert} from 'react-native';
import {stylesPassword} from "../../../../styles/register/style";
import {authApi} from "../../../../services/api";

interface PasswordPageProps {
    password: string;
    confirmPassword: string;
    passwordError: string;
    handlePasswordChange: (text: string) => void;
    handleConfirmPasswordChange: (text: string) => void;
    handleContinue: () => void;
    handleGoBack: () => void;
    isFormValid: boolean;
}

export default function PasswordPage({
    password,
    confirmPassword,
    passwordError,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleContinue,
    handleGoBack,
    isFormValid
}: PasswordPageProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordSubmit = async () => {
        if (!isFormValid) {
            return;
        }

        setIsLoading(true);
        try {
            // Устанавливаем пароль
            const response = await authApi.setPassword({
                password: password,
                confirmPassword: confirmPassword,
            });

            console.log('Пароль успешно установлен, userStatus:', response.userStatus);
            handleContinue();
        } catch (error: any) {
            console.error('Ошибка установки пароля:', error);
            Alert.alert(
                "Ошибка",
                error.response?.data?.message || "Не удалось установить пароль. Попробуйте еще раз."
            );
        } finally {
            setIsLoading(false);
        }
    };
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
                    Придумайте пароль
                </Text>
                <View style={stylesPassword.inputGroup}>
                    <Text style={stylesPassword.label}>Пароль</Text>
                    <TextInput
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
                    />
                </View>
                <View style={stylesPassword.inputGroup}>
                    <Text style={stylesPassword.label}>Подтверждение пароля</Text>
                    <TextInput
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
                    />
                    {passwordError ? (
                        <Text style={stylesPassword.errorText}>{passwordError}</Text>
                    ) : null}
                </View>
                <Pressable 
                    style={[
                        stylesPassword.continueButton,
                        (!isFormValid || isLoading) && stylesPassword.continueButtonDisabled
                    ]} 
                    onPress={handlePasswordSubmit}
                    disabled={!isFormValid || isLoading}
                >
                    <Text style={stylesPassword.continueButtonText}>
                        {isLoading ? 'Загрузка...' : 'Продолжить'}
                    </Text>
                    {!isLoading && <Text style={{ color: '#FFFFFF', fontSize: 16 }}>→</Text>}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
