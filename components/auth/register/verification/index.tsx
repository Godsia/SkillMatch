import {useEffect, useState, useCallback} from "react";
import {Alert, Pressable, SafeAreaView, ScrollView, Text, TextInput, View} from "react-native";
import {stylesVerification} from "../../../../styles/register/style";
import {authApi} from "../../../../services/api";

interface VerificationPageProps {
    verificationCode: string;
    setVerificationCode: (value: string) => void;
    handleGoBack: () => void;
    onVerificationSuccess: () => void;
}

export default function VerificationPage({
    verificationCode,
    setVerificationCode,
    handleGoBack,
    onVerificationSuccess
}: VerificationPageProps) {
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerifyCode = useCallback(async (code: string) => {
        setIsVerifying(true);
        try {
            const response = await authApi.verifyEmail({
                code: code,
            });
            console.log('Верификация успешна, userStatus:', response.userStatus);
            onVerificationSuccess();
        } catch (error: any) {
            console.error('Ошибка верификации:', error);
            Alert.alert(
                "Неверный код",
                error.response?.data?.message || "Код верификации неверен. Попробуйте еще раз."
            );
            setVerificationCode("");
        } finally {
            setIsVerifying(false);
        }
    }, [onVerificationSuccess, setVerificationCode]);

    useEffect(() => {
        const code = verificationCode.replace(/\D/g, "");

        // ждём пока введут 6 цифр
        if (code.length !== 6) {
            return;
        }

        if (!isVerifying) {
            handleVerifyCode(code);
        }
    }, [verificationCode, isVerifying, handleVerifyCode]);

    const handleResend = () => {
        // TODO: Реализовать повторную отправку кода
    }

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
                    />
                </View>
                <Pressable style={stylesVerification.resendButton} onPress={handleResend}>
                    <Text style={stylesVerification.resendButtonText}>Получить новый код</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    )
}
