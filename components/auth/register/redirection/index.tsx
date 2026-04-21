import React from 'react';
import { View, Text, Pressable, ImageBackground, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {stylesRedirect} from "../../../../styles/register/style";

export default function RedirectionPage() {
    const navigation = useNavigation();

    const handlePressRegistr = () => navigation.navigate('Registration' as never);
    const handlePressLogin = () => navigation.navigate('Authorization' as never);

    return (
        <View style={stylesRedirect.container}>
            <ImageBackground
                source={require('../../../../images/backgroundauth.jpg')}
                style={stylesRedirect.background}
                resizeMode="cover"
            >
                <View style={stylesRedirect.content}>
                    <Text style={stylesRedirect.title}>
                        Выбери Свой Путь{'\n'}Мечты В Дизайне
                    </Text>

{/*                    <Text style={stylesRedirect.subtitle}>
                        Начните с регистрации с помощью:
                    </Text>*/}

                    <View style={stylesRedirect.buttonsContainer}>
                        {/* Primary */}
                        <Pressable
                            style={({ pressed }) => [
                                stylesRedirect.actionButton,
                                stylesRedirect.actionButtonPrimary,
                                pressed && stylesRedirect.pressed,
                            ]}
                            onPress={handlePressRegistr}
                        >
                            <View style={stylesRedirect.iconCircle}>
                                <Text style={stylesRedirect.iconArrow}>→</Text>
                            </View>
                            <Text style={stylesRedirect.actionText}>
                                Зарегистрироваться{'\n'}Вручную
                            </Text>
                        </Pressable>

                        <Text style={stylesRedirect.or}>или</Text>

                        {/* Secondary */}
                        <Pressable
                            style={({ pressed }) => [
                                stylesRedirect.actionButton,
                                stylesRedirect.actionButtonSecondary,
                                pressed && stylesRedirect.pressed,
                            ]}
                            onPress={handlePressLogin}
                        >
                            <View style={stylesRedirect.iconCircle}>
                                <Text style={stylesRedirect.iconArrow}>→</Text>
                            </View>
                            <Text style={stylesRedirect.actionText}>Войти</Text>
                        </Pressable>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}