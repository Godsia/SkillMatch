import {useEffect} from "react";
import {Alert, Pressable, SafeAreaView, ScrollView, Text, TextInput, View} from "react-native";
import {stylesVerification} from "../../../../styles/register/style";

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
    const expectedCode = "123123"; // пример

    useEffect(() => {
        const code = verificationCode.replace(/\D/g, "");

        // ждём пока введут 6 цифр
        if (code.length !== 6) return;

        if (code === expectedCode) {
            onVerificationSuccess();
        } else {
            Alert.alert("Неверный код");
            setVerificationCode("");
        }
    }, [verificationCode, expectedCode, onVerificationSuccess, setVerificationCode]);

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
                    Введите Код Из Письма
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
