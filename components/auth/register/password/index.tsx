import {View, Pressable, Text, TextInput, ScrollView, SafeAreaView} from 'react-native';
import {stylesPassword} from "../../../../styles/register/style";

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
                        !isFormValid && stylesPassword.continueButtonDisabled
                    ]} 
                    onPress={handleContinue}
                    disabled={!isFormValid}
                >
                    <Text style={stylesPassword.continueButtonText}>Продолжить</Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 16 }}>→</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}
